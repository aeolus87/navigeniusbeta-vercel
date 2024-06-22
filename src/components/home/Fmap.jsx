import React, { useEffect, useState, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import Coordinates from './Coordinates';

const firebaseConfig = {
  apiKey: `${process.env.REACT_APP_API_KEY}`,
  authDomain: `${process.env.REACT_APP_AUTH_DOMAIN}`,
  databaseURL: `${process.env.REACT_APP_DATABASE_URL}`,
  projectId: `${process.env.REACT_APP_PROJECT_ID}`,
  storageBucket: `${process.env.REACT_APP_STORAGE_BUCKET}`,
  messagingSenderId: `${process.env.REACT_APP_MESSAGING_SENDER_ID}`,
  appId: `${process.env.REACT_APP_APP_ID}`,
};

initializeApp(firebaseConfig);

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

function Fmap() {
  const [userLocation, setUserLocation] = useState(null);
  const [companionLocation, setCompanionLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState(null);
  const [latitudeFilter] = useState(() => new KalmanFilter());
  const [longitudeFilter] = useState(() => new KalmanFilter());
  const [dgpsCorrections, setDgpsCorrections] = useState({ lat: 0, lon: 0 });

  const toRadians = useCallback((degrees) => {
    return (degrees * Math.PI) / 180;
  }, []);

  const getHaversineDistance = useCallback(
    (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c * 1000; // Convert to meters
    },
    [toRadians],
  );

  const getCompanionLocation = useCallback(() => {
    const database = getDatabase();
    const databaseRef = ref(database, 'Device/Locator');
    onValue(databaseRef, (snapshot) => {
      const location = snapshot.val();
      setCompanionLocation(location);
      localStorage.setItem('long_val', location.Longitude);
      localStorage.setItem('lat_val', location.Latitude);
    });

    return () => off(databaseRef);
  }, []);

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
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
      }

      attempt();
    });
  }, []);

  const fetchDGPSCorrections = useCallback(async () => {
    // In a real scenario, you'd fetch this data from a DGPS service
    // This is a simplified simulation
    const simulatedCorrections = {
      lat: (Math.random() - 0.5) * 0.0001, // Simulate corrections in the range of ±5 meters
      lon: (Math.random() - 0.5) * 0.0001,
    };
    setDgpsCorrections(simulatedCorrections);
  }, []);

  const getBestLocation = useCallback(async () => {
    try {
      const position = await getLocationWithRetry();
      const rawLat = position.coords.latitude;
      const rawLon = position.coords.longitude;

      // Apply DGPS corrections
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
  }, [latitudeFilter, longitudeFilter, getLocationWithRetry, dgpsCorrections]);

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
    const cleanupCompanion = getCompanionLocation();

    const updateInterval = setInterval(() => {
      fetchDGPSCorrections();
      getBestLocation();
      getDistance();
    }, 10000); // Update every 10 seconds

    return () => {
      cleanupCompanion();
      clearInterval(updateInterval);
    };
  }, [
    getCompanionLocation,
    getBestLocation,
    getDistance,
    fetchDGPSCorrections,
  ]);

  return (
    <div className="map-container">
      <Coordinates
        userLocation={userLocation}
        companionLocation={companionLocation}
        distance={distance}
        error={error}
        dgpsCorrections={dgpsCorrections}
      />
    </div>
  );
}

export default Fmap;
