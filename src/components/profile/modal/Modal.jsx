import React, { useRef } from 'react';

const Modal = ({ isVisible, onClose, onViewImage, onChangeProfilePic, showImage, profileImage, onUpload }) => {
  const inputFileRef = useRef(null);

  if (!isVisible) return null;

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    onChangeProfilePic(file);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        {showImage ? (
          <div className="flex flex-col items-center space-y-4">
            <img src={profileImage} alt="Profile" className="rounded-full lg:size-72 size-48" />
            <button className="bg-blue-500 text-white text-lg py-2 px-4 rounded hover:bg-blue-600 transition duration-300" onClick={onUpload}>Upload</button>
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

export default Modal;
