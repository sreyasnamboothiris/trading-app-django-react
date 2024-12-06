import React, { useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation from react-router-dom

// Import your PNG icons
import MarketIcon from "../../assets/header/icons/market.png";
import WatchlistIcon from "../../assets/header/icons/watchlist.png";
import PortfolioIcon from "../../assets/header/icons/portfolio.png";
import OrdersIcon from "../../assets/header/icons/orders.png";
import NotificationsIcon from "../../assets/header/icons/notification.png";
import ProfileIcon from "../../assets/header/icons/profile.png";

// Import the CSS file for styling
import './header.css'; // Import your CSS file here

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation(); // Get the current location (URL)

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Function to check if the current URL matches the route of a particular menu item
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-[#2D5F8B] w-full h-[100px] flex items-center px-6">
      {/* Left Empty Section */}
      <div className="flex-grow">
        <h1>Money Minder</h1>
      </div>

      {/* Right Section */}
      <div>
        <div className=" hidden lg:flex grid grid-cols-6 gap-6">
        <div className={`relative group cursor-pointer hover:bg-[#002F42] rounded-md w-10 h-10 flex items-center justify-center transition-colors duration-700 ease-in-out hover:bg-[#002F42] ${isActive("/user/market") ? "bg-[#002F42] rounded" : ""}`}>
            <img src={MarketIcon} alt="Watchlist" className="w-8 h-8 rounded" />
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#002F42] text-white text-xs px-2 py-1 rounded">
              Market
            </div>
          </div>
          <div className={`relative group cursor-pointer hover:bg-[#002F42] rounded-md w-10 h-10 flex items-center justify-center transition-colors duration-700 ease-in-out hover:bg-[#002F42] ${isActive("/user/watchlist") ? "bg-[#002F42] rounded" : ""}`}>
            <img src={WatchlistIcon} alt="Watchlist" className="w-8 h-8 rounded" />
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#002F42] text-white text-xs px-2 py-1 rounded">
              Watchlist
            </div>
          </div>
          <div className={`relative group cursor-pointer hover:bg-[#002F42] rounded-md w-10 h-10 flex items-center justify-center transition-colors duration-700 ease-in-out hover:bg-[#002F42] ${isActive("/user/portfolio") ? "bg-[#002F42] rounded" : ""}`}>
            <img src={PortfolioIcon} alt="Watchlist" className="w-8 h-8 rounded" />
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#002F42] text-white text-xs px-2 py-1 rounded">
              Portfolio
            </div>
          </div>
          <div className={`relative group cursor-pointer hover:bg-[#002F42] rounded-md w-10 h-10 flex items-center justify-center transition-colors duration-700 ease-in-out hover:bg-[#002F42] ${isActive("/user/orders") ? "bg-[#002F42] rounded" : ""}`}>
            <img src={OrdersIcon} alt="Watchlist" className="w-8 h-8 rounded" />
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#002F42] text-white text-xs px-2 py-1 rounded">
              Orders
            </div>
          </div>
          <div className={`relative group cursor-pointer hover:bg-[#002F42] rounded-md w-10 h-10 flex items-center justify-center transition-colors duration-700 ease-in-out hover:bg-[#002F42] ${isActive("/user/notification") ? "bg-[#002F42] rounded" : ""}`}>
            <img src={NotificationsIcon} alt="Watchlist" className="w-8 h-8 rounded" />
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#002F42] text-white text-xs px-2 py-1 rounded">
              Notifications
            </div>
          </div>
          <div className={`relative group cursor-pointer hover:bg-[#002F42] rounded-md w-10 h-10 flex items-center justify-center transition-colors duration-700 ease-in-out hover:bg-[#002F42] ${isActive("/user/profile") ? "bg-[#002F42] rounded" : ""}`}>
            <img src={ProfileIcon} alt="Watchlist" className="w-8 h-8 rounded" />
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#002F42] text-white text-xs px-2 py-1 rounded">
              Profile
            </div>
          </div>
          
          <div>

          </div>
        </div>
        
      </div>
      <nav className="">
        {/* Desktop Menu */}

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white text-xl focus:outline-none"
          onClick={toggleMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <ul className="absolute top-full right-0 mt-2 bg-white text-black shadow-lg rounded-md w-48 flex flex-col items-start py-2">
            <li
              className={`px-4 py-2 hover:bg-gray-100 ${isActive("/user/market") ? "icon-active" : ""}`}
            >
              <img src={MarketIcon} alt="Market" className="w-5 h-5 inline-block mr-2" /> Market
            </li>
            <li
              className={`px-4 py-2 hover:bg-gray-100 ${isActive("/user/watchlist") ? "icon-active" : ""}`}
            >
              <img src={WatchlistIcon} alt="Watchlist" className="w-5 h-5 inline-block mr-2" /> Watchlist
            </li>
            <li
              className={`px-4 py-2 hover:bg-gray-100 ${isActive("/user/portfolio") ? "icon-active" : ""}`}
            >
              <img src={PortfolioIcon} alt="Portfolio" className="w-5 h-5 inline-block mr-2" /> Portfolio
            </li>
            <li
              className={`px-4 py-2 hover:bg-gray-100 ${isActive("/user/orders") ? "icon-active" : ""}`}
            >
              <img src={OrdersIcon} alt="Orders" className="w-5 h-5 inline-block mr-2" /> Orders
            </li>
            <li
              className={`px-4 py-2 hover:bg-gray-100 ${isActive("/user/notifications") ? "icon-active" : ""}`}
            >
              <img src={NotificationsIcon} alt="Notifications" className="w-5 h-5 inline-block mr-2" /> Notifications
            </li>
            <li
              className={`px-4 py-2 hover:bg-gray-100 ${isActive("/user/profile") ? "icon-active" : ""}`}
            >
              <img src={ProfileIcon} alt="Profile" className="w-5 h-5 inline-block mr-2" /> Profile
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}

export default Header;
