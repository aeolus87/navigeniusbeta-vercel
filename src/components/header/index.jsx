import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Header = () => {
  const navigate = useNavigate();
  const { userLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    setMenuOpen(false);
    navigate('/profile');
  };

  const handleLocationAndAlertsClick = () => {
    setMenuOpen(false);
    navigate('/locationalerts');
  };

  return (
    <>
      <ToastContainer />
      <nav className="flex justify-between items-center z-50 w-full fixed top-0 left-0 h-16 text-white px-4 transition duration-300 ease-in-out">
        <div className="flex items-center">
          <h2
            className="
    text-2xl lg:ml-12 mt-3 lg:mt-0 xl:mt-0 
    transition-all ease-in-out
    hover:text-shadow hover:shadow-[#8be2ff]
  "
          >
            NAVIGENIUS
          </h2>{' '}
        </div>
        <div className="flex items-center">
          {userLoggedIn && (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white mt-4 bg-[#0b2d3900] hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-3 py-2 md:hidden"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  ></path>
                </svg>
              </button>
              <div
                className={`absolute top-16 right-0 lg:mt-4 lg:bg-[#31242400] bg-[#0c273400] lg:static lg:flex lg:flex-row lg:items-center ${menuOpen ? 'block' : 'hidden'} md:block transition duration-600 ease-in-out ${menuOpen ? 'backdrop-blur-[10px]' : ''}
`}
              >
                <button
                  onClick={handleProfileClick}
                  className="w-full text-center text-white hover:bg-[#184e64] focus:outline-none font-medium rounded-lg lg:text-lg text-sm px-5 lg:py-[1rem] py-2.5 md:me-2 md:mb-0"
                >
                  Profile
                </button>
                <button
                  onClick={handleLocationAndAlertsClick}
                  className="w-full text-center text-white hover:bg-[#184e64] focus:outline-none font-medium rounded-lg lg:text-lg text-sm px-5 py-1 md:me-2 md:mb-0"
                >
                  Location & Alerts
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-center text-white hover:bg-[#184e64] focus:outline-none font-medium rounded-lg lg:text-lg text-sm px-5 lg:py-[1rem] md:me-2 md:mb-0"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
