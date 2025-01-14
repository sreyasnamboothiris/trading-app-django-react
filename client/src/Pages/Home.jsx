import React, { useEffect } from 'react';
import Watchlist from '../Components/Watchlist/Watchlist';
import Header from '../Components/Header/Header';

function Home() {
  useEffect(() => {
    // Load the Ticker Tape widget
    const tickerScript = document.createElement('script');
    tickerScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    tickerScript.async = true;
    tickerScript.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500 Index" },
        { proName: "FOREXCOM:NSXUSD", title: "US 100 Cash CFD" },
        { proName: "FX_IDC:EURUSD", title: "EUR to USD" },
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
      ],
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "in",
    });
    document.getElementById('tradingview-widget-container').appendChild(tickerScript);

    // Load the Technical Analysis widget
    const analysisScript = document.createElement('script');
    analysisScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    analysisScript.async = true;
    analysisScript.innerHTML = JSON.stringify({
      interval: "1m",
      width: "425",
      isTransparent: false,
      height: "450",
      symbol: "NASDAQ:AAPL",
      showIntervalTabs: true,
      displayMode: "multiple",
      locale: "en",
      colorTheme: "dark",
    });
    document.getElementById('tradingview-analysis-widget').appendChild(analysisScript);
  }, []);

  return (
    <div className='dark:bg-gray-900 bg-[#D9D9D9] mt-1'>
      <Header />
      <div className='flex flex-row'>
        <div className='w-screen'>
          <div id="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
          </div>
        </div>
      </div>
      <div className='flex flex-colm gap-x-8 p-2'>
        <div id="tradingview-analysis-widget">
          <div className="tradingview-widget-container__widget"></div>
        </div>
        <div>
            My content
        </div>
      </div>
    </div>
  );
}

export default Home;

