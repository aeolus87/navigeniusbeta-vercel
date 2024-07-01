import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useRoutes, useLocation } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './contexts/authContext/index.jsx';
import PrivateRoute from './contexts/authContext/PrivateRoute.js';
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebase/firebase.js';

const Login = lazy(() => import('./components/auth/login/index.jsx'));
const Register = lazy(() => import('./components/auth/register/index.jsx'));
const Header = lazy(() => import('./components/header/index.jsx'));
const Dashboard = lazy(() => import('./components/home/Dashboard.jsx'));
const ForgotPassword = lazy(() => import('./components/auth/forgot/index.jsx'));
const Main = lazy(() => import('./components/main/main.jsx'));
const Profile = lazy(() => import('./components/profile/index.jsx'));
const TermsAndConditions = lazy(
  () => import('./components/auth/terms/TermsConditions.jsx'),
);
const NotFound = lazy(() => import('./components/main/notfound.jsx'));
const VerifyEmail = lazy(
  () => import('./components/auth/register/verifyemail.jsx'),
);
const VerifiedMessage = lazy(
  () => import('./components/auth/verify/verified.jsx'),
);
const CompleteRegistration = lazy(
  () => import('./components/auth/register/complete.jsx'),
);
const Emergency = lazy(() => import('./components/locationalerts/index.jsx'));

const initializeFirebase = async () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
};

function App() {
  const location = useLocation();
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    initializeFirebase().then(() => setFirebaseInitialized(true));
  }, []);

  const routesArray = [
    { path: '/', element: <Main /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/complete-registration', element: <CompleteRegistration /> },
    { path: '/terms', element: <TermsAndConditions /> },
    { path: '/verifyemail', element: <VerifyEmail /> },
    { path: '/verified', element: <VerifiedMessage /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/locationalerts', element: <Emergency /> },
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
    { path: '*', element: <NotFound /> },
  ];

  const isTermsPage = location.pathname === '/terms';
  const isMainPage = location.pathname === '/';

  let routesElement = useRoutes(routesArray);

  if (!firebaseInitialized) {
    return <div>Loading...</div>; // Or some loading indicator
  }

  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
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
      </Suspense>
    </AuthProvider>
  );
}

export default App;
  