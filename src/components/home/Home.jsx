import React from 'react';
import { useAuth } from '../../contexts/authContext';
import { Fmap } from './';
import Map from "./Map";

const Home = () => {
    const { currentUser } = useAuth();
    
    return (
        <div>
            <Fmap />
            <Map />
        </div>
    );
};

export default Home;
