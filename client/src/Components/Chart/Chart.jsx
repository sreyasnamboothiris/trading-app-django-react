import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef();

  useEffect(() => {
    // Check if the widget is already embedded in the container
    if (container.current && container.current.children.length === 0) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "width": "1200", 
          "height": "800",  
          "symbol": "NASDAQ:AAPL",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "withdateranges": true,
          "range": "YTD",
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "calendar": false,
          "show_popup_button": true,
          "popup_width": "1000",
          "popup_height": "650",
          "hide_volume": true,
          "support_host": "https://www.tradingview.com",
          "show_logo": false  // Hide watermark for paid users
        }`;

      container.current.appendChild(script); // Append script to container
    }
  }, []); // Empty dependency array ensures this runs only once when the component is mounted

  return (
    <div className="tradingview-widget-container h-[550px]" ref={container}>
      {/* Only one chart should appear now */}
    </div>
  );
}

export default memo(TradingViewWidget);
