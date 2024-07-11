import React, { useState, useEffect } from 'react';
import { Fmap } from '.';
import Map from './Map';
import DeviceCodeEntry from '../DeviceEntry';
import { useAuth } from '../../contexts/authContext';
import { getUserDeviceId } from '../../firebase/auth';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [deviceLinked, setDeviceLinked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDeviceLink = async () => {
      if (currentUser) {
        const deviceId = await getUserDeviceId(currentUser.uid);
        setDeviceLinked(!!deviceId);
      }
      setLoading(false);
    };

    checkDeviceLink();
  }, [currentUser]);

  const handleDeviceLinked = () => {
    setDeviceLinked(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen mx-0 my-0 px-0 py-5 bg-[#00000000] z-20">
      {deviceLinked ? (
        <>
          <Fmap />
          <Map />
        </>
      ) : (
        <div className="max-w-md mx-auto mt-40 p-6 bg-[#0c2734] rounded-lg shadow-md">
          <h2 className="text-2xl text-white font-bold mb-4">
            GPS Device Unavailable
          </h2>
          <p className="mb-4 text-white">
            Link your GPS device to start tracking.
          </p>
          <DeviceCodeEntry onDeviceLinked={handleDeviceLinked} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
