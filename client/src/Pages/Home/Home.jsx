import React, { useEffect } from 'react';
import Watchlist from '../../Components/Watchlist/Watchlist';
import Header from '../../Components/Header/Header';
import UserStock from './UserStock';
import { useSelector } from 'react-redux';

function Home() {
  const { selectedAsset } = useSelector((state) => state.homeData);

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
      height: "520",
      symbol: selectedAsset.tradingview_symbol,
      showIntervalTabs: true,
      displayMode: "multiple",
      locale: "en",
      colorTheme: "dark",
    });
    document.getElementById('tradingview-analysis-widget').appendChild(analysisScript);

    // Load the Symbol Info widget
    const symbolInfoScript = document.createElement('script');
    symbolInfoScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
    symbolInfoScript.async = true;
    symbolInfoScript.innerHTML = JSON.stringify({
      symbol: selectedAsset.tradingview_symbol,
      width: "550",
      locale: "en",
      colorTheme: "dark",
      isTransparent: false
    });
    document.getElementById('tradingview-symbol-info-widget').appendChild(symbolInfoScript);

    // Load the Mini Symbol Overview widget
    const miniSymbolScript = document.createElement('script');
    miniSymbolScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    miniSymbolScript.async = true;
    miniSymbolScript.innerHTML = JSON.stringify({
      symbol: selectedAsset.tradingview_symbol,
      width: 380,
      height: 420,
      locale: "en",
      dateRange: "12M",
      colorTheme: "dark",
      isTransparent: false,
      autosize: false,
      largeChartUrl: ""
    });
    document.getElementById('tradingview-mini-symbol-widget').appendChild(miniSymbolScript);
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
      <div className='flex flex-row gap-x-4 p-2 items-start'>
        <div id="tradingview-analysis-widget">
          <div className="tradingview-widget-container__widget"></div>
        </div>
        <div id="tradingview-symbol-info-widget">
          <div className="tradingview-widget-container__widget"></div>
        </div>
        <div id="tradingview-mini-symbol-widget">
          <div className="tradingview-widget-container__widget"></div>
          <div className="tradingview-widget-copyright">
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

