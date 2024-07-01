import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../../firebase/firebase';
import axios from 'axios';

const DEFAULT_REFRESH_INTERVAL = 120000;

function Emergency() {
  const [emergency, setEmergency] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(() => {
    const savedInterval = localStorage.getItem('refreshInterval');
    return savedInterval ? parseInt(savedInterval) : DEFAULT_REFRESH_INTERVAL;
  });
  const [selectedInterval, setSelectedInterval] = useState(refreshInterval);

  const API_BASE_URL2 = process.env.REACT_APP_API_BASE_URL2;

  const latestDataRef = useRef({ locationHistory: [], emergencyHistory: [] });

  const storeDataInMongoDB = useCallback(
    async (data) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL2}/api/storeData`,
          data,
        );
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error storing data in MongoDB:', error);
        console.log(
          'Error details:',
          error.response ? error.response.data : 'No response data',
        );
      }
    },
    [API_BASE_URL2],
  );

  const fetchDataFromMongoDB = useCallback(async () => {
    try {
      console.log('Fetching data from MongoDB...'); // Debug log
      const response = await axios.get(`${API_BASE_URL2}/api/getData`);
      const { latestEmergency, locationHistory, emergencyHistory } =
        response.data;

      console.log('Data fetched:', {
        latestEmergency,
        locationHistory,
        emergencyHistory,
      }); // Debug log

      if (latestEmergency && latestEmergency.emergency) {
        setEmergency(true);
        setEmergencyDetails(latestEmergency);
      } else {
        setEmergency(false);
        setEmergencyDetails(null);
      }

      // Compare new data with the latest data we have
      if (
        JSON.stringify(locationHistory) !==
        JSON.stringify(latestDataRef.current.locationHistory)
      ) {
        setLocationHistory(locationHistory);
        latestDataRef.current.locationHistory = locationHistory;
        console.log('Location history updated'); // Debug log
      }

      if (
        JSON.stringify(emergencyHistory) !==
        JSON.stringify(latestDataRef.current.emergencyHistory)
      ) {
        setEmergencyHistory(emergencyHistory);
        latestDataRef.current.emergencyHistory = emergencyHistory;
        console.log('Emergency history updated'); // Debug log
      }
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
    }
  }, [API_BASE_URL2]);

  const fetchLocation = useCallback(() => {
    const db = getDatabase(app);
    const locationRef = ref(db, 'Device/Locator');

    onValue(
      locationRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const newLocation = {
            latitude: data.Latitude,
            longitude: data.Longitude,
            timestamp: new Date().toISOString(),
          };
          setLocationHistory((prevHistory) => {
            const updatedHistory = [
              newLocation,
              ...(prevHistory || []).slice(0, 9),
            ];
            latestDataRef.current.locationHistory = updatedHistory;
            return updatedHistory;
          });
          storeDataInMongoDB({ type: 'location', ...newLocation }).catch(
            (error) => {
              console.error('Error storing data in MongoDB:', error);
            },
          );
        }
      },
      { onlyOnce: true },
    );
  }, [storeDataInMongoDB]);

  const fetchData = useCallback(() => {
    console.log('Fetching data...'); // Debug log
    fetchLocation();
    fetchDataFromMongoDB();
  }, [fetchLocation, fetchDataFromMongoDB]);

  useEffect(() => {
    const db = getDatabase(app);
    const emergencyRef = ref(db, 'Device/Locator/emergency');

    const emergencyUnsubscribe = onValue(emergencyRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.emergency) {
        setEmergency(true);
        setEmergencyDetails(data);
        alert('Emergency alert received!');
        storeDataInMongoDB({ type: 'emergency', ...data });
      } else {
        setEmergency(false);
        setEmergencyDetails(null);
      }
    });

    return () => {
      emergencyUnsubscribe();
    };
  }, [storeDataInMongoDB]);

  useEffect(() => {
    console.log('Setting up interval with', refreshInterval, 'ms'); // Debug log
    fetchData(); // Initial fetch
    const dataInterval = setInterval(fetchData, refreshInterval);

    return () => {
      console.log('Clearing interval'); // Debug log
      clearInterval(dataInterval);
    };
  }, [refreshInterval, fetchData]);

  const handleRefreshIntervalChange = (event) => {
    setSelectedInterval(Number(event.target.value));
  };

  const applyRefreshInterval = () => {
    setRefreshInterval(selectedInterval);
    localStorage.setItem('refreshInterval', selectedInterval.toString());
    fetchData(); // Force an immediate data fetch when the interval changes
  };
  return (
    <div className="container mx-auto p-4 mt-20 max-w-6xl">
      {emergency && (
        <div className="bg-red-600 text-white p-4 mb-4 rounded-lg">
          <h2 className="text-2xl font-bold">EMERGENCY ALERT</h2>
          <p>An emergency has been reported!</p>
          {emergencyDetails && (
            <p>
              Timestamp: {new Date(emergencyDetails.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow-md rounded-lg p-4 overflow-hidden">
          <h2 className="text-2xl font-bold mb-4">Location History</h2>
          <div className="mb-4 flex items-center flex-wrap">
            <label htmlFor="refreshInterval" className="mr-2 mb-2">
              Refresh Interval:
            </label>
            <select
              id="refreshInterval"
              value={selectedInterval}
              onChange={handleRefreshIntervalChange}
              className="border p-1 rounded mr-2 mb-2"
            >
              <option value={30000}>30 seconds</option>
              <option value={120000}>2 minutes</option>
              <option value={300000}>5 minutes</option>
              <option value={600000}>10 minutes</option>
            </select>
            <button
              onClick={applyRefreshInterval}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mb-2"
            >
              Apply
            </button>
          </div>
          <ul className="space-y-2 max-h-96 overflow-y-auto mr-8">
            {locationHistory &&
              locationHistory.map((location, index) => (
                <li key={index} className="bg-gray-100 p-2 rounded">
                  <p className="break-words">
                    Latitude: {location.latitude}, Longitude:{' '}
                    {location.longitude}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(location.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
          </ul>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-2xl font-bold mb-4">Emergency History</h2>
          {emergencyHistory && emergencyHistory.length > 0 ? (
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {emergencyHistory.map((emergency) => (
                <li key={emergency._id} className="bg-red-100 p-2 mr-8 rounded">
                  <p>Emergency alert activated!</p>
                  <p className="text-sm text-gray-600">
                    Timestamp: {new Date(emergency.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No emergency history.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Emergency;
