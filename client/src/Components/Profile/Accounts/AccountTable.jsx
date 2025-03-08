import React, { useEffect, useState } from "react";
import api from "../../../interceptors";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import EditAccountModal from "./EditAccountModal";
import DeleteAccountModal from "./DeleteAccountModal";

function AccountTable() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [darkMode] = useState(() =>
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  const fetchAccounts = () => {
    setLoading(true);
    api
      .get("user/account/list/", {
        headers: { Authorization: `Bearer ${isAuth.access}` },
      })
      .then((response) => {
        const sortedAccounts = response.data.sort((a, b) => a.name.localeCompare(b.name));
        setAccounts(sortedAccounts);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSwitchAccount = (accountId) => {
    api
      .patch(
        "user/account/update/",
        { account_id: accountId, is_active: true },
        { headers: { Authorization: `Bearer ${isAuth.access}` } }
      )
      .then(() => {
        fetchAccounts();
        setShowModal(false);
        toast.success("Account switched successfully!");
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message);
        toast.error("Failed to switch account. Please try again.");
      });
  };

  // Animation variants
  const tableVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    hover: { backgroundColor: darkMode ? "#374151" : "#E5E7EB", transition: { duration: 0.2 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    tap: { scale: 0.95 },
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex justify-center items-center py-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        <i className="fas fa-spinner fa-spin text-3xl mr-3" />
        <span className="text-lg font-semibold">Loading Accounts...</span>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-red-500 py-8"
      >
        {error}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={tableVariants}
      initial="hidden"
      animate="visible"
      className={`p-6 rounded-2xl shadow-xl ${darkMode ? "bg-gray-800" : "bg-white"}`}
    >
      <h2 className={`text-xl sm:text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
        Your Accounts
      </h2>
      <div className="w-full space-y-4">
        {/* Table Headers */}
        <div
          className={`grid grid-cols-6 gap-4 p-4 rounded-lg font-semibold text-sm sm:text-base ${
            darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700"
          }`}
        >
          <div className="text-center">Status</div>
          <div className="text-center">Name</div>
          <div className="text-center">Total Fund</div>
          <div className="text-center">Currency</div>
          <div className="text-center">Actions</div>
          <div className="text-center">Switch</div>
        </div>

        {/* Account Rows */}
        <AnimatePresence>
          {accounts.map((account) => (
            <motion.div
              key={account.id}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              exit={{ opacity: 0, x: 20 }}
              className={`grid grid-cols-6 gap-4 p-4 rounded-lg shadow-md border ${
                darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <div className="text-center">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    account.is_active
                      ? "bg-green-500 text-white"
                      : "bg-gray-500 text-gray-200"
                  }`}
                >
                  {account.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="text-center font-medium">{account.name}</div>
              <div className="text-center">
                {account.funds.toLocaleString()} {account.currency.symbol}
              </div>
              <div className="text-center">{account.currency}</div>
              <div className="text-center flex justify-center gap-2">
                <EditAccountModal account={account} onUpdate={fetchAccounts} />
                <DeleteAccountModal account={account} onDelete={fetchAccounts} />
              </div>
              <div className="text-center">
                {!account.is_active && (
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => {
                      setSelectedAccount(account.id);
                      setShowModal(true);
                    }}
                    className="text-green-500 hover:text-green-600 font-semibold text-sm"
                  >
                    Switch
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Switch Account Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className={`p-6 rounded-xl shadow-2xl ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
            >
              <h2 className="text-xl font-bold mb-4">Switch Account</h2>
              <p className="mb-6">Are you sure you want to switch to this account?</p>
              <div className="flex justify-end gap-4">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    darkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleSwitchAccount(selectedAccount)}
                  className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold"
                >
                  Switch
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
}

export default AccountTable;