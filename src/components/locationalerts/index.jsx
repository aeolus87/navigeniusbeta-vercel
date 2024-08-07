import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/authContext';
import { debounce } from 'lodash';
import Loader from '../Loader';

function Emergency() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeviceLinked, setIsDeviceLinked] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [lastDismissedEmergencyTimestamp, setLastDismissedEmergencyTimestamp] =
    useState(() => {
      return localStorage.getItem('lastDismissedEmergencyTimestamp') || 0;
    });
  const [isLocationHistoryLoading, setIsLocationHistoryLoading] = useState(true);
  const [isEmergencyHistoryLoading, setIsEmergencyHistoryLoading] = useState(true);

  const API_BASE_URL2 = process.env.REACT_APP_API_BASE_URL2;

  const checkDeviceLink = useCallback(async () => {
    if (currentUser) {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL2}/api/checkDeviceLink/${currentUser.uid}`,
        );
        setIsDeviceLinked(response.data.isLinked);
      } catch (error) {
        console.error('Error checking device link:', error);
        setIsDeviceLinked(false);
      } finally {
        setIsLoading(false);
      }
    }
  }, [API_BASE_URL2, currentUser]);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      return response.data.display_name;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Address not available';
    }
  };

  const fetchDataFromMongoDB = useCallback(async () => {
    if (!isDeviceLinked) return;

    setIsLocationHistoryLoading(true);
    setIsEmergencyHistoryLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL2}/api/getData/${currentUser.uid}`,
      );
      const { latestEmergency, locationHistory, emergencyHistory } =
        response.data;

      if (latestEmergency && latestEmergency.emergency) {
        const emergencyTimestamp = new Date(latestEmergency.timestamp).getTime();
        if (emergencyTimestamp > lastDismissedEmergencyTimestamp) {
          setEmergency(true);
          setEmergencyDetails(latestEmergency);
        }
      } else {
        setEmergency(false);
        setEmergencyDetails(null);
      }

      // Reverse geocode locations
      const updatedLocationHistory = await Promise.all(
        locationHistory.slice(0, 10).map(async (location) => {
          const address = await reverseGeocode(location.latitude, location.longitude);
          return { 
            ...location, 
            address,
            storedAt: location.storedAt || location.timestamp // fallback to timestamp if storedAt is not available
          };
        })
      );
      setLocationHistory(updatedLocationHistory);
      setEmergencyHistory(emergencyHistory);
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
    } finally {
      setIsLocationHistoryLoading(false);
      setIsEmergencyHistoryLoading(false);
    }
  }, [
    API_BASE_URL2,
    isDeviceLinked,
    currentUser,
    lastDismissedEmergencyTimestamp,
  ]);

  useEffect(() => {
    checkDeviceLink();
  }, [checkDeviceLink]);

  useEffect(() => {
    if (isDeviceLinked) {
      fetchDataFromMongoDB();
      const intervalId = setInterval(() => {
        fetchDataFromMongoDB();
      }, 30000);
      return () => clearInterval(intervalId);
    }
  }, [fetchDataFromMongoDB, isDeviceLinked]);

  const handleCloseEmergency = useCallback(() => {
    setEmergency(false);
    const currentTimestamp = Date.now();
    setLastDismissedEmergencyTimestamp(currentTimestamp);
    localStorage.setItem(
      'lastDismissedEmergencyTimestamp',
      currentTimestamp.toString(),
    );
  }, []);

  const debouncedHandleCloseEmergency = useMemo(
    () => debounce(handleCloseEmergency),
    [handleCloseEmergency],
  );

  if (isLoading) {
    return <div><Loader /></div>;
  }

  if (!isDeviceLinked) {
    return (
      <div className="container mx-auto p-4 mt-20 max-w-6xl">
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
          role="alert"
        >
          <p className="font-bold">No Device Linked</p>
          <p>
            Please link a device to access the emergency and location history.
          </p>
          <p className="font-bold">
            Go to Dashboard page to link your GPS device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-20 max-w-6xl">
      {emergency && (
        <div className="bg-red-600 text-white p-4 mb-4 rounded-lg relative">
          <button
            onClick={() => debouncedHandleCloseEmergency()}
            className="absolute top-2 right-2 text-white hover:text-gray-200"
            aria-label="Close emergency alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h2 className="text-2xl font-bold">EMERGENCY ALERT</h2>
          <p>An emergency has been reported!</p>
          {emergencyDetails && (
            <p>
              Timestamp: {new Date(emergencyDetails.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      )}

<div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
        emergency ? 'h-[30rem] lg:h-[25rem]' : 'h-[40rem] lg:h-[35rem]'
      }`}>
        <div className="bg-white shadow-md rounded-lg p-4 overflow-hidden">
  <h2 className="text-2xl font-bold mb-3 lg:ml-8 ml-10">
    Location History
  </h2>
  {isLocationHistoryLoading ? (
    <div className="flex justify-center items-center h-full">
      <Loader />
    </div>
  ) : (
    <ul className="space-y-2 max-h-96 min-h-[24rem] overflow-y-auto pr-8">
      {locationHistory.map((location, index) => (
        <li key={index} className="bg-gray-100 p-2 rounded">
          <p className="break-words">
            Latitude: {location.latitude}, Longitude: {location.longitude}
          </p>
          <p className="break-words">Address: {location.address}</p>
          <p className="text-sm text-gray-600">
  Stored at: {new Date(location.timestamp).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true // This will use AM/PM format
  })}
</p>
        </li>
      ))}
    </ul>
  )}
</div>

        <div className="bg-white shadow-md rounded-lg p-4 overflow-hidden">
          <h2 className="text-2xl font-bold mb-2 lg:ml-8 ml-6">
            Emergency History
          </h2>
          {isEmergencyHistoryLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader />
            </div>
          ) : emergencyHistory && emergencyHistory.length > 0 ? (
            <ul className="space-y-2 max-h-96 min-h-[24rem] overflow-y-auto pr-8">
              {emergencyHistory.map((emergency) => (
                <li key={emergency._id} className="bg-red-100 p-2 rounded">
                  <p>Emergency alert activated!</p>
                  <p className="text-sm text-gray-600">
                    Timestamp: {new Date(emergency.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ml-8">No emergency history.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Emergency;