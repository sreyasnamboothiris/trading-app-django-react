import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../interceptors";
import SymbolSearchWidget from "./SymbolSearchWidget";
import AddWatchlistModal from "./AddWatchlistModal";
import WatchlistItems from "./WatchlistItems";
import './watchlist.css';

function Watchlist() {
  const [activeWatchlist, setActiveWatchlist] = useState(null);
  const [activeWatchlistId, setActiveWatchlistId] = useState(null);
  const [watchlists, setWatchlists] = useState({});
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  const isAuth = useSelector((state) => state.auth.isAuth);

  // Fetch watchlists
  const fetchWatchlists = async () => {
    try {
      const response = await api.get("/user/account/watchlists/", {
        headers: { Authorization: `Bearer ${isAuth.access}` },
      });
      setWatchlists(response.data);
      if (response.data && !activeWatchlist && Object.keys(response.data).length > 0) {
        const firstWatchlistId = response.data[Object.keys(response.data)[0]].id;
        setActiveWatchlist(0);
        setActiveWatchlistId(firstWatchlistId);
      }
    } catch (error) {
      console.error("Error fetching watchlists:", error);
    }
  };

  useEffect(() => {
    if (isAuth) fetchWatchlists();
  }, [isAuth]);

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

  const handleWatchlistChange = (index, id) => {
    setActiveWatchlist(index);
    setActiveWatchlistId(id);
  };

  // Animation variants
  const tabVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.1, transition: { type: "spring", stiffness: 300 } },
    tap: { scale: 0.95 },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`w-full md:w-80 p-4 sm:p-6 flex flex-col rounded-xl shadow-lg transition-colors duration-300 ${
        darkMode ? "bg-gray-800 text-white" : "bg-[#2D5F8B] text-white"
      }`}
    >
      {/* Top Navigation */}
      <div className="flex flex-row items-center justify-start flex-shrink-0">
        {Object.keys(watchlists).map((watchlistId, index) => (
          <motion.div
            key={watchlistId}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => handleWatchlistChange(index, watchlists[watchlistId]?.id)}
            className={`relative flex flex-col items-center justify-center cursor-pointer p-2 sm:p-3 rounded-lg transition-all duration-300 group ${
              activeWatchlist === index
                ? darkMode
                  ? "bg-gray-700"
                  : "bg-[#1A3B5D]"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <span className="text-2xl sm:text-3xl font-bold">{index + 1}</span>
            <motion.div
              className={`w-full h-1 mt-1 rounded ${
                darkMode ? "bg-gray-400" : "bg-white"
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: activeWatchlist === index ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
            {/* Tooltip */}
            <span
              className={`absolute top-full mt-2 hidden group-hover:block text-xs sm:text-sm px-2 py-1 rounded-lg shadow-md pointer-events-none transition-opacity duration-200 ${
                darkMode ? "bg-gray-900 text-white" : "bg-[#002F42] text-white"
              }`}
            >
              {watchlists[watchlistId]?.name}
            </span>
          </motion.div>
        ))}
        <motion.div
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          transition={{ duration: 0.3, delay: Object.keys(watchlists).length * 0.1 }}
          className="flex items-center justify-center p-2 sm:p-3"
        >
          <AddWatchlistModal />
        </motion.div>
      </div>

      {/* Symbol Search */}
      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full mt-4 sm:mt-6 flex-shrink-0"
      >
        <SymbolSearchWidget activeWatchlist={activeWatchlistId} onAssetAdded={fetchWatchlists} />
      </motion.div>

      {/* Watchlist Items */}
      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full mt-4 sm:mt-6 flex-1"
      >
        <AnimatePresence mode="wait">
          {activeWatchlistId && (
            <motion.div
              key={activeWatchlistId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <WatchlistItems watchlistId={activeWatchlistId} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Theme Toggle */}
     
    </motion.div>
  );
}

export default Watchlist;