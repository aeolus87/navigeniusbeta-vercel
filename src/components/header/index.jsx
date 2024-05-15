import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';
import './header.css'; // Import CSS file for styling

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
        <nav className='header-container'>
            <div className="header-left">
                <h2 className="header-title">Navigenius</h2>
            </div>
            <div className="header-right">
                {userLoggedIn ? (
                    <button onClick={handleLogout} className='header-btn'>
                        Logout
                    </button>
                ) : (
                    <>
                        <Link className='header-link' to={'/login'}>
                            Login
                        </Link>
                        <Link className='header-link' to={'/register'}>
                            Register New Account
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Header;