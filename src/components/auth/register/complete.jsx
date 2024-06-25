import React, { useState } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function CompleteRegistration() {
  const [fullName, setFullName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { notify, setUserLoggedIn } = useAuth();
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

    setIsLoading(true);

    try {
      await setDoc(
        doc(db, 'users', uid),
        {
          uid: uid,
          email: email,
          fullname: fullName,
          justRegistered: true,
        },
        { merge: true },
      );

      setUserLoggedIn(true);

      notify('Registration completed successfully');

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Error completing registration:', error);
      notify('Error completing registration. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-blue-500 border-solid rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-xl font-semibold text-gray-700">
            Completing Registration...
          </p>
        </div>
      </div>
    );
  }

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

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={agreedToTerms}
                onChange={() => setAgreedToTerms(!agreedToTerms)}
                required
              />
              <span className="ml-2 text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </Link>
              </span>
            </label>
          </div>

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
