import React, { useState } from 'react';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async () => {
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    // Simulate password change process without Firebase
    try {
      // Simulate a delay for the async operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate successful password change
      setSuccess('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError('An error occurred while changing the password');
    }
  };

  return (
    <div className="max-w-md lg:mx-auto p-6 bg-[#1B274A] rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-white mb-4">Change Password</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}
      <div className="mb-4">
        <label htmlFor="oldPassword" className="block text-white font-semibold mb-2">Old Password</label>
        <input
          type="password"
          id="oldPassword"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="newPassword" className="block text-white font-semibold mb-2">New Password</label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-white font-semibold mb-2">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400"
        />
      </div>
      <button
        onClick={handlePasswordChange}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Change Password
      </button>
    </div>
  );
};

export default ChangePassword;
