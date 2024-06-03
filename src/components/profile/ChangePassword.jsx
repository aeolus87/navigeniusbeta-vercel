import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const handlePasswordChange = async () => {
    setError('');
    setSuccess('');

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    // Get the current user
    const user = firebase.auth().currentUser;

    // Get the current user's email
    setCurrentUserEmail(user.email);

    // Check if the old password is the same as the current password
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, currentUserEmail, oldPassword);
      // If the old password is correct, proceed with re-authentication
      try {
        // Re-authenticate the user with their current password
        const credential = firebase.auth.EmailAuthProvider.credential(
          user.email,
          oldPassword
        );
        await user.reauthenticateWithCredential(credential);

        // Update the user's password with the new one
        await user.updatePassword(newPassword);

        // Password update successful
        setSuccess('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (error) {
        // Handle re-authentication or password update errors
        setError('An error occurred while changing the password');
      }
    } catch (error) {
      // If the old password is incorrect, display an error message
      setError('The old password is incorrect');
    }
  };

  return (
    <div className="max-w-md lg:mx-auto p-6 bg-[#0c2734] rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-white mb-4">Change Password</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}
      <div className="mb-4">
        <label htmlFor="oldPassword" className="block text-white font-semibold mb-2">
          Old Password
        </label>
        <input
          type="password"
          id="oldPassword"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="newPassword" className="block text-white font-semibold mb-2">
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-white font-semibold mb-2">
          Confirm Password
        </label>
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