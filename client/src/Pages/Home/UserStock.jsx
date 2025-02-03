import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const UserStock = () => {
  const { selectedAsset } = useSelector((state) => state.homeData);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "symbol": "NASDAQ:AAPL",
        "width": 550,
        "locale": "en",
        "colorTheme": "dark",
        "isTransparent": false
      }
    `;

    const widgetContainer = document.querySelector('.tradingview-widget-container__widget');
    if (widgetContainer) {
      widgetContainer.appendChild(script);
    }

    return () => {
      if (widgetContainer && script) {
        widgetContainer.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="border border-gray-300 rounded-lg p-4 max-w-4xl w-full h-48 mx-auto text-center text-white">
      <div className="tradingview-widget-container">
        <div className="tradingview-widget-container__widget"></div>
        <div className="tradingview-widget-copyright">
          <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
            <span className="blue-text">Track all markets on TradingView</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// Example data


export default UserStock;