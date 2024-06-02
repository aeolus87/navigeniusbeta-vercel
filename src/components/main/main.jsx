import React from 'react';

const Main = () => {
  return (
    <div className="flex items-center h-full bg-main bg-cover bg-center w-screen relative">
      {/* Big text in the top left corner */}
      <div className="absolute top-0 left-0 mt-8 ml-4 sm:ml-8">
        <h1 className="text-white text-lg sm:text-3xl font-bold sm:ml-28 mt-4">NAVIGENIUS</h1>
      </div>

      <div className="text-white text-left ml-8 sm:ml-36 mb-36 sm:mt-0">
        <h1 className="text-2xl sm:text-5xl font-bold">
          The easiest and <br className="hidden sm:block" /> safest way
        </h1>
        <h6 className="text-lg sm:text-2xl font-medium">
          to monitor your child's location <br /> and ensure their safety
        </h6>
      </div>
      <div className="absolute top-0 right-0 mr-4 sm:mr-36 mt-14 sm:mt-16">
        <p className="text-white text-md sm:text-xl font-medium relative">
          Gps Tracking System
          <span
            className="absolute bottom-0 left-0 w-full bg-red-800"
            style={{ width: '27%', height: '2px' }}
          ></span>
        </p>
      </div>
      <div className="flex space-x-8 sm:space-x-16 absolute bottom-64 sm:bottom-36 left-8 sm:left-auto sm:ml-36">
        <a href="/login">
          <button className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg">Login</button>
        </a>
        <a href="/register">
          <button className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg">Sign Up</button>
        </a>
      </div>
      <div className="absolute bottom-0 right-0 mr-4 sm:mr-8 h-48 sm:h-96 w-48 sm:w-96 bg-phone bg-center bg-no-repeat bg-contain sm:bottom" />
    </div>
  );
};

export default Main;