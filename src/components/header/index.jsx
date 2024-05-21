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
        <nav className='flex justify-between items-center z-50 w-full fixed top-0 left-0 h-16 border-b border-gray-300 bg-[#0b2d39] text-white px-4'>
            <div className="flex items-center">
                <h2 className="m-0 text-2xl">Navigenius</h2>
            </div>
            <div className="flex items-center">
                {userLoggedIn ? (
                    <button onClick={handleLogout} className='text-white bg-[#2f4b56] hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 bg-[#0b2d39] dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'>
                        Logout
                    </button>
                ) : (
                    <>
                        <Link className='text-white bg-[#2f4b56] hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 bg-[#0b2d39] dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 no-underline' to={'/login'}>
                            Login
                        </Link>
                        <Link className='text-white bg-[#2f4b56] hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 bg-[#0b2d39] dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 no-underline' to={'/register'}>
                            Register New Account
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Header;