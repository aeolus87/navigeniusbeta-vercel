import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
} from '../../../firebase/auth';
import { useAuth } from '../../../contexts/authContext';
import axios from 'axios';
import platform from 'platform';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
  const { userLoggedIn, setUserLoggedIn, notify } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (location.state && location.state.from === 'logout') {
      notify('Logged Out');
    }
  }, [location, notify]);

  const fetchLocation = () => {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              );
              const city =
                response.data.address.city ||
                response.data.address.town ||
                'Unknown City';
              const country =
                response.data.address.country || 'Unknown Country';
              resolve(`${city}, ${country}`);
            } catch (error) {
              console.error('Error fetching location details:', error);
              reject('Error determining location');
            }
          },
          (error) => {
            console.error('Error getting geolocation:', error);
            reject('Unable to retrieve your location');
          },
        );
      } else {
        reject('Geolocation is not supported by your browser');
      }
    });
  };
  const logLoginActivity = async (userId, device, location) => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    try {
      await axios.post(`${API_BASE_URL}/api/login-activities`, {
        userId,
        device,
        location,
        date,
        time,
      });
    } catch (error) {
      console.error('Error logging login activity:', error);
    }
  };

  const getOS = () => {
    const { userAgent } = navigator;
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      if (
        /iPhone/i.test(userAgent) ||
        /CriOS/i.test(userAgent.replace('Chrome on', ''))
      )
        return 'iPhone';
      return userAgent
        .match(/\((.*?)\)/)[1]
        .split(';')[0]
        .trim();
    }
    if (userAgent.indexOf('Windows NT 10.0') !== -1) {
      return userAgent.indexOf('Win64') !== -1 ||
        userAgent.indexOf('WOW64') !== -1
        ? 'Windows 11'
        : 'Windows 10';
    }
    return 'Unknown OS';
  };

  const handleSignIn = async (signInMethod) => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setErrorMessage('');

    try {
      const { user } = await signInMethod();
      const deviceInfo = `${platform.name} on ${getOS()}`;
      const location = await fetchLocation();
      await logLoginActivity(user.uid, deviceInfo, location);

      // Check if the user needs to complete registration
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // User needs to complete registration
        navigate('/complete-registration', {
          state: { email: user.email, uid: user.uid },
        });
      } else {
        // User is already registered
        setUserLoggedIn(true);
        notify('Logged In');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const getErrorMessage = (error) => {
    if (error.code === 'auth/user-not-found') return 'Email is not registered.';
    if (error.message === 'Please verify your email before logging in.')
      return 'Email not verified. Please check your email.';
    return 'Invalid email or password.';
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSignIn(() => doSignInWithEmailAndPassword(email, password));
  };

  const onGoogleSignIn = (e) => {
    e.preventDefault();
    handleSignIn(doSignInWithGoogle);
  };

  if (userLoggedIn) return <Navigate to="/dashboard" replace />;

  return (
    <div>
      {userLoggedIn && <Navigate to={'/dashboard'} replace={true} />}

      <main className="w-full h-screen flex self-center place-content-center place-items-center">
        <div className="w-full sm:w-auto md:w-96 text-black-600 space-y-5 p-4 shadow-xl border rounded-xl bg-[#fff9f9]">
          <div className="text-center">
            <div className="mt-2">
              <h3 className="text-black-800 text-xl font-semibold sm:text-2xl">
                Welcome! <br /> Stay Informed, Stay Secure!
              </h3>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-black-600 font-bold">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className="w-full mt-2 px-3 py-2 text-black-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
              />
            </div>

            <div>
              <label className="text-sm text-black-600 font-bold">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className="w-full mt-2 px-3 py-2 text-black-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
              />
            </div>
            <div className="text-sm text-center">
              <Link
                to="/forgot-password"
                className="text-indigo-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            {errorMessage && (
              <span className="text-red-600 text-sm flex justify-center items-center h-full">
                {errorMessage}
              </span>
            )}

            <button
              type="submit"
              disabled={isSigningIn}
              className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isSigningIn ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
            >
              {isSigningIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm">
            Don't have an account?{' '}
            <Link to={'/register'} className="hover:underline font-bold">
              Sign up
            </Link>
          </p>
          <div className="flex flex-row text-center w-full">
            <div className="border-b-2 mb-2.5 mr-2 w-full"></div>
            <div className="text-sm font-bold w-fit">OR</div>
            <div className="border-b-2 mb-2.5 ml-2 w-full"></div>
          </div>
          <button
            disabled={isSigningIn}
            onClick={(e) => {
              onGoogleSignIn(e);
            }}
            className={`w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium  ${isSigningIn ? 'cursor-not-allowed' : 'hover:bg-gray-100 transition duration-300 active:bg-gray-100'}`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_17_40)">
                <path
                  d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
                  fill="#4285F4"
                />
                <path
                  d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
                  fill="#34A853"
                />
                <path
                  d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
                  fill="#FBBC04"
                />
                <path
                  d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
                  fill="#EA4335"
                />
              </g>
              <defs>
                <clipPath id="clip0_17_40">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
            {isSigningIn ? 'Signing In...' : 'Continue with Google'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
