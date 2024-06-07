import React from "react";
import { useRoutes, useLocation } from "react-router-dom";
import "./index.css";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Header from "./components/header";
import Home from "./components/home/Home";
import ForgotPassword from "./components/auth/forgot/";
import { AuthProvider } from "./contexts/authContext";
import PrivateRoute from "./contexts/PrivateRoute";
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebase/firebase.js';
import Main from "./components/main/main.jsx";
import Profile from "./components/profile";

firebase.initializeApp(firebaseConfig);

function App() {
  const location = useLocation();

  const routesArray = [
    {
      path: "/*",
      element: <Main />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/forgot-password", 
      element: <ForgotPassword />,
    },
    {
      path: "/profile", 
      element: <Profile />,
    },
    {
      path: "/home",
      element: (
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      ),
    },
  ];

  const isMainPage = location.pathname === "/" || location.pathname === "/main";

  let routesElement = useRoutes(routesArray);

  return (
    <AuthProvider>
      {isMainPage ? null : <Header />}
      <div className="h-screen flex flex-col mx-0 my-0 bg-main bg-cover bg-center backdrop-blur-sm">{routesElement}</div>
    </AuthProvider>
  );
}

export default App;
