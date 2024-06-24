import React from 'react';
import { Link } from 'react-router-dom';

const VerifiedMessage = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Email Verified!
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          You can now access your dashboard.
        </p>
        <Link
          to="/dashboard"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-300 inline-block"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default VerifiedMessage;
