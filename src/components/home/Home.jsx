import React from 'react';
import { useAuth } from '../../contexts/authContext';
import { Fmap } from './';
import Map from "./Map";

const Home = () => {
    const { currentUser } = useAuth();
    
    return (
        <div className="mx-0 my-0 px-0 bg-[#2f4b56] overflow-hidden">
            <Fmap />
            <Map />
        </div>
    );
};

export default Home;
