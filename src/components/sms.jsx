import React, { useState, useEffect } from 'react';

function MobileNumberForm() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    validateMobileNumber(mobileNumber);
  }, [mobileNumber]);

  const validateMobileNumber = (number) => {
    const mobileNumberPattern = /^639\d{9}$/;
    setIsValid(mobileNumberPattern.test(number));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isValid) {
      alert('Mobile number accepted: ' + mobileNumber);
      setMobileNumber('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={mobileNumber}
        onChange={(e) => setMobileNumber(e.target.value)}
        placeholder="Enter mobile number"
      />
      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  );
}

export default MobileNumberForm;
