import React, { useState, useEffect } from "react";

function Otp() {
  // State for storing OTP values, initialized with an array of 4 empty strings
  const [otp, setOtp] = useState(new Array(4).fill(""));
  // State for managing the countdown timer, initialized to 30 seconds
  const [timer, setTimer] = useState(30);
  // State to manage whether the "Resend OTP" button is disabled
  const [disabled, setDisabled] = useState(true);

  // Function to handle changes in the OTP input fields
  const handleChange = (element, index) => {
    // Ensure the input is a valid number
    if (!isNaN(element.value)) {
      // Create a copy of the OTP state and update the specific index with the new value
      const newOtp = [...otp];
      newOtp[index] = element.value;
      setOtp(newOtp);

      // Automatically move focus to the next input field if it exists
      if (element.nextSibling) {
        element.nextSibling.focus();
      }
    }
  };

  // Function to handle the "Resend OTP" button click
  const handleResend = () => {
    setOtp(new Array(4).fill("")); // Clear the OTP input fields
    setTimer(30); // Reset the timer to 30 seconds
    setDisabled(true); // Disable the resend button again
  };

  // useEffect to manage the countdown timer
  useEffect(() => {
    // If the timer is greater than 0, decrease it every second
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1); // Decrement the timer state
      }, 1000);
      return () => clearInterval(interval); // Clear the interval on component unmount or state change
    } else {
      // Enable the resend button when the timer reaches 0
      setDisabled(false);
    }
  }, [timer]); // Dependency array ensures the effect runs whenever the timer changes

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#A6A2A2]">
      {/* Heading for the OTP form */}
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Enter your OTP here</h2>

      {/* Input fields for entering the OTP */}
      <div className="flex gap-2">
        {otp.map((_, index) => (
          <input
            key={index} // Unique key for each input field
            type="text" // Input type is text
            maxLength="1" // Restrict input to a single character
            className="w-12 h-12 text-center border-2 border-gray-300 bg-[#FFFFFF] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            value={otp[index]} // Bind the value to the corresponding OTP state
            onChange={(e) => handleChange(e.target, index)} // Handle input changes
            onFocus={(e) => e.target.select()} // Select the input content on focus
          />
        ))}
      </div>

      {/* Button to confirm the OTP submission */}
      <button
        className="mt-6 px-6 py-2 bg-[#2D5F8B] text-white font-semibold rounded hover:bg-[#1A3B5D] transition-all"
        onClick={() => alert(`Entered OTP: ${otp.join("")}`)} // Display the entered OTP on button click
      >
        Confirm
      </button>

      {/* Display timer or the resend button based on the timer state */}
      <div className="mt-4 text-gray-700">
        {disabled ? (
          // Show the countdown timer when the resend button is disabled
          <p>Resend OTP in {timer} seconds</p>
        ) : (
          // Show the resend button when the timer reaches 0
          <button
            className="px-6 bg-[#FF6B6B] text-white font-semibold rounded hover:bg-[#CC5555] transition-all"
            onClick={handleResend} // Reset the OTP and timer on click
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}

export default Otp;
