import React, { useRef, useState } from 'react';

const Modal = ({
  isVisible,
  onClose,
  onViewImage,
  onChangeProfilePic,
  showImage,
  profileImage,
  onUpload,
}) => {
  const inputFileRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isVisible) return null;

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    onChangeProfilePic(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        {showImage ? (
          <div className="flex flex-col items-center space-y-4">
            <img
              src={profileImage}
              alt="Profile"
              className="rounded-full lg:size-72 size-48"
            />
            <div className="flex space-x-4">
              <button
                className="bg-red-500 text-white text-lg py-2 px-4 rounded hover:bg-red-600 transition duration-300"
                onClick={onClose}
              >
                Close
              </button>
              {selectedFile && (
                <button
                  className="bg-green-500 text-white text-lg py-2 px-4 rounded hover:bg-green-600 transition duration-300"
                  onClick={handleUpload}
                >
                  Upload
                </button>
              )}
              {!onChangeProfilePic && (
                <button
                  className="bg-blue-500 text-white text-lg py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                  onClick={() => onViewImage()}
                >
                  View Image
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-center">
              <img
                src={profileImage}
                alt="Profile"
                className="rounded-full lg:size-72 size-48"
              />
            </div>
            <div className="flex space-x-4">
              <button
                className="bg-red-500 text-white text-lg py-2 px-4 rounded hover:bg-red-600 transition duration-300"
                onClick={onClose}
              >
                Cancel
              </button>
              {onChangeProfilePic && (
                <>
                  <button
                    className="bg-blue-500 text-white text-lg py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                    onClick={() => inputFileRef.current.click()}
                  >
                    Upload Image
                  </button>
                </>
              )}
            </div>
            {/* Input for file selection */}
            <input
              type="file"
              accept="image/*"
              ref={inputFileRef}
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
