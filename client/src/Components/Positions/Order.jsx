import React, { useState } from 'react';

function Order() {
  const [activeTab, setActiveTab] = useState('openOrders');
  const [searchTerm, setSearchTerm] = useState('');
  
  const ordersList = [
    { id: 1, stock: "AAPL", executedQty: 10, ltp: 145.32, orderType: "Market", orderPrice: 144.50 },
    { id: 2, stock: "GOOGL", executedQty: 5, ltp: 2800.75, orderType: "Limit", orderPrice: 2795.00 },
    { id: 3, stock: "TSLA", executedQty: 2, ltp: 700.45, orderType: "Stop Loss", orderPrice: 695.00 },
  ];

  const filteredOrders = ordersList.filter(order =>
    order.stock.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-1">
      {/* Header Tabs */}
      <div className="flex gap-1 mb-2 bg-[#002F42] p-2 rounded-lg">
        {["openOrders", "positions", "orderHistory"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-bold text-lg relative transition-all ${
              activeTab === tab ? 'text-[#68A875] font-bold text-xl' : 'text-white'
            }`}
          >
            {tab === "openOrders" ? "Open Orders" : tab === "positions" ? "Positions" : "Order History"}
            {activeTab === tab && (
              <div className="absolute bottom-1 left-0 right-0 h-[.5px] bg-[#68A875] rounded"></div>
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search stock..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded-lg bg-[#002F42] text-white border border-gray-600 focus:outline-none focus:border-[#68A875]"
        />
      </div>

      {/* Orders Table */}
      <div className="mt-1">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#002F42] text-white rounded-[18px] overflow-hidden">
            {/* Table Head */}
            <thead className="bg-[#002F42]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Stock Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Executed Qty</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">LTP</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Order Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Order Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="bg-black hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-4 text-sm">{order.stock}</td>
                    <td className="px-4 py-4 text-sm">{order.executedQty}</td>
                    <td className="px-4 py-4 text-sm">${order.ltp.toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm">{order.orderType}</td>
                    <td className="px-4 py-4 text-sm">${order.orderPrice.toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm">
                      <button className="text-blue-400 hover:text-blue-600">Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-sm font-medium">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Order;
