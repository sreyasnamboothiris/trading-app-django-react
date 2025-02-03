import React, { useEffect, useState } from 'react';
import SymbolSearchWidget from './SymbolSearchWidget';
import AddWatchlistModal from './AddWatchlistModal';
import WatchlistItems from './WatchlistItems';
import './watchlist.css';
import { useSelector } from 'react-redux';
import api from '../../interceptors';

function Watchlist() {
  const [activeWatchlist, setActiveWatchlist] = useState(null); // Keeps track of the active watchlist
  const [activeWatchlistId, setActiveWatchlistId] = useState(null);
  const [watchlists, setWatchlists] = useState({}); // State to store fetched watchlists
  const isAuth = useSelector((state) => state.auth.isAuth); // Access Redux state
  const handleWatchlistChange = (index, id) => {
    setActiveWatchlist(index);  // Set the index
    setActiveWatchlistId(id);        // Set the real ID
  };

  // Add this new function to fetch watchlists
  const fetchWatchlists = async () => {
    try {
      const response = await api.get('/user/account/watchlists/', {
        headers: {
          Authorization: `Bearer ${isAuth.access}`,
        },
      });
      setWatchlists(response.data);
      if (response.data && !activeWatchlist && Object.keys(response.data).length > 0) {
        const firstWatchlistId = response.data[Object.keys(response.data)[0]].id;
        setActiveWatchlist(0);
        setActiveWatchlistId(firstWatchlistId);
      }
    } catch (error) {
      console.error('Error fetching watchlists:', error);
    }
  };

  useEffect(() => {
    if (isAuth) {
      fetchWatchlists();
    }
  }, [isAuth]);

  return (
    <div className="md:w-40 lg:w-60 xl:w-80 bg-[#2D5F8B] p-2 flex flex-col">
      {/* Top Navigation */}
      <div className="flex flex-row">
        {Object.keys(watchlists).map((watchlistId, index) => (
          <div
            key={watchlistId}
            onClick={() => handleWatchlistChange(index, watchlists[watchlistId]?.id)}
            className={`relative cursor-pointer px-2 flex flex-col items-center justify-center transition-colors duration-700 ease-in-out ${activeWatchlist === Number(watchlistId) ? '' : 'opacity-70'
              } group`} // Add "group" class for hover functionality
          >
            {/* Tooltip showing the watchlist name and its number */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#002F42] text-white text-xs px-2 py-1 rounded">
              {`${watchlists[watchlistId]?.name}`}
            </div>

            {/* Render the index */}
            <div className="text-4xl font-bold">{index + 1}</div>

            {/* Active watchlist indicator */}
            {activeWatchlist === Number(watchlistId) && (
              <div className="w-full h-1 bg-black"></div>
            )}
          </div>
        ))}

        <div
          className={`relative cursor-pointer w-8 h-8 flex items-center justify-center transition-colors duration-700 ease-in-out`}
        >
          <AddWatchlistModal />
        </div>
      </div>

      {/* Symbol Search */}
      <div className="w-full mt-4">
        <SymbolSearchWidget activeWatchlist={activeWatchlistId} onAssetAdded={fetchWatchlists} />
      </div>

      {/* Watchlist Items */}
      <div className="w-full mt-4">
        {activeWatchlistId && (
          <WatchlistItems watchlistId={activeWatchlistId} />
        )}
      </div>
    </div>
  );
}

export default Watchlist;
