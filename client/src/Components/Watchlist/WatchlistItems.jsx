import React, { useEffect, useState } from 'react';
import api from '../../interceptors'; // Assuming this is your axios instance
import { useSelector } from 'react-redux';

function WatchlistItems({ watchlistId }) {
  const [stocks, setStocks] = useState([]); // Store stocks
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const isAuth = useSelector((state) => state.auth.isAuth);

  useEffect(() => {
    // Check if watchlistId is available
    if (watchlistId) {
      const fetchWatchlistItems = async () => {
        try {
          setLoading(true); // Start loading
          const response = await api.get(`/user/account/watchlists/list/${watchlistId}/`, {
            headers: {
              Authorization: `Bearer ${isAuth.access}`,
            },
          });

          setStocks(response.data); // Assuming response contains the stock data
        } catch (error) {
          console.log(error, 'Error fetching stock data');
          setError('Error fetching stock data'); // Handle error
        } finally {
          setLoading(false); // End loading
        }
      };

      fetchWatchlistItems();
    }
  }, [watchlistId]); // Trigger effect when watchlistId changes

  return (
    <div className="w-full">
      {/* Loading state */}
      {loading && <div>Loading...</div>}

      {/* Error state */}
      {error && <div>{error}</div>}

      {/* Display stocks */}
      {!loading && !error && stocks.length > 0 ? (
        stocks.map((stock, index) => (
          <div key={index} className="relative bg-[#DED7F8] p-2 mb-1 rounded-md shadow-md group">
            {/* Stock Data */}
            <div className="flex justify-between items-center">
              <div className="flex">
                <div className="text-xl font-bold">{stock.asset.asset_name}</div>
                <div className="p-1 text-xs bg-gray-300 inline-block m-1">
                  {stock.asset.asset_type} {/* This is the type of asset */}
                </div>
              </div>
              {/* <div className="text-right">
                <div
                  className={`text-xl font-bold ${
                    stock.asset.last_traded_price >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stock.asset.last_traded_price?.toFixed(2)}
                </div>
                <div className="text-sm text-black">
                  {stock.change >= 0 ? '+' : ''}
                  {stock.change?.toFixed(2)} (
                  {stock.percentage >= 0 ? '+' : ''}
                  {stock.percentage?.toFixed(2)}%)
                </div>
              </div> */}
            </div>

            {/* Hover Box (Show only when hovering over the symbol) */}
            <div className="absolute bottom-2 right-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-in-out bg-gray-500 shadow-md px-2 py-1 rounded-md border">
              <div className="flex space-x-2">
                {['Buy', 'Sell', 'Info', 'Chart'].map((label, idx) => (
                  <div key={idx} className="has-tooltip">
                    <span className="tooltip shadow-lg p-1 text-black -mt-8 bg-black text-white rounded-md px-4">
                      {label}
                    </span>
                    <button
                      className={`bg-gray-100 text-sm font-bold py-1 rounded-md w-8 ${label === 'Buy'
                        ? 'bg-white hover:bg-green-700 text-green-500 hover:text-white'
                        : label === 'Sell'
                          ? 'bg-white hover:bg-red-700 text-red-500 hover:text-white'
                          : 'bg-white hover:bg-blue-700 text-blue-500 hover:text-white'
                        } hover:opacity-80`}
                    >
                      {label.charAt(0)}
                    </button>
                  </div>
                ))}
                {/* Delete Button */}
                <div className="has-tooltip">
                  <span className="tooltip rounded shadow-lg p-1 bg-gray-100 text-black -mt-8">
                    Delete
                  </span>
                  <button className="bg-red-600 text-white text-xs px-2 py-1 rounded-md hover:opacity-80">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div>No stocks available for this watchlist.</div>
      )}
    </div>
  );
}

export default WatchlistItems;
