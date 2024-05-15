import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';

const Header = () => {
    const navigate = useNavigate();
    const { userLoggedIn } = useAuth();

    const handleLogout = async () => {
        try {
            await doSignOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <nav className='flex justify-between items-center w-full fixed top-0 left-0 h-16 border-b border-gray-300 bg-[#0b2d39] text-white px-4 z-1'>
            <div className="flex items-center">
                <h2 className="m-0 text-2xl">Navigenius</h2>
            </div>
            <div className="flex items-center">
                {userLoggedIn ? (
                    <button onClick={handleLogout} className='header-btn bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center'>
                        Logout
                    </button>
                ) : (
                    <>
                        <Link className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center' to={'/login'}>
                            Login
                        </Link>
                        <Link className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center' to={'/register'}>
                            Register New Account
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Header;