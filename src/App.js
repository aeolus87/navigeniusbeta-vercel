import React from 'react';
import { useRoutes, useLocation, Navigate } from 'react-router-dom';
import './index.css';
import Login from './components/auth/login';
import Register from './components/auth/register';
import Header from './components/header';
import Home from './components/home/Home';
import ForgotPassword from './components/auth/forgot/';
import { AuthProvider } from './contexts/authContext';
import PrivateRoute from './contexts/PrivateRoute';
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebase/firebase.js';
import Main from './components/main/main.jsx';
import Profile from './components/profile';
import TermsAndConditions from './components/auth/terms/TermsConditions.jsx';

firebase.initializeApp(firebaseConfig);

function App() {
  const location = useLocation();

  const routesArray = [
    {
      path: '/',
      element: <Main />,
    },
    {
      path: '/main', // Handle the /main route
      element: <Navigate to="/" replace />,
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
    {
      path: '/terms',
      element: <TermsAndConditions />,
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />,
    },
    {
      path: '/profile',
      element: (
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      ),
    },
    {
      path: '/home',
      element: (
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      ),
    },
  ];

  const isTermsPage = location.pathname === '/terms';
  const isMainPage = location.pathname === '/';

  let routesElement = useRoutes(routesArray);

  return (
    <AuthProvider>
      {!isTermsPage && !isMainPage && <Header />}
      <div
        className={`h-screen flex flex-col mx-0 my-0${isTermsPage ? ' bg-white' : ' bg-main bg-cover bg-center backdrop-blur-sm'}`}
      >
        {routesElement}
      </div>
    </AuthProvider>
  );
}

export default App;
