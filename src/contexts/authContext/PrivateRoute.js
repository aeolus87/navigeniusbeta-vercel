import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '.';

const PrivateRoute = ({ children }) => {
  const { userLoggedIn } = useAuth();

  if (!userLoggedIn) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
