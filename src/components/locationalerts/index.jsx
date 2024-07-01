import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const DEFAULT_REFRESH_INTERVAL = 120000; // Default refresh interval in milliseconds

function Emergency() {
  const [emergency, setEmergency] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(
    DEFAULT_REFRESH_INTERVAL,
  ); // State for refresh interval
  const [selectedInterval, setSelectedInterval] = useState(
    DEFAULT_REFRESH_INTERVAL,
  ); // State for selected refresh interval

  const API_BASE_URL2 = process.env.REACT_APP_API_BASE_URL2;

  // Function to fetch data from MongoDB
  const fetchDataFromMongoDB = useCallback(async () => {
    try {
      console.log('Fetching data from MongoDB...');
      const response = await axios.get(`${API_BASE_URL2}/api/getData`, {
        params: { timestamp: new Date().getTime() }, // Add a timestamp to prevent caching
      });
      const { latestEmergency, locationHistory, emergencyHistory } =
        response.data;

      console.log('Data fetched:', {
        latestEmergency,
        locationHistory,
        emergencyHistory,
      });

      // Update state with new data
      setLocationHistory(locationHistory);
      setEmergencyHistory(emergencyHistory);

      // Check if there's an active emergency alert
      if (latestEmergency && latestEmergency.emergency) {
        setEmergency(true);
        setEmergencyDetails(latestEmergency);
        alert('Emergency alert received!'); // Example of an alert, you may modify this behavior
      } else {
        setEmergency(false);
        setEmergencyDetails(null);
      }
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
      // Optionally, you can set an error state here to display to the user
      // setError('Failed to fetch data. Please try again later.');
    }
  }, [API_BASE_URL2]);

  // Effect to fetch data initially and setup interval for periodic fetching
  useEffect(() => {
    console.log('Setting up interval with', refreshInterval, 'ms');
    fetchDataFromMongoDB(); // Initial fetch
    const dataInterval = setInterval(fetchDataFromMongoDB, refreshInterval);

    // Cleanup interval on component unmount or interval change
    return () => clearInterval(dataInterval);
  }, [fetchDataFromMongoDB, refreshInterval]);

  // Handle interval change
  const handleIntervalChange = (event) => {
    setSelectedInterval(parseInt(event.target.value, 10));
  };

  // Handle interval update
  const handleUpdateInterval = () => {
    setRefreshInterval(selectedInterval);
  };

  return (
    <div>
      <h1>Emergency Management</h1>
      <p>Emergency Status: {emergency ? 'Active' : 'Inactive'}</p>
      {emergencyDetails && (
        <div>
          <h3>Emergency Details</h3>
          <p>Timestamp: {emergencyDetails.timestamp}</p>
          <p>Emergency Message: {emergencyDetails.message}</p>
        </div>
      )}
      <h3>Location History</h3>
      <ul>
        {locationHistory.map((location, index) => (
          <li key={index}>
            Latitude: {location.latitude}, Longitude: {location.longitude},{' '}
            Timestamp: {location.timestamp}
          </li>
        ))}
      </ul>
      <h3>Emergency History</h3>
      <ul>
        {emergencyHistory.map((emergency, index) => (
          <li key={index}>
            Emergency Status: {emergency.emergency ? 'Active' : 'Inactive'},{' '}
            Timestamp: {emergency.timestamp}
          </li>
        ))}
      </ul>
      <div>
        <label>
          Select Refresh Interval (ms):
          <input
            type="number"
            value={selectedInterval}
            onChange={handleIntervalChange}
          />
        </label>
        <button onClick={handleUpdateInterval}>Update Interval</button>
      </div>
    </div>
  );
}

export default Emergency;
