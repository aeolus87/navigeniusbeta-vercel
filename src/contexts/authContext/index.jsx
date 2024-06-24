import React, { useState, useEffect, useCallback, useRef } from 'react';
import { auth } from '../../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const AuthContext = React.createContext();

export function useAuth() {
  return React.useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsToCompleteRegistration, setNeedsToCompleteRegistration] =
    useState(false);
  const [isInitialLogin, setIsInitialLogin] = useState(true);
  const navigate = useNavigate();
  const notificationTimeout = useRef(null);

  const notify = useCallback((message) => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }
    notificationTimeout.current = setTimeout(() => {
      toast.dark(message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    }, 100);
  }, []);

  const initializeUser = useCallback(
    async (user) => {
      try {
        if (window.location.pathname === '/terms') {
          setLoading(false);
          return;
        }
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (!userDoc.exists()) {
            setCurrentUser(user);
            setUserLoggedIn(false);
            setNeedsToCompleteRegistration(true);
            navigate('/complete-registration', {
              state: { email: user.email, uid: user.uid },
            });
          } else {
            setCurrentUser(user);
            const userData = userDoc.data();

            if (userData.justRegistered) {
              setNeedsToCompleteRegistration(false);
              setUserLoggedIn(true);
              notify('Registration completed successfully');

              await setDoc(
                doc(db, 'users', user.uid),
                { justRegistered: false },
                { merge: true },
              );

              navigate('/dashboard');
            } else {
              setNeedsToCompleteRegistration(false);
              if (user.emailVerified) {
                setUserLoggedIn(true);
                if (isInitialLogin) {
                  notify('Logged In');
                  setIsInitialLogin(false);
                }
              } else {
                setUserLoggedIn(false);
                if (isInitialLogin) {
                  notify('Please verify your email before logging in.');
                  setIsInitialLogin(false);
                }
              }
            }
          }
        } else {
          setCurrentUser(null);
          setUserLoggedIn(false);
          setNeedsToCompleteRegistration(false);
          setIsInitialLogin(true);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    },
    [navigate, isInitialLogin, notify],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return () => {
      unsubscribe();
      if (notificationTimeout.current) {
        clearTimeout(notificationTimeout.current);
      }
    };
  }, [initializeUser]);

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      notify('Logged Out');
      setIsInitialLogin(true);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    userLoggedIn,
    currentUser,
    logout,
    notify,
    needsToCompleteRegistration,
    setNeedsToCompleteRegistration,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
