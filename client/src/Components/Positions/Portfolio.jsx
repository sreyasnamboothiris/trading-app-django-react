import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../interceptors";

const Portfolio = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState({});
  const user = useSelector((state) => state.auth.isAuth);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const response = await api.get("user/account/portfolio/", {
          headers: { Authorization: `Bearer ${user.access}` },
        });
        setAssets(response.data.items);
        setPortfolio(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const [darkMode] = useState(() =>
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  const totalInvestment = assets.reduce((sum, asset) => sum + parseFloat(asset.total_investment), 0).toFixed(2);
  const currentValue = assets.reduce((sum, asset) => sum + parseFloat(asset.current_value), 0).toFixed(2);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const summaryVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    hover: { scale: 1.03, boxShadow: "0 8px 16px rgba(0,0,0,0.2)" },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`w-full max-w-5xl p-4 sm:p-6 rounded-xl ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <motion.div
        variants={summaryVariants}
        className={`w-full p-4 sm:p-6 rounded-xl shadow-lg mb-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Portfolio Summary</h2>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center">
            <span className="block text-sm sm:text-base font-medium">Total Investment</span>
            <span className={`${darkMode ? "text-gray-300" : "text-gray-700"} text-lg sm:text-xl`}>
              ${totalInvestment}
            </span>
          </div>
          <div className="text-center">
            <span className="block text-sm sm:text-base font-medium">Current Value</span>
            <span
              className={`text-lg sm:text-xl ${
                currentValue >= totalInvestment
                  ? darkMode
                    ? "text-green-400"
                    : "text-green-500"
                  : darkMode
                  ? "text-red-400"
                  : "text-red-500"
              }`}
            >
              ${currentValue}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <AnimatePresence>
          {assets.map((asset) => (
            <motion.div
              key={asset.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className={`p-4 rounded-xl shadow-md ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3 className="text-lg font-semibold mb-3">{asset.asset_name}</h3>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 text-sm">
                <div className="flex-1">Qty: {asset.quantity}</div>
                <div className="flex-1">Avg Buy: ${parseFloat(asset.average_price).toFixed(2)}</div>
                <div className="flex-1">Total Inv.: ${parseFloat(asset.total_investment).toFixed(2)}</div>
                <div className="flex-1 text-green-500">Current Val.: ${parseFloat(asset.current_value).toFixed(2)}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Portfolio;