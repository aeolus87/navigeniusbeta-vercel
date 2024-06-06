import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Header = () => {
  const navigate = useNavigate(); 
  const { userLoggedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await doSignOut();
      notify("Logged Out");
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLogin = () => {
    // Assuming you have a login function that sets userLoggedIn to true upon successful login
    // You would trigger the toast notification here
    notify("Logged In");
  };

  const handleProfileClick = () => {
    navigate('/profile'); 
  };

  const notify = (message) => {
    toast.dark(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <>
      <ToastContainer />
      <nav className="flex justify-between items-center z-50 w-full fixed top-0 left-0 h-16  text-white px-4 transition duration-300 ease-in-out">
        <div className="flex items-center">
          <h2 className="text-2xl mt-3 lg:mt-0 xl:mt-0">Navigenius</h2>
        </div>
        <div className="flex items-center">
          {userLoggedIn && (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white mt-4 bg-[#0b2d3900] hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-3 py-2 md:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
              </button>
              <div
                className={`absolute top-16 right-0 w-[40%] bg-[#0b2d3900] md:static md:w-auto md:flex md:flex-row md:items-center ${menuOpen ? 'block' : 'hidden'} md:block transition duration-600 ease-in-out`}
              >
                <button
                  onClick={handleProfileClick} 
                  className="w-full text-left text-white hover:bg-[#1a1a4e6a] focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 md:me-2 md:mb-0"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                  }}
                  className="w-full text-left text-white hover:bg-[#1a1a4e6a] focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 md:me-2 md:mb-0"
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
