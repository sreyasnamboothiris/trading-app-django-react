import React, { useState } from "react";

function Otp() {
  const [otp, setOtp] = useState(new Array(4).fill(""));

  const handleChange = (element, index) => {
    if (!isNaN(element.value)) {
      const newOtp = [...otp];
      newOtp[index] = element.value;
      setOtp(newOtp);

      // Focus on the next input box
      if (element.nextSibling) {
        element.nextSibling.focus();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#A6A2A2]">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Enter your  OTP here</h2>
      <div className="flex gap-2">
        {otp.map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            className="w-12 h-12 text-center border-2 border-gray-300 bg-[#FFFFFF] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            value={otp[index]}
            onChange={(e) => handleChange(e.target, index)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      <button
        className="mt-6 px-6 py-2 bg-[#2D5F8B] text-white font-semibold rounded hover:bg-[#1A3B5D] transition-all"
        onClick={() => alert(`Entered OTP: ${otp.join("")}`)}
      >
        Confirm
      </button>
    </div>
  );
}

export default Otp;
