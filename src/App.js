import React from "react";
import { useRoutes } from "react-router-dom";

import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Header from "./components/header";
import Home from "./components/home/Home";
import { AuthProvider } from "./contexts/authContext"; // Correct import path
import PrivateRoute from "./contexts/PrivateRoute"; // Correct import path

function App() {
  const routesArray = [
    {
      path: "*",
      element: <Login />,
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
      path: "/home",
      element: (
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      ),
    },
  ];
  
  let routesElement = useRoutes(routesArray);

  return (
    <AuthProvider>
      <Header />
      <div className="h-screen flex flex-col mx-0 bg-map bg-cover bg-center backdrop-blur-sm">{routesElement}</div>
    </AuthProvider>
  );
}

export default App;
