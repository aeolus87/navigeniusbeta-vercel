import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Coordinates = ({ userLocation, companionLocation, distance, markerIcon }) => {
  return (
    <div className="text-white overflow-hidden h-auto lg:relative top-2 lg:ml-8 ml-4 border-white bg-[#776e6e9e] shadow-2xl lg:max-w-72 max-w-[93%] rounded-xl lg:mt-6 mt-12 mb-11 py-3 lg:py-5">
      <div className="mx-3 mt-2">Device Longitude: <span>{companionLocation?.Longitude || 'Fetching...'}</span></div>
      <div className="mx-3 mt-2">Device Latitude: <span>{companionLocation?.Latitude || 'Fetching...'}</span></div>
      <br />
      <div className="mx-3 mt-2">Current Longitude: <span>{userLocation?.[1] || 'Fetching...'}</span></div>
      <div className="mx-3 mt-2">Current Latitude: <span>{userLocation?.[0] || 'Fetching...'}</span></div>
      <br />
      <div className="mx-3 mt-2">Distance: <span>{distance || '...'}</span></div>
    </div>
  );
};

export default Coordinates;
