import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../interceptors";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

function ResetPasswordButton() {
  const [showModal, setShowModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [darkMode] = useState(() =>
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  const handlePasswordReset = () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);

    const userData = JSON.parse(localStorage.getItem("userInfo"));

    api
      .post(
        "user/password/reset/",
        {
          user_id: userData.user_id,
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        {
          headers: { Authorization: `Bearer ${isAuth.access}` },
        }
      )
      .then(() => {
        toast.success("Password successfully changed");
        setShowModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch((error) => {
        if (error.response?.data) {
          const errors = error.response.data;
          Object.entries(errors).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((msg) => toast.error(msg));
            } else if (typeof value === "object" && value.message) {
              toast.error(value.message);
            } else {
              toast.error(value);
            }
          });
        } else {
          toast.error("An unexpected error occurred.");
        }
      })
      .finally(() => setLoading(false));
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
      {/* Trigger Button */}
      <motion.button
        type="button"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => setShowModal(true)}
        className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold shadow-md ${
          darkMode
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-[#2D5F8B] hover:bg-[#3A7CA8] text-white"
        }`}
      >
        Reset Password
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
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
                Change Password
              </h2>

              {/* Form Fields */}
              <div className="space-y-4">
                {[
                  { label: "Old Password", value: oldPassword, setter: setOldPassword },
                  { label: "New Password", value: newPassword, setter: setNewPassword },
                  { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword },
                ].map((field, index) => (
                  <div key={index}>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {field.label}
                    </label>
                    <motion.input
                      type="password"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      whileFocus={{ scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" }}
                      className={`mt-1 w-full p-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                        darkMode
                          ? "bg-gray-700 text-white border-gray-600 focus:ring-gray-500 placeholder-gray-400"
                          : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-blue-500 placeholder-gray-500"
                      }`}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <motion.button
                  type="button"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold ${
                    darkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-[#2D5F8B] hover:bg-[#3A7CA8] text-white"
                  } ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Updating..." : "Confirm"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ResetPasswordButton;
