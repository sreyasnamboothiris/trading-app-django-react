import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { loggedOut } from "../../../store/authSlice";
import api from "../../../interceptors";
import AccountSetting from "./AccountSetting";
import LogoutModal from "../LogoutModal";

function ProfileContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const { setSelectedAsset } = useSelector((state) => state.homeData);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    setLoading(true);
    api
      .get(`user/profile/${isAuth.user_id}/`, {
        headers: { Authorization: `Bearer ${isAuth.access}` },
      })
      .then((response) => {
        setUser(response.data.user);
        setAccount(response.data.account);
        setSelectedAsset(response.data.account.default_asset);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
        setLoading(false);
      });
  }, [isAuth.user_id, isAuth.access, setSelectedAsset]);

  // Sync dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.03, boxShadow: darkMode ? "0 10px 20px rgba(255,255,255,0.1)" : "0 10px 20px rgba(0,0,0,0.2)" },
    tap: { scale: 0.98 },
  };

  return (
    <div className={`p-4 sm:p-6 transition-colors duration-300 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
    }`}>
      {/* Header Section */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
        className={`w-full h-24 sm:h-28 flex justify-between items-center px-4 sm:px-6 rounded-xl shadow-md ${
          darkMode ? "bg-gray-800" : "bg-[#2D5F8B]"
        }`}
      >
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold text-white">My Account</h1>
          <h2 className="text-lg sm:text-xl text-gray-200">
            {loading ? "Loading..." : `${user?.first_name || ""} ${user?.last_name || ""}`}
          </h2>
        </div>
        <div className="flex items-center space-x-4 sm:space-x-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`text-sm sm:text-lg font-semibold text-white px-3 py-1 rounded-lg ${
              darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-[#1A3B5D] hover:bg-[#3A7CA8]"
            }`}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
            <span className="ml-2">{darkMode ? "Light" : "Dark"}</span>
          </motion.button>
          <LogoutModal />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* Account Balance Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          transition={{ duration: 0.5 }}
          className={`rounded-2xl p-4 sm:p-6 shadow-md ${
            darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-[#1A3B5D] hover:bg-[#2D5F8B]"
          }`}
        >
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {account?.name || "Account"}
          </h3>
          <div className={`mt-4 p-4 sm:p-6 rounded-lg ${
            darkMode ? "bg-gray-700" : "bg-[#2D5F8B]"
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <p className="text-sm sm:text-lg text-gray-200">Trading Balance</p>
                <p className="text-lg sm:text-2xl font-bold text-white">
                  {loading ? "Loading..." : account?.funds || "0.00"}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold text-white ${
                  darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-[#1A3B5D] hover:bg-[#3A7CA8]"
                }`}
              >
                <i className="fas fa-plus mr-2"></i>Add Funds
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Account Settings Section */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`rounded-2xl p-4 sm:p-6 shadow-md ${
            darkMode ? "bg-gray-800" : "bg-[#1A3B5D]"
          }`}
        >
          <AccountSetting />
        </motion.div>
      </div>
    </div>
  );
}

export default ProfileContent;