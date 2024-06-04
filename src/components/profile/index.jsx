import React, { useState, useRef } from "react";
import { FiInfo, FiLock, FiEdit, FiPhone, FiArrowLeft } from "react-icons/fi";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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
           <img src={profileImage} alt="Profile" className="rounded-full lg:size-72 size-48" />
           <button className="bg-red-500 text-white text-lg py-2 px-4 rounded hover:bg-red-600 transition duration-300" onClick={onClose}>Close</button>
         </div>
       ) : (
         <div className="flex flex-col space-y-4">
           <button className="bg-blue-500 text-white text-lg py-2 px-4 rounded hover:bg-blue-600 transition duration-300" onClick={() => onViewImage()}>View Image</button>
           <button className="bg-green-500 text-white text-lg py-2 px-4 rounded hover:bg-green-600 transition duration-300" onClick={() => inputFileRef.current.click()}>Change Profile Picture</button>
           <input type="file" accept="image/*" ref={inputFileRef} style={{ display: "none" }} onChange={handleFileInputChange} />
           <button className="bg-red-500 text-white text-lg py-2 px-4 rounded hover:bg-red-600 transition duration-300" onClick={onClose}>Cancel</button>
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
 const [oldPassword, setOldPassword] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 const [currentUserEmail, setCurrentUserEmail] = useState('');

 const inputFileRef = useRef(null);
 const navigate = useNavigate();

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

 const handlePasswordChange = async () => {
   setError('');
   setSuccess('');

   if (newPassword !== confirmPassword) {
     setError('New password and confirm password do not match');
     return;
   }

   const user = firebase.auth().currentUser;
   const auth = getAuth();

   try {
     await signInWithEmailAndPassword(auth, user.email, oldPassword);
     const currentUserEmail = user.email;

     try {
       const credential = firebase.auth.EmailAuthProvider.credential(currentUserEmail, oldPassword);
       await user.reauthenticateWithCredential(credential);
       await user.updatePassword(newPassword);
       setSuccess('Password changed successfully');
       setOldPassword('');
       setNewPassword('');
       setConfirmPassword('');
     } catch (error) {
       setError('An error occurred while changing the password');
     }
   } catch (error) {
     setError('The old password is incorrect');
   }
 };

 const handleBack = () => {
   navigate('/home');
 };

 return (
   <div className="flex justify-center items-center h-screen">
     <div className="relative border-blue-950 rounded-md p-6 w-11/12 max-w-screen lg:h-4/5 h-[63%] max-h-screen-md bg-[#0c2734] shadow-xl">
       <div className="absolute top-4 right-4">
       <button className="text-[#e4f3ff] text-2xl hover:text-[#184e64]" onClick={handleBack}>
           <FiArrowLeft />
         </button>
       </div>
       <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-[#184e64] rounded-l-md flex flex-col justify-center z-10">
         <button className={`flex flex-col items-center text-white p-4 m-2 hover:bg-blue-700 rounded-lg ${activeTab === "Information" ? "bg-[#0c2734]" : ""}`} onClick={() => handleTabChange("Information")}>
           <FiInfo className="text-2xl" />
           <span className="hidden md:block mt-2 text-xl">Information</span>
         </button>
         <button className={`flex flex-col items-center text-white p-4 m-2 hover:bg-blue-700 rounded-lg ${activeTab === "Phone Number" ? "bg-[#0c2734]" : ""}`} onClick={() => handleTabChange("Phone Number")}>
           <FiPhone className="text-2xl" />
           <span className="hidden md:block mt-2 text-xl">Phone Number</span>
         </button>
         <button className={`flex flex-col items-center text-white p-4 m-2 hover:bg-blue-700 rounded-lg ${activeTab === "Change Password" ? "bg-[#0c2734]" : ""}`} onClick={() => handleTabChange("Change Password")}>
           <FiLock className="text-2xl" />
           <span className="hidden md:block mt-2 text-xl">Change Password</span>
         </button>
       </div>
       <div className="lg:ml-1/4 flex flex-col items-center relative z-0">
         {activeTab === "Information" && (
           <div className="absolute lg:left-[30rem] left-[30%] flex items-center justify-center my-4">
             <div className="relative flex items-center">
               <div className="relative lg:size-48 size-24 rounded-full bg-white flex items-center justify-center cursor-pointer" onClick={handleProfilePicClick}>
                 {profileImage ? (
                   <img src={profileImage} alt="Profile" className="rounded-full w-full h-full" />
                 ) : (
                   <span className="text-gray-500 text-4xl">👤</span>
                 )}
               </div>
               {isNameEditable ? (
                 <div className="ml-4 flex items-center">
                   <input type="text" value={name} onChange={handleNameChange} className="border-b border-gray-400 bg-transparent text-white focus:outline-none focus:border-blue-500" />
                   <button onClick={handleSaveName} className="ml-2 text-blue-500 font-bold">Save</button>
                 </div>
               ) : (
                 <div className="ml-4 flex items-center lg:ml-8">
                   <p className="text-white text-lg lg:text-4xl font-bold">{name}</p>
                   <FiEdit className="ml-2 cursor-pointer text-blue-500 text-2xl lg:mb-5 mb-3 lg:ml-4" onClick={handleEditName} />
                 </div>
               )}
             </div>
           </div>
         )}
         {activeTab === "Change Password" && (
           <div className="lg:mx-auto lg:ml-[40%] lg:mt-11 ml-24 h-[28rem] p-6 bg-[#  0c2734] rounded-lg shadow-md">
             <h2 className="text-2xl font-semibold text-white mb-4">Change Password</h2>
             {error && <div className="text-red-500 mb-4">{error}</div>}
             {success && <div className="text-green-500 mb-4">{success}</div>}
             <div className="mb-4">
               <label htmlFor="oldPassword" className="block text-white font-semibold mb-2">Old Password</label>
               <input type="password" id="oldPassword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400" />
             </div>
             <div className="mb-4">
               <label htmlFor="newPassword" className="block text-white font-semibold mb-2">New Password</label>
               <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400" />
             </div>
             <div className="mb-4">
               <label htmlFor="confirmPassword" className="block text-white font-bold mb-2 ">Confirm Password</label>
               <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400" />
             </div>
             <button onClick={handlePasswordChange} className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-12 lg:py-2 lg:px-[12rem] lg:text-base rounded focus:outline-none focus:shadow-outline">Change Password</button>
           </div>
         )}
       </div>
     </div>
     <Modal isVisible={isModalVisible} onClose={handleCloseModal} onViewImage={handleViewImage} onChangeProfilePic={handleChangeProfilePic} showImage={showImage} profileImage={profileImage} />
   </div>
 );
};

export default ProfilePage;