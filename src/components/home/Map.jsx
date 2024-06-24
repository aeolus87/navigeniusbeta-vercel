import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Map = () => {
  const initialCenter = [14.6497, 120.9943];
  const defaultCenter = [0, 0];
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [navigeniusLocation, setNavigeniusLocation] = useState(defaultCenter);
  const [hasShownAlert, setHasShownAlert] = useState(false);
  const [isCircleClicked, setIsCircleClicked] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const mapRef = useRef(null);

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

  const handleCircleClick = () => {
    setIsCircleClicked(true);
  };

  const handleClosePopup = () => {
    setIsCircleClicked(false);
  };

  useEffect(() => {
    const getCoordinates = (key) => {
      const value = localStorage.getItem(key);
      return parseFloat(value) || 0;
    };

    const updateLocations = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = [
              position.coords.latitude,
              position.coords.longitude,
            ];
            setUserLocation(newLocation);
            localStorage.setItem('c_lat', position.coords.latitude);
            localStorage.setItem('c_long', position.coords.longitude);
          },
          (error) => {
            console.error('Error getting user location:', error);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
        );
      } else {
        console.warn('Geolocation not supported by browser.');
      }

      const newNavigeniusCoords = [
        getCoordinates('lat_val'),
        getCoordinates('long_val'),
      ];
      setNavigeniusLocation(newNavigeniusCoords);
    };

    // Initial update
    updateLocations();

    const updateInterval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount > 1) {
          return prevCount - 1;
        } else {
          updateLocations();
          return 30;
        }
      });
    }, 1000);

    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(userLocation, 13);
    }
  }, [userLocation]);

  useEffect(() => {
    const checkGeofence = () => {
      const geofenceCenter = [14.6497, 120.9943];
      const distance = L.latLng(navigeniusLocation).distanceTo(
        L.latLng(geofenceCenter),
      );
      if (distance > 100 && !hasShownAlert) {
        toast.error('Your child is outside the area!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
        });
        setHasShownAlert(true);
      }
    };
    checkGeofence();
  }, [navigeniusLocation, hasShownAlert]);

  return (
    <div className="lg:fixed top-20 lg:right-20 z-10 lg:max-w-[1100px] lg:w-[90vw] max-w-[93%] ml-4">
      <div className="rounded-xl overflow-hidden lg:h-[80vh] h-[40vh] relative">
        <MapContainer
          center={initialCenter}
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
            center={[14.6497, 120.9943]}
            radius={100}
            fillColor="blue"
            fillOpacity={0.2}
            eventHandlers={{ click: () => handleCircleClick() }}
          >
            {isCircleClicked && (
              <Popup position={[14.6497, 120.9943]} onClose={handleClosePopup}>
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
