import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../interceptors";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

function AddAccountButton() {
  const [showModal, setShowModal] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [currency, setCurrency] = useState("");
  const [funds, setFunds] = useState("");
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [darkMode] = useState(() =>
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  useEffect(() => {
    api
      .get("user/currency/list/", {
        headers: { Authorization: `Bearer ${isAuth.access}` },
      })
      .then((response) => {
        setCurrencies(response.data);
      })
      .catch(() => {
        toast.error("Failed to fetch currencies");
      });
  }, [isAuth.access]);

  const handleAddAccount = () => {
    if (!accountName || !currency || funds === "" || Number(funds) < 0) {
      toast.error("Please fill in all fields with valid data");
      return;
    }

    setLoading(true);

    api
      .post(
        "user/account/create/",
        {
          name: accountName,
          currency,
          funds: Number(funds),
        },
        {
          headers: { Authorization: `Bearer ${isAuth.access}` },
        }
      )
      .then(() => {
        toast.success("Account created successfully");
        setShowModal(false);
        setAccountName("");
        setCurrency("");
        setFunds("");
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message?.[0] || "Error creating account";
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
        className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold shadow-md ${
          darkMode
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-[#2D5F8B] hover:bg-[#3A7CA8] text-white"
        }`}
      >
        Add Account
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
                Add New Account
              </h2>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Account Name
                  </label>
                  <motion.input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    whileFocus={{ scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" }}
                    className={`mt-1 w-full p-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-700 text-white border-gray-600 focus:ring-gray-500 placeholder-gray-400"
                        : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-blue-500 placeholder-gray-500"
                    }`}
                    placeholder="Enter account name"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Currency
                  </label>
                  <motion.select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    whileFocus={{ scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" }}
                    className={`mt-1 w-full p-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-700 text-white border-gray-600 focus:ring-gray-500 placeholder-gray-400"
                        : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-blue-500 placeholder-gray-500"
                    }`}
                  >
                    <option value="">Select currency</option>
                    {currencies.map((cur) => (
                      <option key={cur.id} value={cur.id}>
                        {cur.name} ({cur.code})
                      </option>
                    ))}
                  </motion.select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Funds
                  </label>
                  <motion.input
                    type="number"
                    value={funds}
                    onChange={(e) => setFunds(e.target.value)}
                    whileFocus={{ scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" }}
                    className={`mt-1 w-full p-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-700 text-white border-gray-600 focus:ring-gray-500 placeholder-gray-400"
                        : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-blue-500 placeholder-gray-500"
                    }`}
                    placeholder="Enter funds amount"
                    min="0"
                  />
                </div>
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
                  onClick={handleAddAccount}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-[#2D5F8B] hover:bg-[#3A7CA8] text-white"
                  } ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Creating..." : "Add Account"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AddAccountButton;