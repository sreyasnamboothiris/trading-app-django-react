import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current URL

  return (
    <div>
      <div className="hidden md:flex justify-center lg:w-full bg-[#002F42] p-2 rounded-lg">
        <div className="m-2">
          {/* Dashboard Button */}
          <div
            className="my-2 cursor-pointer shadow-xl 
              hover:scale-105 hover:shadow-md hover:shadow-black transform transition duration-300
              border rounded-md bg-white font-bold md:text-lg lg:text-xl text-[#002F42] lg:p-1 md:px-4 lg:px-8 md:flex items-center justify-center"
          >
            Dashboard
          </div>

          {/* User Button with Conditional Classes */}
          <div
            onClick={() => {
              navigate('/admin/user/');
            }}
            className={`my-2 justify-center flex cursor-pointer shadow-xl 
            hover:scale-105 hover:shadow-md hover:shadow-black transform transition duration-300
            border rounded-md md:text-lg lg:text-xl lg:p-1 md:px-4 lg:px-8 md:flex items-center justify-center 
            ${
              location.pathname.includes('/admin/user')
                ? 'bg-black text-white' // Active state
                : 'bg-white text-[#002F42]' // Default state
            }`}
          >
            User
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
