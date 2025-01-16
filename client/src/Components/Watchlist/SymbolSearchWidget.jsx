import React, { useState, useEffect, useRef } from 'react';
import api from '../../interceptors';  // Import the custom API instance
import { useSelector } from 'react-redux';

function SymbolSearchWidget({ activeWatchlist }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState([]); // Store assets
  const [hasMore, setHasMore] = useState(true); // To track if there are more assets to load
  const [loading, setLoading] = useState(false); // To track loading state
  const isAuth = useSelector((state) => state.auth.isAuth);
  const listContainerRef = useRef(null);  // Reference to the list container
  const [loadedCount, setLoadedCount] = useState(0); // Keep track of how many assets are loaded
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setAssets([]);  // Clear current assets when search query changes
    setHasMore(true);  // Reset the "has more" flag when the query changes
    setLoadedCount(0); // Reset the loaded count when the query changes
  };

  const fetchAssets = async (query, offset = 0, limit = 3) => {
    if (loading) return; // Prevent multiple API calls at the same time
    setLoading(true);
    try {
      const response = await api.get(`market/assets/search/?query=${query}&offset=${offset}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${isAuth.access}`,
        },
      });

      // Append the new assets to the existing ones
      setAssets((prevAssets) => [...prevAssets, ...response.data]);

      // Update the loaded count
      setLoadedCount((prevCount) => prevCount + response.data.length);

      // If we receive no new assets, mark "hasMore" as false
      if (response.data.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      // Fetch initial 3 assets based on the search query
      fetchAssets(searchQuery, 0, 3);
    }
  }, [searchQuery]); // Trigger when searchQuery changes

  const handleAddAsset = (asset) => {
    
    api.post('user/account/watchlists/list/', {
      headers: {  // Corrected 'Headers' to 'headers'
        Authorization: `Bearer ${isAuth.access}`,  // Authorization header
      },
      data: {  // 'data' should be inside the body of the POST request
        watchlistId: activeWatchlist,  // Pass the current activeWatchlist ID
        asset: asset,  // Pass the asset data
      }
    })
    .then((response) => {
      console.log('Asset added successfully', response.data);
    })
    .catch((error) => {
      console.error('Error adding asset:', error);
    });

  };

  // Infinite scroll functionality
  const handleScroll = () => {
    const bottom =
      listContainerRef.current.scrollHeight ===
      listContainerRef.current.scrollTop + listContainerRef.current.clientHeight;

    // If the user reaches the bottom and there are more assets to load
    if (bottom && hasMore && !loading) {
      fetchAssets(searchQuery, loadedCount, 3);  // Fetch more assets
    }
  };

  useEffect(() => {
    const listContainer = listContainerRef.current;
    if (listContainer) {
      listContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (listContainer) {
        listContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMore, loading, loadedCount]);

  return (
    <div className="mt-4">
      <input
        type="text"
        placeholder="Search stocks & index"
        className="w-full p-2 bg-white border border-gray-300 rounded-2xl mt-1 md:mt-2 lg:mt-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={searchQuery}
        onChange={handleSearchChange}
      />

      {assets && assets.length > 0 && (
        <div
          ref={listContainerRef}
          className="mt-4 overflow-y-auto max-h-60 bg-gray-100 p-2 rounded-lg"
        >
          <ul>
            {assets.map((asset) => (
              <li key={asset.id} className="flex items-center justify-between py-2">
                <span>{asset.asset_name}</span>
                <button
                  className="ml-4 bg-blue-500 text-white rounded-md p-2"
                  onClick={() => handleAddAsset(asset)}
                >
                  <i className="fas fa-plus"></i> 
                </button>
              </li>
            ))}
          </ul>
          {loading && hasMore && (
            <div className="text-center py-2 text-sm text-gray-500">Loading more...</div>
          )}
          {!hasMore && (
            <div className="text-center py-2 text-sm text-gray-500">No more assets</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SymbolSearchWidget;
