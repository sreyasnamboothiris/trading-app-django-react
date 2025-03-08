import React, { useState } from "react";
import { toast } from "react-toastify"; // Added for consistency
import api from "../../interceptors";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loggedOut } from "../../store/authSlice";
import { motion, AnimatePresence } from "framer-motion";

function LogoutModal() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [darkMode] = useState(() =>
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  const handleLogout = async () => {
    try {
      await api.post(
        "/user/logout/",
        { refresh_token: localStorage.getItem("refreshToken") },
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      localStorage.clear();
      dispatch(loggedOut());
      toast.success("Logged out successfully"); // Added for feedback
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Failed to logout"); // Added for error feedback
    } finally {
      setModalIsOpen(false);
    }
  };

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    tap: { scale: 0.95 },
  };

  return (
    <div>
      {/* Button to open modal */}
      <motion.button
        type="button"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => setModalIsOpen(true)}
        className={`text-sm md:text-lg font-semibold px-4 py-2 rounded-lg shadow-md ${
          darkMode
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-[#2D5F8B] hover:bg-[#3A7CA8] text-white"
        }`}
      >
        Logout
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {modalIsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[1000]"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`w-full max-w-md p-6 rounded-xl shadow-2xl ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">
                Are you sure you want to logout?
              </h2>
              <div className="flex justify-end gap-4">
                <motion.button
                  type="button"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setModalIsOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold ${
                    darkMode
                      ? "bg-gray-600 hover:bg-gray-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold ${
                    darkMode
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LogoutModal;