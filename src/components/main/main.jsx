import React from 'react';

const Main = () => {
  return (
    <div className="flex items-center h-full bg-main bg-cover bg-center w-screen relative">
      {/* Big text in the top left corner */}
      <div className="absolute top-0 left-0 mt-8 ml-8">
        <h1 className="text-white text-3xl font-bold ml-28 mt-4">NAVIGENIUS</h1>
      </div>

      <div className="text-white text-left ml-36 mb-12">
        <h1 className="text-5xl font-bold">The easiest and <br /> safest way</h1>
        <h6 className="text-2xl font-medium">to monitor your child's location <br /> and ensure their safety</h6>
      </div>
      <div className="absolute top-0 right-0 mr-8">
        <p className="text-white text-xl font-medium mr-28 mt-16 relative">
          Gps Tracking System
          <span
            className="absolute bottom-0 left-0 w-full bg-red-800"
            style={{ width: '27%', height: '2px' }}
          ></span>
        </p>
      </div>
      <div className="flex space-x-16 absolute bottom-36 ml-36">
        <a href="/login">
          <button className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg">Login</button>
        </a>
        <a href="/register">
          <button className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg">Sign Up</button>
        </a>
      </div>
      <div className="absolute bottom-0 right-0 mr-8 h-96 w-96 bg-phone bg-center bg-no-repeat bg-contain" />
    </div>
  );
};

export default Main;
