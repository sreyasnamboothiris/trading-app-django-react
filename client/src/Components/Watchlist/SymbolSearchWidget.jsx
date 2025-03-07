import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../interceptors";

function SymbolSearchWidget({ activeWatchlist, onAssetAdded }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [assets, setAssets] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });
  const isAuth = useSelector((state) => state.auth.isAuth);
  const listContainerRef = useRef(null);
  const [loadedCount, setLoadedCount] = useState(0);

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

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setAssets([]);
    setHasMore(true);
    setLoadedCount(0);
  };

  const fetchAssets = async (query, offset = 0, limit = 3) => {
    if (loading || !query) return;
    setLoading(true);
    try {
      const response = await api.get(`market/assets/search/?query=${query}&offset=${offset}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${isAuth.access}` },
      });
      setAssets((prevAssets) => [...prevAssets, ...response.data]);
      setLoadedCount((prevCount) => prevCount + response.data.length);
      if (response.data.length < limit) setHasMore(false);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) fetchAssets(searchQuery, 0, 3);
  }, [searchQuery]);

  const handleAddAsset = (asset) => {
    api
      .post(
        "user/account/watchlists/list/",
        { watchlistId: activeWatchlist, asset: asset },
        { headers: { Authorization: `Bearer ${isAuth.access}` } }
      )
      .then((response) => {
        console.log("Asset added successfully", response.data);
        onAssetAdded();
        setSearchQuery(""); // Clear search after adding
        setAssets([]);
      })
      .catch((error) => console.error("Error adding asset:", error));
  };

  const handleScroll = () => {
    const container = listContainerRef.current;
    if (!container || !hasMore || loading) return;
    const bottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 1;
    if (bottom) fetchAssets(searchQuery, loadedCount, 3);
  };

  useEffect(() => {
    const container = listContainerRef.current;
    if (container) container.addEventListener("scroll", handleScroll);
    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, loading, loadedCount, searchQuery]);

  // Animation variants
  const inputVariants = {
    focus: { scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" },
  };

  const listVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    hover: { scale: 1.03, backgroundColor: darkMode ? "#4B5563" : "#E5E7EB" },
    tap: { scale: 0.98 },
  };

  return (
    <div className="mt-4 sm:mt-6">
      {/* Search Input */}
      <motion.div
        variants={inputVariants}
        whileFocus="focus"
        transition={{ duration: 0.2 }}
        className={`relative w-full`}
      >
        <input
          type="text"
          placeholder="Search stocks & indices"
          value={searchQuery}
          onChange={handleSearchChange}
          className={`w-full p-3 sm:p-4 text-sm sm:text-base rounded-xl shadow-md focus:outline-none focus:ring-2 transition-all duration-300 ${
            darkMode
              ? "bg-gray-700 text-white border-gray-600 focus:ring-gray-500 placeholder-gray-400"
              : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500 placeholder-gray-500"
          }`}
        />
        {searchQuery && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </motion.button>
        )}
      </motion.div>

      {/* Search Results */}
      <AnimatePresence>
        {assets.length > 0 && (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            ref={listContainerRef}
            className={`mt-4 max-h-60 overflow-y-auto rounded-lg shadow-md p-2 sm:p-3 ${
              darkMode ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <ul className="space-y-2">
              {assets.map((asset) => (
                <motion.li
                  key={asset.id}
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  transition={{ duration: 0.2 }}
                  className={`flex items-center justify-between p-2 sm:p-3 rounded-md transition-colors duration-200 ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                  }`}
                >
                  <span className={`text-sm sm:text-base ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                    {asset.name}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAddAsset(asset)}
                    className={`p-2 rounded-full text-white ${
                      darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    <i className="fas fa-plus"></i>
                  </motion.button>
                </motion.li>
              ))}
            </ul>
            {loading && hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center py-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Loading more...
              </motion.div>
            )}
            {!hasMore && assets.length > 0 && (
              <div className={`text-center py-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                No more assets
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SymbolSearchWidget;