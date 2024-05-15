import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import Coordinates from './Coordinates';



const firebaseConfig = {
  apiKey: "AIzaSyDinVQtDmFkbO90uhKcciMYCs7yq2wJ_1g",
  authDomain: "navigenius-439ed.firebaseapp.com",
  databaseURL: "https://navigenius-439ed-default-rtdb.firebaseio.com",
  projectId: "navigenius-439ed",
  storageBucket: "navigenius-439ed.appspot.com",
  messagingSenderId: "40052314225",
  appId: "1:40052314225:web:a2163b1cb96d27146e0bd0"
};

initializeApp(firebaseConfig);

function Fmap() {
  const [userLocation, setUserLocation] = useState(null);
  const [companionLocation, setCompanionLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const toRadians = (degrees) => {
      return degrees * Math.PI / 180;
    };

    const getCompanionLocation = async () => {
      try {
        const database = getDatabase();
        const databaseRef = ref(database, 'Device/Locator');
        onValue(databaseRef, (snapshot) => {
          const location = snapshot.val();
          setCompanionLocation(location);
          window.localStorage.setItem("long_val", location.Longitude);
          window.localStorage.setItem("lat_val", location.Latitude);
        });
      } catch (error) {
        console.error('Error fetching companion location:', error);
        setError(error.message);
      }
    };

    const getCurrentLocation = async () => {
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.watchPosition(resolve, reject);
          });
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          window.localStorage.setItem("c_lat", position.coords.latitude);
          window.localStorage.setItem("c_long", position.coords.longitude);
        } catch (error) {
          console.error('Error getting current location:', error);
          setError(error.message); 
        }
      } else {
        console.warn("Geolocation is not supported by browser.");
      }
    };

    const getDistance = async () => {
      const lat1 = window.localStorage.getItem("c_lat");
      const lon1 = window.localStorage.getItem("c_long");
      const lat2 = window.localStorage.getItem("lat_val");
      const lon2 = window.localStorage.getItem("long_val");

      if (!lat1 || !lon1 || !lat2 || !lon2) {
        console.warn("Missing location data for distance calculation.");
        return;
      }

      const R = 6371; 
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = (R * c * 1000).toFixed(2); 

      window.localStorage.setItem("distance", d);
      setDistance(d);
    };

    getCompanionLocation();
    getCurrentLocation();
    getDistance();

    const intervalId = setInterval(async () => {
      await getCompanionLocation();
      await getCurrentLocation();
      await getDistance();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="map-container">
      <Coordinates
        userLocation={userLocation}
        companionLocation={companionLocation}
        distance={distance} // Pass distance to Coordinates component
        error={error} // Pass error to Coordinates component
      />
    </div>
  );
}

export default Fmap;
