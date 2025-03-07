import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import './header.css'; // Keep your CSS file if needed

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Theme listener
  useEffect(() => {
    const handleThemeChange = () => setDarkMode(localStorage.getItem("theme") === "dark");
    window.addEventListener("storage", handleThemeChange);
    return () => window.removeEventListener("storage", handleThemeChange);
  }, []);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/home/", icon: "fa-chart-line", label: "Market" },
    { path: "/home/chart/", icon: "fa-list", label: "Watchlist" },
    { path: "/user/portfolio", icon: "fa-wallet", label: "Portfolio" },
    { path: "/user/order/", icon: "fa-clipboard-list", label: "Orders" },
    { path: "/user/notification", icon: "fa-bell", label: "Notifications" },
    { path: "/user/profile", icon: "fa-user", label: "Profile" },
  ];

  // Animation variants for icons
  const iconVariants = {
    hover: { 
      scale: 1.1, 
      y: -5, 
      transition: { type: "spring", stiffness: 300, damping: 10 } 
    },
    tap: { scale: 0.95 },
    active: { scale: 1.05, boxShadow: darkMode ? "0 0 10px rgba(255,255,255,0.5)" : "0 0 10px rgba(0,0,0,0.3)" },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full h-[80px] sm:h-[100px] flex items-center justify-between px-4 sm:px-6 shadow-lg transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-[#2D5F8B] text-white"
      }`}
    >
      {/* Logo Section - Shifted Slightly Right */}
      <motion.div
        className="ml-4 sm:ml-8 flex items-center cursor-pointer"
        onClick={() => navigate("/home/")}
        whileHover={{ scale: 1.05 }}
      >
        <div className="flex flex-row">
          <div className="text-4xl sm:text-6xl font-serif">
            M
          </div>
          <div className="flex flex-col text-lg sm:text-xl">
            <div>oney</div>
            <div>inder</div>
          </div>
        </div>
      </motion.div>

      {/* Spacer to push nav past center */}
      <div className="flex-grow hidden lg:block" />

      {/* Desktop Navigation - Starts After Center */}
      <nav className="hidden lg:flex items-center justify-end space-x-8 mr-4 sm:mr-8 flex-grow max-w-[50%]">
        {menuItems.map((item) => (
          <motion.div
            key={item.path}
            className={`relative flex items-center justify-center cursor-pointer p-3 rounded-lg transition-colors duration-300 group ${
              isActive(item.path)
                ? darkMode
                  ? "bg-gray-700"
                  : "bg-[#002F42]"
                : darkMode
                ? "hover:bg-gray-700"
                : "hover:bg-[#002F42]"
            }`}
            onClick={() => navigate(item.path)}
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            animate={isActive(item.path) ? "active" : ""}
          >
            <i className={`fas ${item.icon} text-2xl sm:text-3xl`}></i>
            {/* Tooltip on Hover - Below Icon */}
            <span
              className={`absolute top-full mt-2 hidden group-hover:block text-sm px-3 py-1 rounded-lg shadow-md pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${
                darkMode ? "bg-gray-800 text-white" : "bg-[#002F42] text-white"
              }`}
            >
              {item.label}
            </span>
            <motion.div
              className={`absolute inset-x-0 bottom-0 h-1 rounded-t ${
                darkMode ? "bg-gray-400" : "bg-white"
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isActive(item.path) ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <motion.button
        className="lg:hidden flex items-center justify-center w-12 h-12 rounded-full bg-opacity-20 bg-white text-2xl focus:outline-none"
        onClick={toggleMenu}
        whileHover={{ scale: 1.1, backgroundColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)" }}
        whileTap={{ scale: 0.9 }}
      >
        <i className="fas fa-bars"></i>
      </motion.button>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            className={`absolute top-[80px] sm:top-[100px] right-4 w-56 rounded-lg shadow-lg py-3 z-50 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            {menuItems.map((item, index) => (
              <motion.li
                key={item.path}
                className={`px-4 py-3 flex items-center space-x-3 cursor-pointer text-lg ${
                  isActive(item.path)
                    ? darkMode
                      ? "bg-gray-700"
                      : "bg-gray-100"
                    : darkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  navigate(item.path);
                  setMenuOpen(false);
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <i className={`fas ${item.icon} text-2xl`}></i>
                <span>{item.label}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;