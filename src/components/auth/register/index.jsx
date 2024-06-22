import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { doCreateUserWithEmailAndPassword } from '../../../firebase/auth';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  useEffect(() => {
    const sessionId =
      sessionStorage.getItem('registrationSessionId') || generateSessionId();
    sessionStorage.setItem('registrationSessionId', sessionId);

    const savedFormData = sessionStorage.getItem(
      `registerFormData_${sessionId}`,
    );
    if (savedFormData) {
      const formData = JSON.parse(savedFormData);
      setFullName(formData.fullName || '');
      setEmail(formData.email || '');
      setPassword(formData.password || '');
      setConfirmPassword(formData.confirmPassword || '');
      setAgreedToTerms(formData.agreedToTerms || false);
    }
  }, []);

  useEffect(() => {
    const sessionId = sessionStorage.getItem('registrationSessionId');
    const saveFormData = () => {
      sessionStorage.setItem(
        `registerFormData_${sessionId}`,
        JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
          agreedToTerms,
        }),
      );
    };

    const resetSessionTimeout = () => {
      clearTimeout(sessionStorage.getItem('sessionTimeoutId'));
      const sessionTimeout = setTimeout(() => {
        clearSessionData(sessionId);
        sessionStorage.setItem('registrationTimeout', 'true');
        navigate('/');
      }, 10000);
      sessionStorage.setItem('sessionTimeoutId', sessionTimeout);
    };

    saveFormData();
    resetSessionTimeout();

    window.addEventListener('beforeunload', saveFormData);
    return () => {
      window.removeEventListener('beforeunload', saveFormData);
      clearTimeout(sessionStorage.getItem('sessionTimeoutId'));
    };
  }, [fullName, email, password, confirmPassword, agreedToTerms, navigate]);

  const clearSessionData = (sessionId) => {
    sessionStorage.removeItem(`registerFormData_${sessionId}`);
    sessionStorage.removeItem('registrationSessionId');
    sessionStorage.removeItem('sessionTimeoutId');
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAgreedToTerms(false);
    setEmailErrorMessage('');
    setPasswordErrorMessage('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistering && password === confirmPassword) {
      setIsRegistering(true);
      try {
        await doCreateUserWithEmailAndPassword(email, password, fullName);
        const sessionId = sessionStorage.getItem('registrationSessionId');
        clearSessionData(sessionId);
        navigate('/home');
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          setEmailErrorMessage('This email is already used');
        } else if (error.code === 'auth/weak-password') {
          setPasswordErrorMessage('Password should be at least 6 characters');
        } else {
          setPasswordErrorMessage('Error signing up. Please try again later.');
        }
        setIsRegistering(false);
      }
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (confirmPasswordTouched && e.target.value !== confirmPassword) {
      setPasswordErrorMessage('Passwords do not match');
    } else {
      setPasswordErrorMessage('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (e.target.value !== password) {
      setPasswordErrorMessage('Passwords do not match');
    } else {
      setPasswordErrorMessage('');
    }
    setConfirmPasswordTouched(true);
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15);
  };
  return (
    <>
      {userLoggedIn && <Navigate to={'/home'} replace={true} />}
      <main className="w-full h-screen flex self-center place-content-center place-items-center">
        <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border bg-[#fff9f9] rounded-xl">
          <div className="text-center mb-6">
            <div className="mt-2">
              <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">
                Create a New Account
              </h3>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-md text-gray-600 font-bold">
                Full Name
              </label>
              <input
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-bold">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailErrorMessage('');
                }}
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
              />
              {emailErrorMessage && (
                <span className="text-red-600 text-sm lg:ml-2">
                  {emailErrorMessage}
                </span>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600 font-bold">
                Password
              </label>
              <input
                disabled={isRegistering}
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={handlePasswordChange}
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-bold">
                Confirm Password
              </label>
              <input
                disabled={isRegistering}
                type="password"
                autoComplete="off"
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
              />
            </div>

            <p className="text-gray-600 flex items-center">
              <input
                type="checkbox"
                id="termsCheckbox"
                className="mr-2 h-5 w-5"
                checked={agreedToTerms}
                onChange={() => setAgreedToTerms(!agreedToTerms)}
                required
              />
              <label htmlFor="termsCheckbox">
                By registering, you agree to our{' '}
                <Link to="/terms" className="text-indigo-600 hover:underline">
                  Terms and Conditions
                </Link>
                .
              </label>
            </p>

            {passwordErrorMessage && confirmPasswordTouched && (
              <span className="text-red-600">{passwordErrorMessage}</span>
            )}

            {passwordErrorMessage && !confirmPasswordTouched && (
              <span className="text-red-600">Please confirm your password</span>
            )}

            <button
              type="submit"
              disabled={
                isRegistering ||
                emailErrorMessage !== '' ||
                passwordErrorMessage !== ''
              }
              className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isRegistering ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
            >
              {isRegistering ? 'Signing Up...' : 'Sign Up'}
            </button>
            <div className="text-sm text-center">
              Already have an account? {'   '}
              <Link
                to={'/login'}
                className="text-center text-sm hover:underline font-bold"
              >
                Continue
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default Register;
