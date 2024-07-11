import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/authContext'; // Import the auth context

const DEFAULT_REFRESH_INTERVAL = 120000;

function Emergency() {
  const { currentUser } = useAuth(); // Get the current user from auth context
  const [isDeviceLinked, setIsDeviceLinked] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(() => {
    const savedInterval = localStorage.getItem('refreshInterval');
    return savedInterval ? parseInt(savedInterval) : DEFAULT_REFRESH_INTERVAL;
  });
  const [selectedInterval, setSelectedInterval] = useState(refreshInterval);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [isEmergencyDismissed, setIsEmergencyDismissed] = useState(() => {
    return localStorage.getItem('isEmergencyDismissed') === 'true';
  });

  const API_BASE_URL2 = process.env.REACT_APP_API_BASE_URL2;

  const checkDeviceLink = useCallback(async () => {
    if (currentUser) {
      try {
        const response = await axios.get(
          `${API_BASE_URL2}/api/checkDeviceLink/${currentUser.uid}`,
        );
        setIsDeviceLinked(response.data.isLinked);
      } catch (error) {
        console.error('Error checking device link:', error);
        setIsDeviceLinked(false);
      }
    }
  }, [API_BASE_URL2, currentUser]);

  const fetchDataFromMongoDB = useCallback(async () => {
    if (!isDeviceLinked) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL2}/api/getData/${currentUser.uid}`,
      );
      const { latestEmergency, locationHistory, emergencyHistory } =
        response.data;

      if (latestEmergency && latestEmergency.emergency) {
        if (!isEmergencyDismissed) {
          setEmergency(true);
          setEmergencyDetails(latestEmergency);
        }
      } else {
        setEmergency(false);
        setEmergencyDetails(null);
      }

      setLocationHistory(locationHistory.slice(0, 10));
      setEmergencyHistory(emergencyHistory);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
    }
  }, [API_BASE_URL2, isDeviceLinked, currentUser, isEmergencyDismissed]);

  useEffect(() => {
    checkDeviceLink();
  }, [checkDeviceLink]);

  useEffect(() => {
    if (isDeviceLinked) {
      fetchDataFromMongoDB();

      const intervalId = setInterval(() => {
        fetchDataFromMongoDB();
      }, refreshInterval);

      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchDataFromMongoDB, isDeviceLinked]);

  const handleRefreshIntervalChange = (event) => {
    setSelectedInterval(Number(event.target.value));
  };

  const applyRefreshInterval = () => {
    setRefreshInterval(selectedInterval);
    localStorage.setItem('refreshInterval', selectedInterval.toString());
  };

  const handleCloseEmergency = () => {
    setEmergency(false);
    setIsEmergencyDismissed(true);
    localStorage.setItem('isEmergencyDismissed', 'true');
    // You might also want to update your backend or perform other actions here
  };
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
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-4 mt-20 max-w-6xl">
      {emergency && (
        <div className="bg-red-600 text-white p-4 mb-4 rounded-lg relative">
          <button
            onClick={handleCloseEmergency}
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

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          emergency ? 'h-[30rem] lg:h-[25rem]' : 'h-[40rem] lg:h-[35rem]'
        }`}
      >
        <div className="bg-white shadow-md rounded-lg p-4 overflow-hidden">
          <h2 className="text-2xl font-bold mb-3 lg:ml-8 ml-10">
            Location History
          </h2>
          <div className="flex items-center flex-wrap">
            <label htmlFor="refreshInterval" className="lg:ml-8  mb-2 pr-1">
              Refresh Interval:
            </label>
            <select
              id="refreshInterval"
              value={selectedInterval}
              onChange={handleRefreshIntervalChange}
              className="border p-1 rounded mr-1 mb-2"
            >
              <option value={30000}>30 seconds</option>
              <option value={120000}>2 minutes</option>
              <option value={300000}>5 minutes</option>
              <option value={600000}>10 minutes</option>
            </select>
            <button
              onClick={applyRefreshInterval}
              className="bg-[#1f5b7a] hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mb-2"
            >
              ✓
            </button>
          </div>
          <p className="mb-2 lg:ml-8">
            Last updated: {lastUpdateTime.toLocaleString()}
          </p>
          <ul className="space-y-2 max-h-96 min-h-[24rem] overflow-y-auto pr-8">
            {locationHistory.map((location, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded">
                <p className="break-words">
                  Latitude: {location.latitude}, Longitude: {location.longitude}
                </p>
                <p className="break-words">Address: {location.address}</p>
                <p className="text-sm text-gray-600">
                  {new Date(location.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 overflow-hidden">
          <h2 className="text-2xl font-bold mb-2 lg:ml-8 ml-6">
            Emergency History
          </h2>
          <p className="lg:ml-8">
            Last updated: {lastUpdateTime.toLocaleString()}
          </p>
          {emergencyHistory && emergencyHistory.length > 0 ? (
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
