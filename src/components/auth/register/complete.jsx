import React, { useState } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function CompleteRegistration() {
  const [fullName, setFullName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { notify } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const uid = location.state?.uid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !agreedToTerms) {
      notify('Please fill all fields and agree to the terms');
      return;
    }

    if (!email || !uid) {
      notify('Email information is missing. Please try signing in again.');
      navigate('/login');
      return;
    }

    try {
      await setDoc(
        doc(db, 'users', uid),
        {
          uid: uid,
          email: email,
          fullname: fullName,
          justRegistered: true, // Add this line
        },
        { merge: true },
      );

      notify('Registration completed successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing registration:', error);
      notify('Error completing registration. Please try again.');
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-300"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Complete Your Registration
          </h2>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              value={email || ''}
              readOnly
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="fullName"
            >
              Full Name
            </label>
            <input
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <p className="text-gray-600 flex items-center ml-1">
            <input
              type="checkbox"
              id="termsCheckbox"
              className="mr-4 h-5 w-5"
              checked={agreedToTerms}
              onChange={() => setAgreedToTerms(!agreedToTerms)}
              required
            />
            <label htmlFor="termsCheckbox">
              By registering, you agree to our{' '}
              <Link to="/terms" className="text-indigo-600 hover:underline">
                Terms and Conditions
              </Link>
              .
            </label>
          </p>

          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Complete Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default CompleteRegistration;
