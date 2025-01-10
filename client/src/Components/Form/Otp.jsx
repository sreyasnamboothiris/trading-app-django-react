import React, { useState, useEffect } from "react";
import api from '../../interceptors';  // Import your axios instance
import { Navigate, useNavigate } from "react-router-dom";

function Otp({ onSuccess }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [timer, setTimer] = useState(45);
  const [disabled, setDisabled] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("user@example.com");

  const handleChange = (element, index) => {
    if (!isNaN(element.value)) {
      const newOtp = [...otp];
      newOtp[index] = element.value;
      setOtp(newOtp);
      if (element.nextSibling) {
        element.nextSibling.focus();
      }
    }
  };

  const handleResend = async () => {
    setOtp(new Array(4).fill(""));
    setTimer(45);
    setDisabled(true);
    setMessage("");
    try {
      const email = localStorage.getItem('email');
      const response = await api.post('/user/otp/resend/', { email });
      localStorage.setItem('email', response.data.email);
      setUser(response.data.email);
      setMessage("OTP has been resent. Please check your inbox.");
    } catch (error) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      setMessage("There was an error resending the OTP.");
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    try {
      const email = localStorage.getItem('email');
      const response = await api.post('user/otp/verification/', { email, enteredOtp });
      setMessage(response.data.message);
      setUser(response.data.userInfo);
      localStorage.removeItem('email');
      if (onSuccess) onSuccess();
      navigate('/');

    } catch (error) {
      setMessage(error?.response?.data?.error || "Invalid otp or has expired");
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setDisabled(false);
    }
  }, [timer]);

  return (
    <div className="flex flex-col items-center justify-center bg-[#A6A2A2]">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Enter your OTP here</h2>
      <div className="flex gap-2">
        {otp.map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            className="w-12 h-12 text-center border-2 border-gray-300 bg-[#FFFFFF] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            value={otp[index]}
            onChange={(e) => handleChange(e.target, index)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      <button
        className="mt-6 px-6 py-2 bg-[#2D5F8B] text-white font-semibold rounded hover:bg-[#1A3B5D] transition-all"
        onClick={handleVerifyOtp}
      >
        Confirm
      </button>
      <div className="mt-4 text-gray-700 flex flex-col">
        {message && <p className="p-2">{message}</p>}
        {timer > 0 ? (
          <p>Resend OTP in {timer}s</p>
        ) : (
          <button
            className="text-[#2D5F8B] font-semibold rounded transition-all"
            onClick={handleResend}
            disabled={disabled}
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}

export default Otp;
