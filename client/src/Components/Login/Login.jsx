import React, { useState, useEffect } from 'react';
import Form from '../Form/Form';
import '../../App.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const messages = [
    "Paper trade your strategies",
    "Get real-time stock data",
    "Easy stock analysis",
    "Advanced charting tools",
    "Track your trades"
  ];
  const [displayedText, setDisplayedText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    let timeout;

    if (isTyping) {
      // Typing effect
      const currentMessage = messages[currentMessageIndex];
      const words = currentMessage.split(" ");
      const currentWord = words[currentWordIndex];

      if (displayedText.length < currentMessage.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
        }, 50); // Typing speed
      } else {
        // Wait for 1 second after typing the word is complete
        timeout = setTimeout(() => {
          setIsTyping(false);
          if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex((prevIndex) => prevIndex + 1); // Move to the next word
          }
        }, 1000); // 1-second pause after completion
      }
    } else {
      // Deleting effect
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, displayedText.length - 1));
        }, 50); // Deleting speed
      } else {
        // Move to the next message after deleting is complete
        setIsTyping(true);
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setCurrentWordIndex(0); // Reset the word index for the new message
      }
    }

    // Cleanup function
    return () => clearTimeout(timeout);
  }, [displayedText, isTyping, currentMessageIndex, currentWordIndex, messages]);

  return (
    <div className='flex justify-between w-full overflow-hidden'>
      {/* Left Side */}
      <div className='h-screen p-10 left-side rounded-md' style={{ background: 'linear-gradient(to bottom, #003B49, #002F42)', width: '50%' }}>
        <div className="flex flex-col justify-start items-center h-full">
          {/* Header at the top */}
          <div className="text-white text-2xl font-semibold mb-8">
            Welcome to
          </div>
          <div className="flex flex-row">
            <div className="text-6xl text-white font-serif">
              M
            </div>
            <div className="flex flex-col text-white text-xl">
              <div>
                oney
              </div>
              <div>
                inder
              </div>
            </div>
          </div>

          {/* Centered Typing Text without Underline */}
          <div className="flex-1 flex flex-col justify-center items-start ml-8">
            <div className="text-white text-3xl font-semibold mb-4">
              {displayedText}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='w-[50%] right-side rounded-xl'>
        <div className='flex justify-center p-4 text-black'>
          <h1 className='text-4xl font-bold'>Welcome</h1>
        </div>
        <div className='flex justify-center'>
          <p className="text-black font-semibold text-xl">
            {isLogin ? 'Please login to continue' : 'Please sign up to create your account'}
          </p>
        </div>
        <Form signupStatus={isLogin} />
        <div className='flex justify-center'>
          <div className='w-96 grid grid-cols-1 gap-6'>
            <div className="grid grid-cols-3 items-center gap-2">
              <div className="w-full h-[2px] bg-black"></div>
              <div className="text-black text-center">Or</div>
              <div className="w-full h-[2px] bg-black"></div>
            </div>
            <div className='flex items-center justify-center'>
              <p>
                {isLogin ? "Don't have an account" : 'Already have an account'}
              </p>
            </div>
            <div className="text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-[50%] py-2 bg-[#2D5F8B] text-white font-bold text-xl rounded-md hover:bg-[#05a2be] transition"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
