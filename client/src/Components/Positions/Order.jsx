import React, { useState, useEffect } from 'react';
import api from '../../interceptors';
import { useSelector } from 'react-redux';

function Order() {
  const [activeTab, setActiveTab] = useState('openOrders');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const user = useSelector((state) => state.auth.isAuth)

  // Fetch orders when the component mounts.
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Adjust the endpoint as needed.
        const response = await api.get('trade/test/', {
          headers: {
            'Authorization': `Bearer ${user.access}`
          }
        });

        
        console.log(response.data, 'jhfsd')
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders by stock symbol (assuming the API returns an "asset" field).



  return (
    <div className="p-1">
      {/* Header Tabs */}
      <div className="flex gap-1 mb-2 bg-[#002F42] p-2 rounded-lg">
        {["openOrders", "positions", "orderHistory"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-bold text-lg relative transition-all ${activeTab === tab ? 'text-[#68A875] font-bold text-xl' : 'text-white'
              }`}
          >
            {tab === "openOrders"
              ? "Open Orders"
              : tab === "positions"
                ? "Positions"
                : "Order History"}
            {activeTab === tab && (
              <div className="absolute bottom-1 left-0 right-0 h-[.5px] bg-[#68A875] rounded"></div>
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}


      {/* List View */}
      <div className="mt-1">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="mb-4 p-4 bg-black rounded-lg text-white shadow-md"
            >
              <div><strong>Stock:</strong> {order.asset}</div>
              <div><strong>Quantity:</strong> {order.quantity}</div>
              <div>
                <strong>Price:</strong>{" "}
                {order.price ? `$${Number(order.price).toFixed(2)}` : 'Market Order'}
              </div>
              <div><strong>Order Type:</strong> {order.order_type}</div>
              <div><strong>Trade Type:</strong> {order.trade_type}</div>
              <div><strong>Status:</strong> {order.status}</div>
              <div>
                <strong>Created:</strong>{" "}
                {order.created_at}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-white">No orders found</div>
        )}
      </div>
    </div>
  );
}

export default Order;
