import React from 'react';
import { Fmap } from '.';
import Map from './Map';

const Dashboard = () => {
  return (
    <div className="h-screen mx-0 my-0 px-0 py-5 bg-[#00000000] z-20">
      <Fmap />
      <Map />
    </div>
  );
};

export default Dashboard;
