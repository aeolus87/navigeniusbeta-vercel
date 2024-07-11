import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import Coordinates from './Coordinates';
import _ from 'lodash';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { app } from '../../firebase/firebase';

function KalmanFilter() {
  this.Q = 1;
  this.R = 1;
  this.P = 0;
  this.X = 0;
  this.K = 0;

  this.filter = function (measurement) {
    this.P = this.P + this.Q;
    this.K = this.P / (this.P + this.R);
    this.X = this.X + this.K * (measurement - this.X);
    this.P = (1 - this.K) * this.P;
    return this.X;
  };
}

const Fmap = React.memo(() => {
  const [userLocation, setUserLocation] = useState(null);
  const [companionLocation, setCompanionLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState(null);
  const latitudeFilter = useMemo(() => new KalmanFilter(), []);
  const longitudeFilter = useMemo(() => new KalmanFilter(), []);
  const [dgpsCorrections, setDgpsCorrections] = useState({ lat: 0, lon: 0 });
  const auth = getAuth(app);
  const user = auth.currentUser;
  const toRadians = useCallback((degrees) => (degrees * Math.PI) / 180, []);
  const [device_id, setDeviceId] = useState(null);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          setDeviceId(docSnapshot.data().device_id);
        }
      });
    }
  }, [user]);

  const getHaversineDistance = useCallback(
    (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c * 1000;
    },
    [toRadians],
  );

  const getCompanionLocation = useCallback(() => {
    if (!device_id) return () => {};

    const database = getDatabase(app);
    const databaseRef = ref(database, `Devices/${device_id}`);
    const throttledHandler = _.throttle((snapshot) => {
      const location = snapshot.val();
      setCompanionLocation(location);
      localStorage.setItem('long_val', location.Longitude);
      localStorage.setItem('lat_val', location.Latitude);
    }, 1000);

    const unsubscribe = onValue(databaseRef, throttledHandler);

    return unsubscribe;
  }, [device_id]);

  const getLocationWithRetry = useCallback((maxRetries = 3, delay = 2000) => {
    return new Promise((resolve, reject) => {
      let retries = 0;

      function attempt() {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            if (retries < maxRetries) {
              retries++;
              setTimeout(attempt, delay);
            } else {
              reject(error);
            }
          },
          { enableHighAccuracy: true, timeout: 30000, maximumAge: 30000 },
        );
      }

      attempt();
    });
  }, []);

  const fetchDGPSCorrections = useCallback(() => {
    const simulatedCorrections = {
      lat: (Math.random() - 0.5) * 0.0001,
      lon: (Math.random() - 0.5) * 0.0001,
    };
    setDgpsCorrections(simulatedCorrections);
  }, []);

  const getBestLocation = useCallback(async () => {
    try {
      const position = await getLocationWithRetry();
      const rawLat = position.coords.latitude;
      const rawLon = position.coords.longitude;

      const correctedLat = rawLat + dgpsCorrections.lat;
      const correctedLon = rawLon + dgpsCorrections.lon;

      const filteredLat = latitudeFilter.filter(correctedLat);
      const filteredLong = longitudeFilter.filter(correctedLon);

      setUserLocation([filteredLat, filteredLong]);
      localStorage.setItem('c_lat', filteredLat);
      localStorage.setItem('c_long', filteredLong);
    } catch (geoError) {
      console.error('Geolocation failed:', geoError);
      try {
        const response = await fetch('https://ipapi.co/json/');
        const location = await response.json();
        setUserLocation([location.latitude, location.longitude]);
        localStorage.setItem('c_lat', location.latitude);
        localStorage.setItem('c_long', location.longitude);
      } catch (ipError) {
        console.error('IP-based location failed:', ipError);
        setError('Failed to get location');
      }
    }
  }, [latitudeFilter, longitudeFilter, dgpsCorrections, getLocationWithRetry]);

  const getDistance = useCallback(() => {
    const lat1 = localStorage.getItem('c_lat');
    const lon1 = localStorage.getItem('c_long');
    const lat2 = localStorage.getItem('lat_val');
    const lon2 = localStorage.getItem('long_val');

    if (!lat1 || !lon1 || !lat2 || !lon2) {
      console.warn('Missing location data for distance calculation.');
      return;
    }

    const d = getHaversineDistance(
      parseFloat(lat1),
      parseFloat(lon1),
      parseFloat(lat2),
      parseFloat(lon2),
    ).toFixed(2);

    localStorage.setItem('distance', d);
    setDistance(d);
  }, [getHaversineDistance]);

  useEffect(() => {
    const unsubscribeCompanion = getCompanionLocation();

    const throttledGetBestLocation = _.throttle(getBestLocation, 1000);
    const debouncedGetDistance = _.debounce(getDistance, 1000);
    const debouncedFetchDGPSCorrections = _.debounce(
      fetchDGPSCorrections,
      1000,
    );

    const updateInterval = setInterval(() => {
      debouncedFetchDGPSCorrections();
      throttledGetBestLocation();
      debouncedGetDistance();
    }, 30000);

    return () => {
      unsubscribeCompanion();
      clearInterval(updateInterval);
      throttledGetBestLocation.cancel();
      debouncedGetDistance.cancel();
      debouncedFetchDGPSCorrections.cancel();
    };
  }, [
    getCompanionLocation,
    getBestLocation,
    getDistance,
    fetchDGPSCorrections,
  ]);

  const memoizedCoordinates = useMemo(
    () => (
      <Coordinates
        userLocation={userLocation}
        companionLocation={companionLocation}
        distance={distance}
        error={error}
        dgpsCorrections={dgpsCorrections}
      />
    ),
    [userLocation, companionLocation, distance, error, dgpsCorrections],
  );

  return <div className="map-container">{memoizedCoordinates}</div>;
});

export default Fmap;
