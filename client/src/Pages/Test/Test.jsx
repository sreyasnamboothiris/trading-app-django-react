import React, { useEffect, useState } from 'react';

function Test() {
  const [priceData, setPriceData] = useState(null);

  useEffect(() => {
    // Connect to your Django WebSocket server
    const socket = new WebSocket('ws://localhost:8000/ws/assets/'); // Match your Django websocket path

    // Handle incoming messages
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Market Data:', data);
      setPriceData(data); // Update the state with real-time data
    };

    // Handle WebSocket connection errors
    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    // Cleanup when the component is unmounted
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
