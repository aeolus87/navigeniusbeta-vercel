import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { debounce } from 'lodash';

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

const INITIAL_CENTER = [14.6497, 120.9943];
const DEFAULT_CENTER = [0, 0];
const GEOFENCE_RADIUS = 100;
const UPDATE_INTERVAL = 30000;
const DEBOUNCE_DELAY = 300;

const Map = () => {
  const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
  const [navigeniusLocation, setNavigeniusLocation] = useState(DEFAULT_CENTER);
  const [isCircleClicked, setIsCircleClicked] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const mapRef = useRef(null);
  const hasShownAlertRef = useRef(false);

  const getCoordinates = useCallback((key) => {
    const value = localStorage.getItem(key);
    return parseFloat(value) || 0;
  }, []);

  const updateLocations = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(newLocation);
          localStorage.setItem('c_lat', position.coords.latitude.toString());
          localStorage.setItem('c_long', position.coords.longitude.toString());
        },
        (error) => console.error('Error getting user location:', error),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
      );
    } else {
      console.warn('Geolocation not supported by browser.');
    }

    setNavigeniusLocation([
      getCoordinates('lat_val'),
      getCoordinates('long_val'),
    ]);
  }, [getCoordinates]);

  const checkGeofence = useCallback(() => {
    const distance = L.latLng(navigeniusLocation).distanceTo(
      L.latLng(INITIAL_CENTER),
    );
    if (distance > GEOFENCE_RADIUS && !hasShownAlertRef.current) {
      toast.error('Your child is outside the area!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
      hasShownAlertRef.current = true;
    }
  }, [navigeniusLocation]);

  const debouncedUpdateLocations = useCallback(
    () => debounce(updateLocations, DEBOUNCE_DELAY),
    [updateLocations],
  );

  const debouncedCheckGeofence = useCallback(
    () => debounce(checkGeofence, DEBOUNCE_DELAY),
    [checkGeofence],
  );

  useEffect(() => {
    const updateFunc = debouncedUpdateLocations();
    updateFunc();
    const interval = setInterval(() => {
      updateFunc();
      setCountdown(30);
    }, UPDATE_INTERVAL);

    return () => {
      clearInterval(interval);
      updateFunc.cancel();
    };
  }, [debouncedUpdateLocations]);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prevCount) => (prevCount > 0 ? prevCount - 1 : 30));
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  useEffect(() => {
    if (navigeniusLocation && mapRef.current) {
      mapRef.current.flyTo(navigeniusLocation, 13, { duration: 2 });
    }
  }, [navigeniusLocation]);

  useEffect(() => {
    const checkFunc = debouncedCheckGeofence();
    checkFunc();
    return () => checkFunc.cancel();
  }, [debouncedCheckGeofence]);

  return (
    <div className="lg:fixed top-20 lg:right-20 z-10 lg:max-w-[1120px] lg:w-[90vw] max-w-[93%] ml-4">
      <div className="rounded-xl overflow-hidden lg:h-[80vh] h-[40vh] relative">
        <MapContainer
          center={INITIAL_CENTER}
          zoom={6}
          zoomControl={false}
          ref={mapRef}
          className="w-full h-full"
        >
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
          <Circle
            center={INITIAL_CENTER}
            radius={GEOFENCE_RADIUS}
            fillColor="blue"
            fillOpacity={0.2}
            eventHandlers={{ click: () => setIsCircleClicked(true) }}
          >
            {isCircleClicked && (
              <Popup
                position={INITIAL_CENTER}
                onClose={() => setIsCircleClicked(false)}
              >
                <div>100 meter Radius of Barangay 102</div>
              </Popup>
            )}
          </Circle>
        </MapContainer>
        <div className="absolute top-4 left-4 z-[1000] bg-[#fafafaa5] p-2 rounded-md shadow-md">
          Map will update in: {countdown} seconds
        </div>
      </div>
    </div>
  );
};

export default Map;
