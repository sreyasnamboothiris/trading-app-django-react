import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function AccountSetting() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  // Sync dark mode with the document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const settingsItems = [
    { path: "/user/profile/edit", icon: "fa-user", title: "Profile", desc: "Manage personal details" },
    { path: null, icon: "fa-file-alt", title: "Reports", desc: "Detailed reports" },
    { path: null, icon: "fa-headset", title: "Support", desc: "Chat with us" },
    { path: null, icon: "fa-credit-card", title: "Subscription Plans", desc: "Your plan details and charges" },
  ];

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.05, boxShadow: darkMode ? "0 10px 20px rgba(255,255,255,0.1)" : "0 10px 20px rgba(0,0,0,0.2)" },
    tap: { scale: 0.98 },
  };

  return (
    <div className={`p-4 sm:p-6 rounded-lg transition-colors duration-300 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
    }`}>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl sm:text-3xl font-bold mb-6"
      >
        Account Settings & Other Info
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {settingsItems.map((item, index) => (
          <motion.div
            key={item.title}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-6 sm:p-8 rounded-xl cursor-pointer transition-all duration-300 shadow-md ${
              darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-[#2D5F8B] hover:bg-[#3A7CA8]"
            }`}
            onClick={() => item.path && navigate(item.path)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <i className={`fas ${item.icon} text-2xl sm:text-3xl text-white`}></i>
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {item.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-200 dark:text-gray-300">
                  {item.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      
    </div>
  );
}

export default AccountSetting;