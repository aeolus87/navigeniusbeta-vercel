import React, { useState, useEffect } from 'react';
import { FiInfo, FiLock, FiPhone, FiArrowLeft, FiEdit } from 'react-icons/fi';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import {
  getAuth,
  signInWithPhoneNumber,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Modal from './modal/Modal';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProfilePage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('Information');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('+63');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState('');
  const [childName, setChildName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [sortedLoginActivities, setSortedLoginActivities] = useState([]);
  const [showLoginActivities, setShowLoginActivities] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchLoginActivities = async () => {
      try {
        const userId = firebase.auth().currentUser?.uid;
        if (!userId) {
          console.error('No user ID found');
          return;
        }
        const response = await axios.get(
          `https://navigeniusbeta-vercel.onrender.com/api/login-activities?userId=${userId}`,
        );
        console.log('Login activities response:', response.data); // Add this line
        const sortedActivities = response.data.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateB - dateA;
        });
        setSortedLoginActivities(sortedActivities);
      } catch (error) {
        console.error(
          'Error fetching login activities:',
          error.response ? error.response.data : error.message,
        );
      }
    };

    fetchLoginActivities();

    const user = firebase.auth().currentUser;
    if (user) {
      const emergencyRef = firebase.database().ref(`emergencies/${user.uid}`);
      emergencyRef.on('value', (snapshot) => {
        const emergencyData = snapshot.val();
        if (emergencyData && emergencyData.active) {
          toast.error('Emergency alert! Child has pressed the SOS button.', {
            position: 'top-center',
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      });

      return () => emergencyRef.off();
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setName(userData.fullname);
          setProfileImage(userData.profileImage);
          setVerifiedPhoneNumber(userData.phone_number || '');
          setChildName(userData.childName || '');
        } else {
          console.log('User document not found');
        }
      } else {
        console.log('User is not authenticated');
      }
    };

    fetchUserData();
  }, [user]);

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSendVerificationCode = () => {
    const appVerifier = new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
      },
    );

    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        setVerificationId(confirmationResult.verificationId);
      })
      .catch((error) => {
        console.error('Error sending verification code:', error);
      });
  };

  const handleVerifyPhoneNumber = () => {
    if (!verificationId || !verificationCode) {
      console.error('Verification ID or code is missing.');
      return;
    }

    const credential = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      verificationCode,
    );

    firebase
      .auth()
      .currentUser.linkWithCredential(credential)
      .then((userCredential) => {
        const user = userCredential.user;

        const userDocRef = doc(db, 'users', user.uid);
        updateDoc(userDocRef, { phone_number: phoneNumber })
          .then(() => {
            console.log('Phone number updated in Firestore database');

            const realtimeDbRef = firebase
              .database()
              .ref(`users/${user.uid}/emergency_contact`);
            realtimeDbRef
              .set(phoneNumber)
              .then(() => {
                console.log('Phone number updated in Realtime Database');
                toast.success(
                  'Your number is verified and set as emergency contact!',
                );
                setVerifiedPhoneNumber(phoneNumber);
              })
              .catch((error) => {
                console.error(
                  'Error updating phone number in Realtime Database:',
                  error,
                );
              });
          })
          .catch((error) => {
            console.error('Error updating phone number in Firestore:', error);
          });
      })
      .catch((error) => {
        console.error('Error linking phone number to user:', error);
      });
  };

  const handleShowLoginActivities = () => {
    setShowLoginActivities(true);
  };

  const handleCloseLoginActivities = () => {
    setShowLoginActivities(false);
  };

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
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
      if (isModalVisible) {
        setShowImage(true);
      }
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

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { profileImage: downloadURL });

      setIsModalVisible(false);
    }
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
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setError('The old password is incorrect');
      } else {
        setError(
          `An error occurred while changing the password: ${error.message}`,
        );
      }
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSaveChildName = async () => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { childName });
      console.log('Child name saved successfully');
    }
  };
  return (
    <div className="flex justify-center items-center h-screen overflow-hidden">
      <div
        className={`relative border-blue-950 rounded-md p-6 w-11/12 max-w-screen lg:h-4/5 h-[75%] max-h-screen-md bg-[#0c2734] shadow-xl transition-transform duration-500 transform-style-preserve-3d ${
          showLoginActivities ? 'lg:transform-none rotate-y-180' : ''
        }`}
      >
        <div className="absolute top-4 right-6">
          <button
            className="text-[#e4f3ff] text-2xl hover:text-[#184e64]"
            onClick={handleBack}
          >
            <FiArrowLeft />
          </button>
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-[#184e64] rounded-l-md flex flex-col justify-center z-10">
          <button
            className={`flex flex-col items-center text-white p-4 m-2 hover:bg-blue-700 rounded-lg ${
              activeTab === 'Information' ? 'bg-[#0c2734]' : ''
            }`}
            onClick={() => handleTabChange('Information')}
          >
            <FiInfo className="text-2xl" />
            <span className="hidden md:block mt-2 text-xl">Information</span>
          </button>
          <button
            className={`flex flex-col items-center text-white p-4 m-2 hover:bg-blue-700 rounded-lg ${
              activeTab === 'Phone Number' ? 'bg-[#0c2734]' : ''
            }`}
            onClick={() => handleTabChange('Phone Number')}
          >
            <FiPhone className="text-2xl" />
            <span className="hidden md:block mt-2 text-xl">Phone Number</span>
          </button>
          <button
            className={`flex flex-col items-center text-white p-4 m-2 hover:bg-blue-700 rounded-lg ${
              activeTab === 'Change Password' ? 'bg-[#0c2734]' : ''
            }`}
            onClick={() => handleTabChange('Change Password')}
          >
            <FiLock className="text-2xl" />
            <span className="hidden md:block mt-2 text-xl">
              Change Password
            </span>
          </button>
        </div>
        <div className="lg:ml-1/4 flex flex-col items-center relative z-0 lg:w-full w-auto h-screen lg:mt-6 mt-20 ml-4">
          {activeTab === 'Information' && (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="flex flex-col lg:flex-row items-center justify-center w-full h-full lg:ml-64 ml-[4.5rem]">
                <div
                  className="relative size-20 lg:w-48 lg:h-48 rounded-full bg-white cursor-pointer flex items-center justify-center lg:mb-[30rem] lg:ml-20"
                  onClick={handleProfilePicClick}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="rounded-full size-20 lg:w-44 lg:h-44"
                    />
                  ) : (
                    <span className="text-gray-500 text-xs text-center">
                      Choose Profile Picture
                    </span>
                  )}
                </div>

                <div className="flex flex-col bg-[#0c2734] rounded-2xl shadow-xl p-6 lg:w-[48rem] w-[13rem] lg:h-[30rem] h-[25rem] lg:mb-[14rem] mb-[20rem] lg:ml-6 mr-2">
                  <p className="text-[#f4f4f4] text-lg lg:text-3xl font-bold">
                    {name}
                  </p>
                  <p className="text-[#f4f4f4] text-md lg:text-xl lg:mt-2">
                    Contact Number:{' '}
                    <>
                      {' '}
                      {verifiedPhoneNumber ? (
                        <span className="font-semibold text-2xl">
                          {' '}
                          {verifiedPhoneNumber}
                        </span>
                      ) : (
                        'Not verified'
                      )}
                    </>
                  </p>
                  <p className="text-[#f4f4f4] text-md lg:text-xl mt-2">
                    Child's First Name or Nickname
                  </p>
                  <div className="flex flex-col lg:flex-row">
                    {!isEditing ? (
                      <div className="flex">
                        <p className="lg:mt-2 lg:max-w-xs rounded-md bg-[#0c2734] text-white lg:text-xl font-semibold lg:ml-0 justify-start">
                          {childName}
                        </p>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="ml-2 mb-2 [#0c2734] hover:bg-blue-700 text-white font-bold px-2 py-2 rounded"
                        >
                          <FiEdit className="lg:text-2xl" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Enter here"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          className="mt-2 px-4 py-2 lg:max-w-xs rounded-md bg-[#184e64] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 lg:mr-2 lg:text-lg"
                        />
                        <button
                          onClick={() => {
                            handleSaveChildName();
                            setIsEditing(false);
                          }}
                          className="bg-[#0c2734] hover:bg-blue-700 text-white font-bold px-4 py-2 rounded mt-2 max-w-xs lg:mt-0"
                        >
                          Save
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-[#f4f4f4] text-md lg:text-xl mt-2">
                    Account Login Activity
                  </p>
                  <div className="overflow-x-auto rounded-md lg:mt-3">
                    {/* Render the table for large screens */}
                    <table className="lg:min-w-full bg-[#184e64] text-white text-[1.16rem] rounded-md lg:block hidden">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left">Device</th>
                          <th className="px-4 py-2 text-left">Location</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(sortedLoginActivities) &&
                          sortedLoginActivities.map((activity, index) => (
                            <tr
                              key={index}
                              className="border-t border-gray-700"
                            >
                              <td className="px-2 py-2 whitespace-nowrap">
                                {activity.device}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                {activity.location}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                {activity.date}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                {activity.time}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    <button
                      className="lg:hidden block bg-[#184e64] hover:bg-[#ffffff] text-white hover:!text-[#0c2734] font-bold py-2 px-4 rounded mt-2 w-full"
                      onClick={handleShowLoginActivities}
                    >
                      Where you're logged in
                    </button>
                  </div>
                  {showLoginActivities && (
                    <div className="absolute z-10 bg-[#0c2734] p-2 rounded-md lg:hidden text-sm w-auto bottom-[39%] h-[73%] left-[16vw]">
                      <h1 className="text-white ml-2 mt-2">
                        Account Login Activity
                      </h1>
                      <p className="text-white ml-2">
                        Monitor the devices that have been used to log into your
                        account
                      </p>
                      <button
                        className="absolute mt-[22rem] right-6 bg-[#184e64] text-[#e4f3ff] text-3xl hover:text-[#0c2734] px-4 py-1 rounded-3xl"
                        onClick={handleCloseLoginActivities}
                      >
                        <FiArrowLeft />
                      </button>

                      <div className="h-[20rem] overflow-auto mt-8 rounded-xl ml-2">
                        <div className="bg-[#184e64] text-[#fafafa] rounded-md">
                          {Array.isArray(sortedLoginActivities) &&
                            sortedLoginActivities.map((activity, index) => (
                              <div
                                key={index}
                                className="border-t border-gray-700 flex items-center justify-between py-1 px-3"
                              >
                                <div>
                                  <div className="font-semibold">
                                    {activity.device}
                                  </div>
                                  <div className="text-xs">
                                    {activity.location}
                                  </div>
                                </div>
                                <div className="text-xs pl-6">
                                  {activity.date} at {activity.time}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Change Password' && (
            <div className="lg:mx-auto py-2 lg:ml-[42%] mt-6 ml-[4.5rem] lg:h-[28rem] p-6 bg-[#0c2734] rounded-lg shadow-md">
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray -400"
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
          {activeTab === 'Phone Number' && (
            <div className="lg:mx-auto lg:ml-[48%] mt-4 ml-[4.5rem] h-[26rem] p-6 bg-[#0c2734] rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Update Phone Number
              </h2>
              <div className="mb-2">
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
                  className="shadow appearance-none border rounded w-full text-sm py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#33435D] placeholder-gray-400"
                />
                <button
                  onClick={handleSendVerificationCode}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold lg:px-4 lg:py-2 px-2 py-2 rounded lg:mt-2 mt-4"
                >
                  Send Code
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
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded lg:mt-2 mt-4"
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
