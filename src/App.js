import React from 'react';
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


firebase.initializeApp(firebaseConfig);

function App() {
  const location = useLocation();

  const routesArray = [
    { path: '/', element: <Main /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/complete-registration', element: <CompleteRegistration /> },
    { path: '/terms', element: <TermsAndConditions /> },
    { path: '/verifyemail', element: <VerifyEmail /> },
    { path: '/verified', element: <VerifiedMessage /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    {
      path: '/profile',
      element: (
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      ),
    },
    {
      path: '/dashboard',
      element: (
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      ),
    },
    {
      path: '/locationalerts',
      element: (
        <PrivateRoute>
          <Emergency />
        </PrivateRoute>
      ),
    },
    { path: '*', element: <NotFound /> },
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
