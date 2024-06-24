import React from 'react';
import { Link } from 'react-router-dom';

const VerifyEmail = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 m-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-600 mb-4">
          We've sent a verification email to your registered email address.
          Please check your inbox and click on the verification link to complete
          your registration.
        </p>
        <p className="text-center text-gray-600 mb-8">
          If you don't see the email, please check your spam folder.
        </p>
        <div className="text-center">
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
