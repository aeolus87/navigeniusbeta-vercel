import React, { useState, useEffect } from "react";
import { FiInfo, FiLock, FiPhone, FiArrowLeft } from "react-icons/fi";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getAuth, signInWithEmailAndPassword, signInWithPhoneNumber } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Modal from './modal/Modal';
import { toast } from 'react-toastify'; // Import toast


const ProfilePage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [name, setName] = useState("");
  const [isNameEditable, setIsNameEditable] = useState(false);
  const [activeTab, setActiveTab] = useState("Information");
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('+63');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);

  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
  
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setName(userData.fullname); 
          setProfileImage(userData.profileImage);
        } else {
          console.log("User document not found");
        }
      } else {
        console.log("User is not authenticated");
      }
    };
  
    fetchUserData();
  }, [user]);

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSendVerificationCode = () => {
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
    });

    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        setVerificationId(confirmationResult.verificationId);
      })
      .catch((error) => {
        console.error('Error sending verification code:', error);
      });
  };

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleVerifyPhoneNumber = () => {
    if (!verificationId || !verificationCode) {
      console.error('Verification ID or code is missing.');
      return;
    }
  
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
  
    firebase.auth().currentUser.linkWithCredential(credential)
      .then((userCredential) => {
        // Phone number successfully linked to the user
        const user = userCredential.user;
  
        // Update the phone number in the Firestore database
        const userDocRef = doc(db, "users", user.uid);
        updateDoc(userDocRef, { phone_number: phoneNumber })
          .then(() => {
            console.log('Phone number updated in Firestore database');
            toast.success('Your number is verified successfully!');
          })
          .catch((error) => {
            console.error('Error updating phone number in Firestore:', error);
          });
      })
      .catch((error) => {
        console.error('Error linking phone number to user:', error);
      });
  };

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
      setSelectedFile(file);
      setShowImage(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleUpload = async () => {
    if (selectedFile && user) {
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(storageRef);
      setProfileImage(downloadURL);

      // Save the URL to the user's Firestore document
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { profileImage: downloadURL });

      setIsModalVisible(false);
    }
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

    try {
      await signInWithEmailAndPassword(auth, user.email, oldPassword);

      try {
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPassword);
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
                <div
                  className="relative lg:size-48 size-24 rounded-full bg-white flex items-center justify-center cursor-pointer"
                  onClick={handleProfilePicClick}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="rounded-full w-full h-full"
                    />
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
                    <button
                      onClick={handleSaveName}
                      className="ml-2 text-blue-500 font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="ml-4 flex items-center lg:ml-8">
                    <p className="text-white text-lg lg:text-4xl font-bold">
                      {name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === "Change Password" && (
            <div className="lg:mx-auto lg:ml-[40%] lg:mt-11 ml-24 h-[28rem] p-6 bg-[#0c2734] rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Change Password
              </h2>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              {success && <div className="text-green-500 mb-4">{success}</div>}
              <div className="mb-4">
                <label
                  htmlFor="oldPassword"
                  className="block text-white font-semibold mb-2"
                >
                  Old Password
                </label>
                <input
                  type="password"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-white font-semibold mb-2"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-white font-bold mb-2 "
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-12 lg:py-2 lg:px-[12rem] lg:text-base rounded focus:outline-none focus:shadow-outline"
              >
                Change Password
              </button>
            </div>
          )}
          {activeTab === "Phone Number" && (
            <div className="lg:mx-auto lg:ml-[40%] lg:mt-11 ml-24 h-[28rem] p-6 bg-[#0c2734] rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Update Phone Number
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-white font-semibold mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400"
                />
                <button
                  onClick={handleSendVerificationCode}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded mt-2"
                >
                  Send Verification Code
                </button>
              </div>
              <div id="recaptcha-container"></div>
              <div className="mb-4">
                <label
                  htmlFor="verificationCode"
                  className="block text-white font-semibold mb-2"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400"
                />
                <button
                  onClick={handleVerifyPhoneNumber}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded mt-2"
                >
                  Verify
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        onViewImage={handleViewImage}
        onChangeProfilePic={handleChangeProfilePic}
        showImage={showImage}
        profileImage={profileImage}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default ProfilePage;

