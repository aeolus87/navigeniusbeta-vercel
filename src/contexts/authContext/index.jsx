import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = React.createContext();

export function useAuth() {
  return React.useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const initializeUser = useCallback(async (user) => {
    try {
      if (user) {
        setCurrentUser({ ...user });
        const isEmail = user.providerData.some(
          (provider) => provider.providerId === 'password',
        );
        setIsEmailUser(isEmail);
        setUserLoggedIn(true);
        notify('Logged In');
      } else {
        setCurrentUser(null);
        setUserLoggedIn(false);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, [initializeUser]);

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      notify('Logged Out');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const notify = (message) => {
    toast.dark(message, {
      position: 'top-right',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
    });
  };

  const value = {
    userLoggedIn,
    isEmailUser,
    currentUser,
    logout,
    notify, 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
