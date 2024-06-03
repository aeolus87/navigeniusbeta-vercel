import React, { useState, useRef } from "react";
import { FiInfo, FiLock, FiEdit, FiPhone } from "react-icons/fi";
import ChangePassword from "./ChangePassword"; 

const Modal = ({ isVisible, onClose, onViewImage, onChangeProfilePic, showImage, profileImage }) => {
  const inputFileRef = useRef(null);

  if (!isVisible) return null;

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    onChangeProfilePic(file);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        {showImage ? (
          <div className="flex flex-col items-center space-y-4">
            <img src={profileImage} alt="Profile" className="rounded-full w-48 h-48" />
            <button
              className="bg-red-500 text-white text-lg py-2 px-4 rounded hover:bg-red-600 transition duration-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <button
              className="bg-blue-500 text-white text-lg py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
              onClick={() => {
                onViewImage();
              }}
            >
              View Image
            </button>
            <button
              className="bg-green-500 text-white text-lg py-2 px-4 rounded hover:bg-green-600 transition duration-300"
              onClick={() => {
                inputFileRef.current.click();
              }}
            >
              Change Profile Picture
            </button>
            <input
              type="file"
              accept="image/*"
              ref={inputFileRef}
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />
            <button
              className="bg-red-500 text-white text-lg py-2 px-4 rounded hover:bg-red-600 transition duration-300"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [name, setName] = useState("Kanye West");
  const [isNameEditable, setIsNameEditable] = useState(false);
  const [activeTab, setActiveTab] = useState("Information");

  const inputFileRef = useRef(null);

  const handleProfilePicClick = () => {
    setIsModalVisible(true);
    setShowImage(false);
  };

  const handleViewImage = () => {
    setShowImage(true);
  };

  const handleChangeProfilePic = (file) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setShowImage(true);
      setIsModalVisible(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleEditName = () => {
    setIsNameEditable(true);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleSaveName = () => {
    setIsNameEditable(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="border-blue-950 rounded-md p-6 w-11/12 max-w-screen-lg h-4/5 max-h-screen-md bg-[#1B274A] shadow-xl relative">
        {/* Side Navbar */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-[#394771] rounded-l-md flex flex-col justify-center">
          {/* Information button */}
          <button
            className={`flex text-xl items-center text-white p-4 hover:bg-blue-700 ${activeTab === "Information" ? "bg-blue-700" : ""}`}
            onClick={() => handleTabChange("Information")}
          >
            <FiInfo className="mr-2" /> Information
          </button>
          {/* Phone Number button */}
          <button
            className={`flex text-xl items-center text-white p-4 hover:bg-blue-700 ${activeTab === "Phone Number" ? "bg-blue-700" : ""}`}
            onClick={() => handleTabChange("Phone Number")}
          >
            <FiPhone className="mr-2" /> Phone Number
          </button>
          {/* Change Password button */}
          <button className={`flex text-xl items-center text-white p-4 hover:bg-blue-700 ${activeTab === "Change Password" ? "bg-blue-700" : ""}`}
            onClick={() => handleTabChange("Change Password")}
          >
            <FiLock className="mr-2" /> Change Password
          </button>
        </div>
        {/* Profile Content */}
        <div className="ml-1/4 flex flex-col items-center relative">
          {/* Adjust margin to avoid overlapping */}
          {activeTab === "Information" && (
            <div className="absolute left-[20rem] flex items-center justify-center my-4">
              <div className="relative flex items-center">
                <div className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center cursor-pointer" onClick={handleProfilePicClick}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="rounded-full w-full h-full" />
                  ) : (
                    <span className="text-gray-500 text-4xl">👤</span>
                  )}
                </div>
                {isNameEditable ? (
                  <div className="ml-4 flex items-center">
                    <input
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      className="border-b border-gray-400 bg-transparent text-white focus:outline-none focus:border-blue-500"
                    />
                    <button onClick={handleSaveName} className="ml-2 text-blue-500 font-bold">
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="ml-4 flex items-center lg:ml-8">
                    <p className="text-white text-lg font-bold">{name}</p>
                    <FiEdit className="ml-2 cursor-pointer text-blue-500 text-2xl lg:mb-5 lg:ml-4" onClick={handleEditName} />
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Render ChangePassword component if activeTab is "Change Password" */}
          {activeTab === "Change Password" && (
            <div className="text-white lg:ml-[25%] lg:mt-14 shadow-2xl">
              <ChangePassword />
            </div>
          )}
          {/* Your additional profile content goes here */}
        </div>
      </div>
      {/* Modal */}
      <Modal isVisible={isModalVisible} onClose={handleCloseModal} onViewImage={handleViewImage} onChangeProfilePic={handleChangeProfilePic} showImage={showImage} profileImage={profileImage} />
    </div>
  );
};

export default ProfilePage;

           
