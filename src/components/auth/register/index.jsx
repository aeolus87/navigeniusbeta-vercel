import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useAuth } from '../../../contexts/authContext';

const Register = () => {
    const navigate = useNavigate();
    const { userLoggedIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [parentNumber, setParentNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showOtpField, setShowOtpField] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

    useEffect(() => {
        const recaptchaContainer = document.createElement('div');
        recaptchaContainer.id = 'recaptcha-container';
        document.body.appendChild(recaptchaContainer);

        const verifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible'
        });
        setRecaptchaVerifier(verifier);

        return () => {
            document.body.removeChild(recaptchaContainer);
        };
    }, []);

    const handleOtpVerification = async () => {
        if (!email || !password || !confirmPassword || !parentNumber) {
            setErrorMessage('All fields are required to proceed.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        try {
            const confirmationResult = await firebase.auth().signInWithPhoneNumber(parentNumber, recaptchaVerifier);
            setConfirmationResult(confirmationResult);
            setShowOtpField(true);
        } catch (error) {
            console.error('Error sending OTP:', error);
            setErrorMessage('Failed to send OTP. Please try again later.');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            await confirmationResult.confirm(otp);
            setIsPhoneVerified(true);
            setErrorMessage('');
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setErrorMessage('Failed to verify OTP. Please check the code and try again.');
        }
    };

    const handleResendCode = () => {
        handleOtpVerification();
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!isPhoneVerified) {
            setErrorMessage("Please verify the parent's phone number first.");
            return;
        }

        if (!isRegistering) {
            setIsRegistering(true);
            try {
                await firebase.auth().createUserWithEmailAndPassword(email, password);
                navigate('/home');
            } catch (error) {
                setErrorMessage(error.message);
                setIsRegistering(false);
            }
        }
    };

    return (
        <>
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <main className="w-full h-screen flex self-center place-content-center place-items-center">
                <div className="w-full sm:w-auto md:w-96 text-black-600 space-y-5 p-4 shadow-xl border rounded-xl bg-[#fff9f9]">
                    <div className="text-center mb-6">
                        <div className="mt-2">
                            <h3 className="text-black-800 text-xl font-semibold sm:text-2xl">Create a New Account</h3>
                        </div>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-black-600 font-bold">
                                Email
                            </label>
                            <input
                                type="email"
                                autoComplete='email'
                                required
                                value={email} onChange={(e) => { setEmail(e.target.value) }}
                                className="w-full mt-2 px-3 py-2 text-black-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-black-600 font-bold">
                                Password
                            </label>
                            <input
                                disabled={isRegistering}
                                type="password"
                                autoComplete='new-password'
                                required
                                value={password} onChange={(e) => { setPassword(e.target.value) }}
                                className="w-full mt-2 px-3 py-2 text-black-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-black-600 font-bold">
                                Confirm Password
                            </label>
                            <input
                                disabled={isRegistering}
                                type="password"
                                autoComplete='off'
                                required
                                value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value) }}
                                className="w-full mt-2 px-3 py-2 text-black-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-black-600 font-bold">
                                Parent's Phone Number
                            </label>
                            <PhoneInput
                                international
                                defaultCountry="PH"
                                value={parentNumber}
                                onChange={setParentNumber}
                                className="w-full mt-2 px-3 py-2 text-black-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                                placeholder="Enter phone number"
                            />
                        </div>

                        {showOtpField && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    autoComplete='off'
                                    required
                                    value={otp} onChange={(e) => { setOtp(e.target.value) }}
                                    className="w-1/2 mt-2 px-3 py-2 text-black-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    className="mt-2 px-4 py-2 text-white font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300 h-10"
                                >
                                    {isPhoneVerified ? '✓' : 'Verify'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    className="mt-2 px-4 py-2 text-white font-medium rounded-lg bg-gray-600 hover:bg-gray-700 hover:shadow-xl transition duration-300 h-10"
                                >
                                    Resend
                                </button>
                            </div>
                        )}

                        {errorMessage && (
                            <span className='text-red-600 font-bold'>{errorMessage}</span>
                        )}

                        {!showOtpField && (
                            <button
                                type="button"
                                onClick={handleOtpVerification}
                                className={`w-full px-4 py-2 text-white font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300`}
                            >
                                Verify Parent's Number
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={isRegistering || !isPhoneVerified}
                            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isRegistering || !isPhoneVerified ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
                        >
                            {isRegistering ? 'Signing Up...' : 'Sign Up'}
                        </button>

                        <div className="text-sm text-center">
                            Already have an account? {'   '}
                            <Link to={'/login'} className="text-center text-sm hover:underline font-bold">Continue</Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

export default Register;
