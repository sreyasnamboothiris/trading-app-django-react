import React, { useState, useEffect } from "react";
import api from "../../interceptors";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

function Order() {
  const [activeTab, setActiveTab] = useState("openOrders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [selectedOrder, setSelectedOrder] = useState(null); // Track the selected order for modal
  const [editForm, setEditForm] = useState({ quantity: "", price: "" }); // Form state for editing
  const user = useSelector((state) => state.auth.isAuth);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get("trade/order/", {
          headers: { Authorization: `Bearer ${user.access}` },
        });
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Theme listener
  useEffect(() => {
    const handleThemeChange = () => {
      setDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleThemeChange);
    return () => window.removeEventListener("storage", handleThemeChange);
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "openOrders") return order.status.toLowerCase() === "pending";
    if (activeTab === "orderHistory")
      return ["executed", "cancelled", "rejected"].includes(order.status.toLowerCase());
    return false;
  });

  // Animation variants
  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    selected: { backgroundColor: darkMode ? "#4B5EAA" : "#E6F0FF" },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // Handle clicking a row to open modal
  const handleRowClick = (order) => {
    if (order.status.toLowerCase() !== "pending") return; // Only pending orders can be edited
    setSelectedOrder(order);
    setEditForm({
      quantity: order.quantity,
      price: order.price || order.limit_price || "",
    });
  };

  // Handle input changes in the edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle saving the edited order
  const handleSave = async () => {
    try {
      const updatedOrder = {
        quantity: parseFloat(editForm.quantity),
        limit_price: parseFloat(editForm.price),
      };
      const response = await api.patch(`trade/order/${selectedOrder.id}/`, updatedOrder, {
        headers: { Authorization: `Bearer ${user.access}` },
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id ? { ...order, ...response.data } : order
        )
      );
      setSelectedOrder(null); // Close modal
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // Handle deleting the order
  const handleDelete = async () => {
    try {
      await api.delete(`trade/order/${selectedOrder.id}/`, {
        headers: { Authorization: `Bearer ${user.access}` },
      });
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== selectedOrder.id));
      setSelectedOrder(null); // Close modal
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  // Handle closing the modal
  const handleClose = () => {
    setSelectedOrder(null);
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Tab Navigation */}
      <motion.div
        className="flex flex-wrap gap-2 sm:gap-4 mb-6 justify-center sm:justify-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {["openOrders", "positions", "orderHistory"].map((tab) => (
          <motion.button
            key={tab}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-2 sm:px-5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 shadow-md ${
              activeTab === tab
                ? "bg-gradient-to-r from-[#68A875] to-[#559366] text-white"
                : darkMode
                ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
            }`}
          >
            {tab === "openOrders" ? "Open Orders" : tab === "positions" ? "Positions" : "Order History"}
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="overflow-hidden rounded-xl shadow-lg bg-opacity-80 backdrop-blur-sm"
        >
          <table
            className={`w-full text-sm sm:text-base ${darkMode ? "bg-gray-800/95" : "bg-white/95"}`}
          >
            <thead>
              <tr className={`text-left ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                {["Asset", "Order", "Qty", "Placed", "Exec.", "Last", "Status"].map((header) => (
                  <th key={header} className="p-3 sm:p-4 font-semibold">
                    <span className="hidden sm:inline">{header}</span>
                    <span className="sm:hidden">{header.slice(0, 3)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-6 h-6 border-2 border-t-transparent border-[#68A875] rounded-full"
                    />
                    <span className="ml-2">Loading...</span>
                  </td>
                </tr>
              ) : activeTab === "positions" ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500 dark:text-gray-400">
                    Positions coming soon...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    variants={rowVariants}
                    initial="hidden"
                    animate={selectedOrder?.id === order.id ? "selected" : "visible"}
                    whileHover="hover"
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => handleRowClick(order)}
                    className={`cursor-pointer ${darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}`}
                  >
                    <td className="p-3 sm:p-4">
                      <div className="font-medium">{order.asset.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.asset.asset_type}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">{order.order_type} - {order.trade_type}</td>
                    <td className="p-3 sm:p-4">{order.quantity}</td>
                    <td className="p-3 sm:p-4">{order.price || order.limit_price}</td>
                    <td className="p-3 sm:p-4">{order.executed_price || "-"}</td>
                    <td className="p-3 sm:p-4">{order.asset.last_traded_price}</td>
                    <td className="p-3 sm:p-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          order.status.toLowerCase() === "executed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {order.status}
                      </span>
                      <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500 dark:text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`p-6 rounded-xl shadow-2xl w-full max-w-md ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
            >
              <h2 className="text-xl font-semibold mb-4">
                Edit Order: {selectedOrder.asset.name}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={editForm.quantity}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-gray-100 border-gray-300 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-[#68A875]`}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-gray-100 border-gray-300 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-[#68A875]`}
                    step="0.01"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="px-4 py-2 bg-gradient-to-r from-[#68A875] to-[#559366] text-white rounded-lg shadow-md hover:from-[#559366] hover:to-[#487A57]"
                >
                  Save
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
                >
                  Delete
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className={`px-4 py-2 rounded-lg shadow-md ${
                    darkMode
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Order;