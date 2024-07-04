// DeviceCodeEntry.js
import React, { useState } from 'react';
import { linkDeviceToUser } from '../../firebase/auth';
import { useAuth } from '../../contexts/authContext';

const DeviceCodeEntry = ({ onDeviceLinked }) => {
  const [deviceCode, setDeviceCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, notify } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLinking(true);
    setError('');

    try {
      await linkDeviceToUser(currentUser.uid, deviceCode);
      notify('Device linked successfully');
      onDeviceLinked();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="mt-4 ">
      <h3 className="text-lg font-semibold mb-2">GPS Device Code</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={deviceCode}
          onChange={(e) => setDeviceCode(e.target.value)}
          placeholder="Enter the code"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={isLinking}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-300"
        >
          {isLinking ? 'Linking...' : 'Link Device'}
        </button>
      </form>
    </div>
  );
};

export default DeviceCodeEntry;
