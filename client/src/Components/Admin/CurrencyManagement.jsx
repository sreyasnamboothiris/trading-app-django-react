import React, { useState, useEffect } from "react";
import { FiSearch, FiFilter } from "react-icons/fi";
import api from "../../interceptors"; // Adjust the path to your API file
import { useSelector } from "react-redux";

function CurrencyManagement() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAuth = useSelector((state) => state.auth.isAuth);

  // Fetch currencies from the backend
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await api.get("/mp-admin/currencies/", {
          headers: {
            Authorization: `Bearer ${isAuth.access}`,
          },
        });
        setCurrencies(response.data);
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, [isAuth]);

  return (
    <div className="p-4 bg-[#DED7F8] min-h-screen">
      {/* Search and Filter Section */}
      <div className="flex justify-between items-center mb-6">
        {/* Search Bar - Disabled functionality for now */}
        <div className="flex items-center bg-white rounded-md shadow-md w-full max-w-lg">
          <FiSearch className="text-gray-500 mx-3" size={20} />
          <input
            type="text"
            placeholder="Search currencies..."
            disabled
            className="flex-1 px-2 py-2 border-none focus:outline-none text-gray-700"
          />
        </div>

        {/* Sort and Filter Icon */}
        <div className="ml-4">
          <button className="bg-white p-2 rounded-md shadow-md hover:bg-gray-200">
            <FiFilter className="text-gray-600" size={24} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-700 font-medium">Loading...</p>
        ) : (
          <table className="min-w-full bg-[#002F42] text-white rounded-[18px] overflow-hidden">
            {/* Table Head */}
            <thead className="bg-[#002F42]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Symbol
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {currencies.length > 0 ? (
                currencies.map((currency) => (
                  <tr
                    key={currency.id}
                    className="bg-black hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm font-medium">
                      {currency.name}
                    </td>
                    <td className="px-4 py-4 text-sm">{currency.code}</td>
                    <td className="px-4 py-4 text-sm">{currency.symbol}</td>
                    <td className="px-4 py-4 text-sm">
                      {currency.is_active ? "Active" : "Inactive"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-4 text-center text-sm font-medium"
                  >
                    No currencies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CurrencyManagement;
