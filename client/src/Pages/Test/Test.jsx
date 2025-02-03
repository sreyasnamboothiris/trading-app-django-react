import React, { useEffect, useState } from "react";

function Test() {
  const [priceData, setPriceData] = useState(null);
  const watchlistId = 3; // Change this ID as needed

  useEffect(() => {
    // Connect to the WebSocket server
    const socket = new WebSocket("ws://localhost:8000/ws/assets/");

    // Send watchlist_id after connection opens
    socket.onopen = () => {
      socket.send(JSON.stringify({ watchlist_id: watchlistId }));
    };

    // Handle incoming messages
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Market Data:", data);

      // Update state with real-time data
      if (data.initial_prices) {
        setPriceData(data.initial_prices);
      } else if (data.updated_prices) {
        setPriceData(data.updated_prices);
      }
    };

    // Handle WebSocket connection errors
    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    // Cleanup when component unmounts
    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      <h1>Market Data Stream</h1>
      <h2>Real-Time Asset Prices:</h2>
      {priceData ? (
        <pre>{JSON.stringify(priceData, null, 2)}</pre>
      ) : (
        <p>Waiting for real-time data...</p>
      )}
    </div>
  );
}

export default Test;
