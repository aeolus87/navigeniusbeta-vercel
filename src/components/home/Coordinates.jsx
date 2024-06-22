import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Coordinates = ({
  userLocation,
  companionLocation,
  distance,
  markerIcon,
}) => {
  const [userAddress, setUserAddress] = useState('Fetching...');
  const [deviceAddress, setDeviceAddress] = useState('Fetching...');

  const fetchAddress = async (lat, lon, setter) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      );
      const data = await response.json();
      setter(data.display_name || 'Address not found');
    } catch (error) {
      console.error('Error fetching address:', error);
      setter('Error fetching address');
    }
  };

  useEffect(() => {
    if (userLocation && userLocation[0] && userLocation[1]) {
      fetchAddress(userLocation[0], userLocation[1], setUserAddress);
    }
  }, [userLocation]);

  useEffect(() => {
    if (
      companionLocation &&
      companionLocation.Latitude &&
      companionLocation.Longitude
    ) {
      fetchAddress(
        companionLocation.Latitude,
        companionLocation.Longitude,
        setDeviceAddress,
      );
    }
  }, [companionLocation]);

  return (
    <div className="text-white overflow-hidden h-auto lg:relative top-2 lg:ml-8 ml-4 border-white bg-[#776e6e9e] shadow-2xl lg:max-w-72 max-w-[93%] rounded-xl lg:mt-6 mt-12 mb-11 py-3 lg:py-5 lg:text-[1rem] text-[0.8rem]">
      <div className="mx-3 mt-2">
        Device Longitude:{' '}
        <span>{companionLocation?.Longitude || 'Fetching...'}</span>
      </div>
      <div className="mx-3 mt-2">
        Device Latitude:{' '}
        <span>{companionLocation?.Latitude || 'Fetching...'}</span>
      </div>
      <div className="mx-3 mt-2">
        Device Address: <span>{deviceAddress}</span>
      </div>
      <br />
      <div className="mx-3 mt-2">
        Current Longitude: <span>{userLocation?.[1] || 'Fetching...'}</span>
      </div>
      <div className="mx-3 mt-2">
        Current Latitude: <span>{userLocation?.[0] || 'Fetching...'}</span>
      </div>
      <div className="mx-3 mt-2">
        Current Address: <span>{userAddress}</span>
      </div>
      <br />
      <div className="mx-3 mt-2">
        Distance: <span>{distance || '...'}</span>
      </div>
    </div>
  );
};

export default Coordinates;
