import React, { useState } from 'react';
import { motion } from 'framer-motion';

const OrderModal = () => {
  const [activeTab, setActiveTab] = useState('normal');
  const [isMarketOrder, setIsMarketOrder] = useState(false);
  const [isInPrice, setIsInPrice] = useState(false);
  const [productType, setProductType] = useState('Intraday');
  const [enableStopLoss, setEnableStopLoss] = useState(true);
  const [enableTarget, setEnableTarget] = useState(true);

  return (
    <motion.div 
      drag
      dragMomentum={false}
      className="w-full max-w-4xl bg-[#2D5F8B] text-white rounded-[15px] shadow-lg p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium">INDUSINDBK</span>
          <span className="text-red-400">1,053.70</span>
          <span className="text-gray-400">-0.30(-0.03)</span>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 text-xs bg-green-600 rounded">B</span>
          <span className="px-2 py-1 text-xs bg-red-600 rounded">S</span>
        </div>
      </div>

      {/* New Tab Header */}
      <div className="flex gap-2 mb-6 bg-[#002F42]">
        <button
          onClick={() => setActiveTab('normal')}
          className={`px-4 py-2 rounded font-bold text-lg relative ${
            activeTab === 'normal' ? 'text-[#68A875] font-bold text-xl' : 'bg-transparent'
          }`}
        >
          Normal
          {activeTab === 'normal' && (
            <div className="absolute bottom-1 left-0 right-0 h-[.5px] bg-[#68A875] rounded"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('stoploss')}
          className={`px-4 py-2 rounded font-bold text-lg relative ${
            activeTab === 'stoploss' ? 'text-[#68A875] font-bold text-xl' : 'bg-transparent'
          }`}
        >
          Stop loss
          {activeTab === 'stoploss' && (
            <div className="absolute bottom-1 left-0 right-0 h-[.5px] bg-[#68A875] rounded"></div>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-5 gap-4">
        {/* Product Type & Quantity */}
        <div>
          <label className="block mb-2">Product Type</label>
          <div className="flex bg-white rounded-xl overflow-hidden w-max p-2">
            <button
              onClick={() => setProductType('Intraday')}
              className={`px-2 text-sm rounded-xl ${
                productType === 'Intraday' ? 'bg-[#1A3B5D] text-white' : 'bg-white text-black'
              }`}
            >
              Intraday
            </button>
            <button
              onClick={() => setProductType('Delivery')}
              className={`px-2 text-sm rounded-xl ${
                productType === 'Delivery' ? 'bg-[#1A3B5D] text-white' : 'bg-white text-black'
              }`}
            >
              Delivery
            </button>
          </div>
          <label className="block mt-4 mb-2">Quantity</label>
          <input
            type="number"
            value="1"
            className="w-20 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
          />
        </div>

        {/* Price with Limit/Market Toggle */}
        <div>
          <label className="block mb-2">Price</label>
          <input
            type="number"
            value="1053.70"
            className="w-20 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
          />
          <div className="flex items-center gap-2 mt-2">
            <span>Limit</span>
            <button
              onClick={() => setIsMarketOrder(!isMarketOrder)}
              className={`w-12 h-6 rounded-full p-1 ${
                isMarketOrder ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transform ${
                  isMarketOrder ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span>Market</span>
          </div>
        </div>

        {/* Stop Loss */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block mb-2">Stop Loss</label>
            <button 
              onClick={() => setEnableStopLoss(!enableStopLoss)} 
              className="px-2 py-1 text-xs bg-gray-500 rounded">
              {enableStopLoss ? 'Disable' : 'Enable'}
            </button>
          </div>
          {enableStopLoss && (
            <>
              <input
                type="number"
                value="1045.00"
                className="w-20 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
              />
              <label className="block mt-2">Trigger Price</label>
              <input
                type="number"
                value="1045.00"
                className="w-20 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
              />
            </>
          )}
        </div>

        {/* Target Price */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block mb-2">Target Price</label>
            <button 
              onClick={() => setEnableTarget(!enableTarget)} 
              className="px-2 py-1 text-xs bg-gray-500 rounded">
              {enableTarget ? 'Disable' : 'Enable'}
            </button>
          </div>
          {enableTarget && (
            <>
              <input
                type="number"
                value="1075.00"
                className="w-20 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
              />
              <label className="block mt-2">Trigger Price</label>
              <input
                type="number"
                value="1076.00"
                className="w-20 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
              />
            </>
          )}
        </div>

        {/* Trailing SL */}
        <div>
          <label className="block mb-2">Trailing SL</label>
          <input
            type="number"
            className="w-20 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
          />
          <div className="flex items-center gap-2 mt-2">
            <span>In %</span>
            <button
              onClick={() => setIsInPrice(!isInPrice)}
              className={`w-12 h-6 rounded-full p-1 ${
                isInPrice ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transform ${
                  isInPrice ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span>In Price</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderModal;