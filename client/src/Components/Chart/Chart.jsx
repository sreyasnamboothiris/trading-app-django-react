import React, { useEffect, useRef, memo } from 'react';
import { useSelector } from 'react-redux';

function TradingViewWidget() {
  const container = useRef();
  const { selectedAsset } = useSelector((state) => state.homeData);

  useEffect(() => {
    // Clean up existing widget if any
    if (container.current) {
      container.current.innerHTML = '';
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      { 
        "height": 700,
        "autosize": true,
        "symbol": "${selectedAsset.tradingview_symbol}",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "withdateranges": true,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }`;
    container.current.appendChild(script);

    // Cleanup function
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [selectedAsset]); // Add selectedAsset to dependency array

  return (
    <div className="tradingview-widget-container h-[550px]" ref={container}>
      {/* Only one chart should appear now */}
    </div>
  );
}

export default memo(TradingViewWidget);
