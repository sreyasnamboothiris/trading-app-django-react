import React, { useState, useEffect } from "react";
import api from "../../interceptors";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

function Order() {
  const [activeTab, setActiveTab] = useState("openOrders");
  const [orders, setOrders] = useState([]);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const user = useSelector((state) => state.auth.isAuth);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("trade/order/", {
          headers: {
            Authorization: `Bearer ${user.access}`,
          },
        });
        setOrders(response.data.orders);
        console.log("Orders:", response.data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders based on the active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "openOrders") {
      return order.status.toLowerCase() === "pending";
    } else if (activeTab === "orderHistory") {
      return order.status.toLowerCase() === "executed" || order.status.toLowerCase() === "cancelled";
    }
    return false;
  });

  return (
    <div className={`p-4 min-h-screen transition-all ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {["openOrders", "positions", "orderHistory"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? "bg-[#68A875] text-white" : "bg-gray-300 text-black"
              }`}
            >
              {tab === "openOrders" ? "Open Orders" : tab === "positions" ? "Positions" : "Order History"}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {activeTab === "positions" ? (
          <div className="text-center text-gray-400 text-sm">Positions will be displayed here.</div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-3 rounded-lg shadow-md transition-all ${darkMode ? "bg-[#1E1E1E]" : "bg-[#F8F8F8] text-black"}`}
            >
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">
                  {order.asset.name} ({order.asset.asset_type})
                </span>
                <span className="text-gray-400">{order.asset.tradingview_symbol}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold mt-1">
                <span>Qty: {order.quantity}</span>
                <span>${order.asset.last_traded_price}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>
                  {order.order_type} - {order.trade_type}
                </span>
                <span>Status: {order.status}</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-gray-400 text-sm">No orders found</div>
        )}
      </div>
    </div>
  );
}

export default Order;
