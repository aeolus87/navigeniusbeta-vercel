import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';

const Header = () => {
  const navigate = useNavigate(); // Import useNavigate hook
  const { userLoggedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await doSignOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile'); // Navigate to the profile page
  };

  return (
    <nav className="flex justify-between items-center z-50 w-full fixed top-0 left-0 h-16  text-white px-4 transition duration-300 ease-in-out">
      <div className="flex items-center">
        <h2 className="m-0 text-2xl">Navigenius</h2>
      </div>
      <div className="flex items-center">
        {userLoggedIn && (
          <>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white bg-[#0b2d39] hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
            <div
              className={`absolute top-16 right-0 w-[40%] bg-[#0b2d3900] md:static md:w-auto md:flex md:flex-row md:items-center ${menuOpen ? 'block' : 'hidden'} md:block transition duration-600 ease-in-out`}
            >
              <button
                onClick={handleProfileClick} // Update onClick to navigate to the profile page
                className="w-full text-left text-white hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 md:me-2 md:mb-0"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left text-white hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 md:me-2 md:mb-0"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
