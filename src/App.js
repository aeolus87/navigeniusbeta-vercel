import React, { useState, useEffect } from 'react';
import { useRoutes, useLocation } from 'react-router-dom';
import './index.css';
import Login from './components/auth/login/index.jsx';
import Register from './components/auth/register/index.jsx';
import Header from './components/header/index.jsx';
import Dashboard from './components/home/Dashboard.jsx';
import ForgotPassword from './components/auth/forgot/index.jsx';
import { AuthProvider } from './contexts/authContext/index.jsx';
import PrivateRoute from './contexts/authContext/PrivateRoute.js';
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebase/firebase.js';
import Main from './components/main/main.jsx';
import Profile from './components/profile/index.jsx';
import TermsAndConditions from './components/auth/terms/TermsConditions.jsx';
import NotFound from './components/main/notfound.jsx';
import VerifyEmail from './components/auth/register/verifyemail.jsx';
import VerifiedMessage from './components/auth/verify/verified.jsx';
import CompleteRegistration from './components/auth/register/complete.jsx';
import Emergency from './components/locationalerts/index.jsx';

// Loader component
const Loader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// LoadingWrapper component
const LoadingWrapper = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Adjust this delay as needed

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return children;
};

firebase.initializeApp(firebaseConfig);

function App() {
  const location = useLocation();

  const routesArray = [
    { path: '/', element: <LoadingWrapper><Main /></LoadingWrapper> },
    { path: '/login', element: <LoadingWrapper><Login /></LoadingWrapper> },
    { path: '/register', element: <LoadingWrapper><Register /></LoadingWrapper> },
    { path: '/complete-registration', element: <LoadingWrapper><CompleteRegistration /></LoadingWrapper> },
    { path: '/terms', element: <LoadingWrapper><TermsAndConditions /></LoadingWrapper> },
    { path: '/verifyemail', element: <LoadingWrapper><VerifyEmail /></LoadingWrapper> },
    { path: '/verified', element: <LoadingWrapper><VerifiedMessage /></LoadingWrapper> },
    { path: '/forgot-password', element: <LoadingWrapper><ForgotPassword /></LoadingWrapper> },
    {
      path: '/profile',
      element: (
        <PrivateRoute>
          <LoadingWrapper><Profile /></LoadingWrapper>
        </PrivateRoute>
      ),
    },
    {
      path: '/dashboard',
      element: (
        <PrivateRoute>
          <LoadingWrapper><Dashboard /></LoadingWrapper>
        </PrivateRoute>
      ),
    },
    {
      path: '/locationalerts',
      element: (
        <PrivateRoute>
          <LoadingWrapper><Emergency /></LoadingWrapper>
        </PrivateRoute>
      ),
    },
    { path: '*', element: <LoadingWrapper><NotFound /></LoadingWrapper> },
  ];

  const isTermsPage = location.pathname === '/terms';
  const isMainPage = location.pathname === '/';

  let routesElement = useRoutes(routesArray);

  return (
    <AuthProvider>
      {!isTermsPage && !isMainPage && <Header />}
      <div
        className={`h-screen flex flex-col mx-0 my-0${
          isTermsPage
            ? ' bg-white'
            : ' bg-main bg-cover bg-center backdrop-blur-sm'
        }`}
      >
        {routesElement}
      </div>
    </AuthProvider>
  );
}

export default App;