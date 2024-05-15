import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; 
import 'leaflet/dist/leaflet.css';
import './map.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const Map = () => {
  const defaultCenter = [0, 0];
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [navigeniusLocation, setNavigeniusLocation] = useState(defaultCenter);
  const watchIdRef = useRef(null);
  const defaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    const getCoordinates = (key) => {
      const value = localStorage.getItem(key);
      return parseFloat(value) || 0;
    };

    const center = [getCoordinates("c_lat"), getCoordinates("c_long")];
    if (!center[0] || !center[1]) {
      console.warn("Unable to retrieve valid location data from localStorage. Using default center.");
    } else {
      setUserLocation(center);
    }

    const navigeniusCoords = [getCoordinates("lat_val"), getCoordinates("long_val")];
    setNavigeniusLocation(navigeniusCoords);

    const watchUserLocation = () => {
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition((position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        });
      } else {
        console.warn("Geolocation not supported by browser.");
      }
    };

    watchUserLocation();

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo(userLocation, 13);
    }
  }, [userLocation]);

  return (
    
    <MapContainer center={userLocation} zoom={13} zoomControl={false} ref={mapRef} className="map-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
<Marker position={userLocation} icon={defaultIcon}>
  <Popup>You are here!</Popup>
</Marker>
<Marker position={navigeniusLocation} icon={defaultIcon}>
  <Popup>Navigenius is here!</Popup>
</Marker>
    </MapContainer>
  );
};

export default Map;
