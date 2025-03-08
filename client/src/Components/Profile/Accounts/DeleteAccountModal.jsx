import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../interceptors";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

function DeleteAccountModal({ account, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [darkMode] = useState(() =>
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  const handleDeleteAccount = () => {
    setLoading(true);

    api
      .delete(`user/account/delete/`, {
        headers: { Authorization: `Bearer ${isAuth.access}` },
        data: { account_id: account.id },
      })
      .then(() => {
        toast.success("Account deleted successfully");
        setShowModal(false);
        onDelete();
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.error || "Error deleting account";
        toast.error(errorMessage);
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
        className="text-red-500 hover:text-red-700 font-semibold text-sm"
      >
        Delete
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
                Delete Account
              </h2>

              {/* Confirmation Message */}
              <div className="mb-6">
                <p
                  className={`text-sm sm:text-base text-center ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Are you sure you want to delete the account{" "}
                  <span className="font-semibold">"{account.name}"</span>? This action cannot be undone.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <motion.button
                  type="button"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setShowModal(false)}
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
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold ${
                    darkMode
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  } ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Deleting..." : "Delete"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DeleteAccountModal;