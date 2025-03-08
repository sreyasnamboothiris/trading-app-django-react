import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../interceptors";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";

function AddWatchlistModal({ onWatchlistAdded }) {
  const [showModal, setShowModal] = useState(false);
  const [watchlistName, setWatchlistName] = useState("");
  const [loading, setLoading] = useState(false);
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [darkMode] = useState(() =>
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  const handleAddWatchlist = () => {
    if (!watchlistName) {
      toast.error("Watchlist name cannot be empty");
      return;
    }

    setLoading(true);

    api
      .post(
        "user/account/watchlists/",
        { name: watchlistName, user_id: isAuth.user_id },
        { headers: { Authorization: `Bearer ${isAuth.access}` } }
      )
      .then((response) => {
        toast.success(response.data.message || "Watchlist created successfully");
        setTimeout(() => {
          setShowModal(false);
          setWatchlistName("");
          onWatchlistAdded();
        }, 500);
      })
      .catch((error) => {
        console.log(error);
        const errorMessage = error.response?.data?.error || "Failed to create watchlist";
        toast.error(errorMessage);
      })
      .finally(() => setLoading(false));
  };

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
    <>
      <motion.button
        type="button"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => setShowModal(true)}
        className={`w-10 h-10 flex items-center justify-center rounded-full text-2xl font-bold shadow-md relative z-10 ${
          darkMode
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-[#2D5F8B] hover:bg-[#3A7CA8] text-white"
        }`}
      >
        +
      </motion.button>

      {showModal &&
        ReactDOM.createPortal(
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
                Add Watchlist
              </h2>
              <div className="mb-6">
                <label
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Watchlist Name
                </label>
                <motion.input
                  type="text"
                  value={watchlistName}
                  onChange={(e) => setWatchlistName(e.target.value)}
                  whileFocus={{ scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" }}
                  className={`mt-1 w-full p-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600 focus:ring-gray-500 placeholder-gray-400"
                      : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-blue-500 placeholder-gray-500"
                  }`}
                  placeholder="Enter watchlist name"
                />
              </div>
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
                  onClick={handleAddWatchlist}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-[#2D5F8B] hover:bg-[#3A7CA8] text-white"
                  } ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Creating..." : "Add Watchlist"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>,
          document.getElementById("modal-root")
        )}
    </>
  );
}

export default AddWatchlistModal;