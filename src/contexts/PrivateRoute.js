import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext'; // Correct import path

const PrivateRoute = ({ children }) => {
  const { userLoggedIn } = useAuth();

  if (!userLoggedIn) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
