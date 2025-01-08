import React, { useState } from 'react';
import SymbolSearchWidget from './SymbolSearchWidget';
import './watchlist.css';


function Watchlist() {
  const [isActive, setIsActive] = useState(true)
  const [isNonactive, setIsNonactive] = useState('')
  const stocks = [
    {
      name: 'Apple',
      exchange: 'NASDAQ',
      value: 145.23,
      change: 1.34,
      percentage: 0.93,
    },
    {
      name: 'Microsoft',
      exchange: 'NASDAQ',
      value: 299.15,
      change: -2.45,
      percentage: -0.81,
    }
  ];

  return (
    <div className="md:w-40 lg:w-60 xl:w-80 bg-[#2D5F8B] p-2 flex flex-col">
      <div className="flex flex-row">
        <div
          className={`relative group cursor-pointer rounded-md w-8 h-8 flex items-center justify-center transition-colors duration-700 ease-in-out`}>
          <div className='text-4xl font-bold'>1</div>
          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#002F42] text-white text-xs px-2 py-1 rounded">
            Name
          </div>
          <div className={`absolute inset-x-0 -bottom-4 h-[3px] ${isActive
            ? "bg-[#002F42] scale-x-100"
            : "bg-transparent scale-x-0 group-hover:bg-black group-hover:scale-x-100"
            } transition-transform duration-500 ease-in-out origin-center`}
          ></div>
        </div>
        <div
          className={`relative group cursor-pointer rounded-md w-8 h-8 flex items-center justify-center transition-colors duration-700 ease-in-out`}>
          <div className='text-4xl font-bold'>2</div>
          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#002F42] text-white text-xs px-2 py-1 rounded">
            Name 2
          </div>
          <div

            className={`absolute inset-x-0 -bottom-4 h-[3px] ${isNonactive
              ? "bg-[#002F42] scale-x-100"
              : "bg-transparent scale-x-0 group-hover:bg-black group-hover:scale-x-100"
              } transition-transform duration-500 ease-in-out origin-center`}
          ></div>
        </div>
        <div
          className={`relative group cursor-pointer rounded-md w-8 h-8 flex items-center justify-center transition-colors duration-700 ease-in-out`}>
          <div className='text-4xl font-bold'>+</div>
        </div>
      </div>
      <div className="w-full">
        <SymbolSearchWidget />
      </div>
      <div className="w-full mt-4">
        {stocks.map((stock, index) => (
          <div
            key={index}
            className="relative bg-[#DED7F8] p-2 mb-1 rounded-md shadow-md group"
          >
            {/* Stock Data */}
            <div className="flex justify-between items-center">
              <div className="flex">
                <div className="text-xl font-bold">{stock.name}</div>
                <div className="p-1 text-xs bg-gray-300 inline-block m-1">
                  {stock.exchange}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-xl font-bold ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {stock.value.toFixed(2)}
                </div>
                <div className="text-sm text-black">
                  {stock.change >= 0 ? '+' : ''}
                  {stock.change.toFixed(2)} ({stock.percentage >= 0 ? '+' : ''}
                  {stock.percentage.toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Hover Box (Show only when hovering over the symbol) */}
            <div className="absolute bottom-2 right-2 hidden group-hover:block bg-gray-500 shadow-md px-2 py-1 rounded-md border">
              <div className="flex space-x-2">
              {['Buy', 'Sell', 'Info', 'Chart'].map((label, idx) => (
                  <div key={idx} className="has-tooltip">
                    <span className="tooltip shadow-lg p-1 text-black -mt-8 bg-black text-white rounded-md px-4">
                      {label}
                    </span>
                    <button
                      className={`bg-gray-100 text-sm font-bold py-1 rounded-md w-8 ${
                        label === 'Buy'
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
        ))}
      </div>
    </div>
  );
}

export default Watchlist;

