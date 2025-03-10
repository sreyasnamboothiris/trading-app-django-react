import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Portfolio = () => {
  // Demo assets data
  const demoAssets = [
    {
      id: 1,
      name: "Stock A",
      ltp: 150.25,
      avgBuy: 145.00,
      quantity: 10,
      totalInvestment: 1450.00,
      currentValue: 1502.50,
      todayValue: 12.50,
    },
    {
      id: 2,
      name: "Stock B",
      ltp: 275.80,
      avgBuy: 280.00,
      quantity: 5,
      totalInvestment: 1400.00,
      currentValue: 1379.00,
      todayValue: -21.00,
    },
    {
      id: 3,
      name: "Stock C",
      ltp: 95.60,
      avgBuy: 90.00,
      quantity: 20,
      totalInvestment: 1800.00,
      currentValue: 1912.00,
      todayValue: 112.00,
    },
  ];

  const [darkMode] = useState(() =>
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  // Calculate totals
  const totalInvestment = demoAssets.reduce((sum, asset) => sum + asset.totalInvestment, 0).toFixed(2);
  const currentValue = demoAssets.reduce((sum, asset) => sum + asset.currentValue, 0).toFixed(2);
  const totalTodayValue = demoAssets.reduce((sum, asset) => sum + asset.todayValue, 0).toFixed(2);

  // Animation Variants
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
      {/* Summary Box */}
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
          <div className="text-center">
            <span className="block text-sm sm:text-base font-medium">Today's Gain/Loss</span>
            <span
              className={`text-lg sm:text-xl ${
                totalTodayValue >= 0
                  ? darkMode
                    ? "text-green-400"
                    : "text-green-500"
                  : darkMode
                  ? "text-red-400"
                  : "text-red-500"
              }`}
            >
              {totalTodayValue >= 0 ? "+" : ""}${totalTodayValue}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Individual Assets */}
      <div className="space-y-4">
        <AnimatePresence>
          {demoAssets.map((asset) => (
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
              <h3 className="text-lg font-semibold mb-3">{asset.name}</h3>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 text-sm">
                <div className="flex-1">
                  <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>LTP: </span>
                  <span>${asset.ltp.toFixed(2)}</span>
                </div>
                <div className="flex-1">
                  <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Avg Buy: </span>
                  <span>${asset.avgBuy.toFixed(2)}</span>
                </div>
                <div className="flex-1">
                  <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Qty: </span>
                  <span>{asset.quantity}</span>
                </div>
                <div className="flex-1">
                  <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Inv.: </span>
                  <span>${asset.totalInvestment.toFixed(2)}</span>
                </div>
                <div className="flex-1">
                  <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Current Val.: </span>
                  <span
                    className={`${
                      asset.currentValue >= asset.totalInvestment
                        ? darkMode
                          ? "text-green-400"
                          : "text-green-500"
                        : darkMode
                        ? "text-red-400"
                        : "text-red-500"
                    }`}
                  >
                    ${asset.currentValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex-1">
                  <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Today’s Val.: </span>
                  <span
                    className={`${
                      asset.todayValue >= 0
                        ? darkMode
                          ? "text-green-400"
                          : "text-green-500"
                        : darkMode
                        ? "text-red-400"
                        : "text-red-500"
                    }`}
                  >
                    {asset.todayValue >= 0 ? "+" : ""}${asset.todayValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Portfolio;