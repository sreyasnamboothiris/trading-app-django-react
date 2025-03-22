import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../interceptors";
import { ws } from "../../api";
import { setSelectedAsset, setWatchlistData, updateIsOrder } from "../../store/homeDataSlice";
import OrderModal from "../Positions/OrderModal";

function WatchlistItems({ watchlistId }) {
  const [stocks, setStocks] = useState([]);
  const [stockPrice, setStockPrice] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const [activeTooltip, setActiveTooltip] = useState(null);
  const isAuth = useSelector((state) => state.auth.isAuth);
  const { orderAsset } = useSelector((state) => state.homeData);
  const dispatch = useDispatch();

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

  // Fetch watchlist items
  useEffect(() => {
    if (!watchlistId) return;
    const fetchWatchlistItems = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/user/account/watchlists/list/${watchlistId}/`, {
          headers: { Authorization: `Bearer ${isAuth.access}` },
        });
        setStocks(response.data);
        const priceMap = {};
        response.data.forEach((stock) => {
          const key = stock.asset.smart_api_token || stock.asset.symbol;
          priceMap[key] = stock.asset.last_traded_price;
        });
        setStockPrice(priceMap);
      } catch (error) {
        console.error("Error fetching stock data:", error);
        setError("Error fetching stock data");
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlistItems();
  }, [watchlistId, isAuth.access]);

  // WebSocket for real-time updates
  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/assets/");
    socket.onopen = () => {
      if (stocks.length > 0) {
        const watchlistSymbols = stocks.map((stock) =>
          stock.asset.smart_api_token || stock.asset.symbol
        );
        socket.send(JSON.stringify({ watchlist_symbols: watchlistSymbols }));
      }
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStockPrice((prev) => ({ ...prev, [data.symbol]: data.price }));
    };
    socket.onerror = (error) => console.error("WebSocket Error:", error);
    return () => socket.close();
  }, [stocks]);

  const handleAssetClick = (asset, label, stockId) => {
    if (label === "Buy" || label === "Sell") {
      dispatch(updateIsOrder(asset));
    } else if (label === "Chart") {
      dispatch(setSelectedAsset(asset));
      dispatch(setWatchlistData(stocks));
    } else if (label === "Info") {
      dispatch(setSelectedAsset(asset));
    }
    setActiveTooltip(null);
  };

  const handleDelete = async (assetId, stockId) => {
    try {
      await api.delete(`/user/account/watchlists/list/${watchlistId}/${assetId}/`, {
        headers: { Authorization: `Bearer ${isAuth.access}` },
      });
      setStocks(stocks.filter((stock) => stock.asset.id !== assetId));
      setActiveTooltip(null);
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  const getPriceColor = (value) => {
    if (!value) return darkMode ? "text-gray-300" : "text-gray-600";
    return parseFloat(value) >= 0 ? "text-green-500" : "text-red-500";
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    hover: { 
      scale: 1.02, 
      boxShadow: darkMode 
        ? "0 8px 16px rgba(255,255,255,0.1)" 
        : "0 8px 16px rgba(0,0,0,0.05)"
    },
    tap: { scale: 0.98 },
  };

  const tooltipVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className="w-full">
      
      <AnimatePresence>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Loading...
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center py-4 ${darkMode ? "text-red-400" : "text-red-600"}`}
          >
            {error}
          </motion.div>
        ) : stocks.length > 0 ? (
          stocks.map((stock, index) => (
            <motion.div
              key={stock.asset.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onMouseEnter={() => setActiveTooltip(stock.asset.id)}
              onMouseLeave={() => setActiveTooltip(null)}
              className={`relative p-3 sm:p-4 mb-2 rounded-xl shadow-md transition-all duration-300 ${
                darkMode 
                  ? "bg-gray-700 hover:bg-gray-600" 
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {/* Stock Data */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex items-center space-x-2">
                  <span className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {stock.asset.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stock.asset.asset_type}
                  </span>
                </div>
                <div className="mt-2 sm:mt-0 flex flex-col items-end">
                  <span
                    className={`text-lg sm:text-xl font-bold ${getPriceColor(stock.asset.net_change)}`}
                  >
                    ₹{stock.asset.smart_api_token ? stockPrice[stock.asset.smart_api_token] : stockPrice[stock.asset.symbol] || "N/A"}
                  </span>
                  <div className="flex text-xs sm:text-sm space-x-2">
                    <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      {stock.asset.net_change}
                    </span>
                    <span className={getPriceColor(stock.asset.percent_change)}>
                      ({stock.asset.percent_change}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Tooltip-like Action Buttons */}
              <AnimatePresence>
                {activeTooltip === stock.asset.id && (
                  <motion.div
                    variants={tooltipVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.2 }}
                    className={`absolute bottom-2 right-2 flex space-x-2 z-10 p-2 rounded-lg shadow-lg ${
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    {["Buy", "Sell", "Chart", "Info"].map((label) => (
                      <motion.button
                        key={label}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAssetClick(stock.asset, label, stock.asset.id)}
                        className={`p-2 rounded-md text-sm font-semibold flex items-center justify-center shadow-sm ${
                          label === "Buy"
                            ? darkMode
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                            : label === "Sell"
                            ? darkMode
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
                            : darkMode
                            ? "bg-gray-600 hover:bg-gray-500 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                        title={label}
                      >
                        <i
                          className={`fas ${
                            label === "Buy"
                              ? "fa-plus" // Changed to plus for buying (adding to portfolio)
                              : label === "Sell"
                              ? "fa-minus" // Changed to minus for selling (removing from portfolio)
                              : label === "Chart"
                              ? "fa-chart-line"
                              : "fa-info-circle"
                          }`}
                        />
                      </motion.button>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(stock.asset.id, stock.asset.id)}
                      className={`p-2 rounded-md text-sm font-semibold flex items-center justify-center shadow-sm ${
                        darkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            No stocks available for this watchlist.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WatchlistItems;