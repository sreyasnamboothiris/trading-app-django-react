import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateIsOrder } from '../../store/homeDataSlice';
import api from '../../interceptors';


{/* <span className="text-gray-400">{new Date(order.created_at).toLocaleString()}</span> */}

const OrderModal = () => {
  const user = useSelector((state) => state.auth.isAuth);
  const [activeTab, setActiveTab] = useState('normal');
  const [productType, setProductType] = useState('intraday');
  const [orderSettings, setOrderSettings] = useState({
    isBuy: true,
    isMarketOrder: false,
    isMarketStopLoss: false,
    isMarketTarget: false,
    enableStopLoss: false,
    enableTarget: false,
  });

  const dispatch = useDispatch();
  const { orderAsset } = useSelector((state) => state.homeData);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const toggleOrderSetting = useCallback((setting) => {
    setOrderSettings((prevSettings) => ({
      ...prevSettings,
      [setting]: !prevSettings[setting],
    }));
  }, []);

  const onSubmit = (data) => {
    // Build the data object to send to the backend
    const updatedData = {
      ...data,
      product_type: productType, // "Intraday" or "Delivery"
      order_type: orderSettings.isMarketOrder ? 'market' : 'limit',
      trade_type: orderSettings.isBuy ? 'buy' : 'sell',
      asset_id: orderAsset.id,
      is_stop_loss: orderSettings.enableStopLoss,
      is_market_stop_loss: orderSettings.isMarketStopLoss,
      is_target: orderSettings.enableTarget,
      is_market_target: orderSettings.isMarketTarget,
      is_market_price: orderSettings.isMarketOrder

      // <-- Added asset_id from redux store
    };

    // If market order is selected, set price to null.
    if (orderSettings.isMarketOrder) {
      updatedData.price = null;
    }

    // Handle Stop Loss values:
    if (!orderSettings.enableStopLoss) {
      // If stop loss is disabled, remove both values.
      updatedData.stop_loss = null;
      updatedData.stop_loss_trigger = null;
    } else {
      // If enabled but set as market, remove the stop loss value.
      if (orderSettings.isMarketStopLoss) {
        updatedData.stop_loss = null;
      }
      // Else, the user entered stop loss will be sent.
    }

    // Handle Target Price values:
    if (!orderSettings.enableTarget) {
      updatedData.target_price = null;
      // If you don't use targetTrigger on the backend, you can remove it.
      updatedData.target_price_trigger = null;
    } else {
      if (orderSettings.isMarketTarget) {
        updatedData.target_price = null;
      }
      // Else, the user-entered targetPrice (and optionally targetTrigger) will be sent.
    }

    // Post the data to the backend
    api.post('trade/test/', updatedData, {
      headers: {
        "Authorization": `Bearer ${user.access}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        console.log(updatedData)
        console.log(user)
        console.log('Order created successfully');
        dispatch(updateIsOrder(null));
      })
      .catch((error) => {
        console.log(updatedData)
        console.log(user)
        console.error(error);
      });

    alert(JSON.stringify(updatedData, null, 2)); // Debug: show the JSON being sent.
  };

  const handleCancelButton = () => {
    dispatch(updateIsOrder(null));
  };

  return (

    <motion.div
      drag
      dragMomentum={false}
      className="max-w-4xl bg-[#2D5F8B] text-white rounded-[15px] shadow-lg p-4 absolute"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-medium">{orderAsset.name}</span>
            <span className="text-red-400">{orderAsset.last_traded_price}</span>
            <span className="text-gray-400">
              {orderAsset.percent_change || '0.00'}% ({orderAsset.net_change || '0.00'})
            </span>
          </div>
          <div className="flex bg-white rounded-2xl overflow-hidden w-max p-1">
            <button
              type="button"
              onClick={() => setOrderSettings(prev => ({ ...prev, isBuy: true }))}
              className={`px-2 text-sm font-semibold rounded-2xl ${orderSettings.isBuy ? 'bg-green-500 text-white' : 'bg-white text-black'}`}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => setOrderSettings(prev => ({ ...prev, isBuy: false }))}
              className={`px-2 text-sm font-semibold rounded-2xl ${!orderSettings.isBuy ? 'bg-red-500 text-white' : 'bg-white text-black'}`}
            >
              S
            </button>
          </div>
        </div>

        {/* New Tab Header */}
        <div className="flex gap-2 mb-6 bg-[#002F42]">
          {['normal', 'stoploss'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-bold text-lg relative ${activeTab === tab ? 'text-[#68A875] font-bold text-xl' : 'bg-transparent'}`}
            >
              {tab === 'normal' ? 'Normal' : 'Stop loss'}
              {activeTab === tab && (
                <div className="absolute bottom-1 left-0 right-0 h-[.5px] bg-[#68A875] rounded"></div>
              )}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-5 gap-4">
          {/* Product Type & Quantity */}
          <div>
            <label className="block mb-2">Product Type</label>
            <div className="flex bg-white rounded-2xl overflow-hidden w-max p-2">
              {['intraday', 'delivery'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProductType(type)}
                  className={`px-2 text-sm font-semibold rounded-2xl ${productType === type ? 'bg-[#1A3B5D] text-white' : 'bg-white text-black'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <label className="block mt-4 mb-2">Quantity</label>
            <input
              type="number"
              defaultValue="1"
              {...register('quantity', { valueAsNumber: true, min: 1 })}
              className="w-20 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
              step="1"
              min={1}
            />
            {errors.quantity && <p className="text-red-500 text-sm">Quantity must be at least 1</p>}
          </div>

          {/* Price with Limit/Market Toggle */}
          <div>
            <label className="block mb-2">Price</label>
            <input
              type="number"
              defaultValue={orderAsset.last_traded_price}
              {...register('price', { required: !orderSettings.isMarketOrder })}
              className="w-24 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
              disabled={orderSettings.isMarketOrder}
            />
            {errors.price && <p className="text-red-500 text-sm">Price is required</p>}
            <div className="flex items-center gap-2 mt-2 mb-2">
              <span className='text-xs'>Limit</span>
              <button
                type="button"
                onClick={() => toggleOrderSetting('isMarketOrder')}
                className={`w-8 h-4 rounded-full ${orderSettings.isMarketOrder ? 'bg-blue-900' : 'bg-gray-600'}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transform ${orderSettings.isMarketOrder ? 'translate-x-4' : 'translate-x-0'} transition-transform`}
                />
              </button>
              <span className='text-xs'>Market</span>
            </div>
          </div>

          {/* Stop Loss */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block mb-2">Stop Loss</label>
              <button
                type="button"
                onClick={() => toggleOrderSetting('enableStopLoss')}
                className="px-2 py-1 text-xs bg-gray-500 rounded"
              >
                {orderSettings.enableStopLoss ? 'Disable' : 'Enable'}
              </button>
            </div>
            {orderSettings.enableStopLoss && (
              <>
                <input
                  type="number"
                  {...register('stop_loss')}
                  className="w-20 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
                  step="0.5"
                  disabled={orderSettings.isMarketStopLoss}
                />
                <div className="flex items-center gap-2 mt-2 mb-2">
                  <span className='text-xs'>Limit</span>
                  <button
                    type="button"
                    onClick={() => toggleOrderSetting('isMarketStopLoss')}
                    className={`w-8 h-4 rounded-full ${orderSettings.isMarketStopLoss ? 'bg-blue-900' : 'bg-gray-600'}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transform ${orderSettings.isMarketStopLoss ? 'translate-x-4' : 'translate-x-0'} transition-transform`}
                    />
                  </button>
                  <span className='text-xs'>Market</span>
                </div>
                <label className="block mt-2">Trigger Price</label>
                <input
                  type="number"
                  defaultValue="1045.00"
                  {...register('stop_loss_trigger')}
                  className="w-20 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
                  step="0.5"
                />
              </>
            )}
          </div>

          {/* Target Price */}
          <div>
            <div className="flex items-center gap-2 mt-2">
              <label className="block">Target Price</label>
              <button
                type="button"
                onClick={() => toggleOrderSetting('enableTarget')}
                className={`px-2 py-1 text-xs bg-gray-500 rounded ${orderSettings.enableTarget ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                {orderSettings.enableTarget ? 'Disable' : 'Enable'}
              </button>
            </div>
            {orderSettings.enableTarget && (
              <>
                <input
                  type="number"
                  defaultValue="1075.00"
                  {...register('target_price')}
                  className="w-20 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
                  step="0.5"
                  disabled={orderSettings.isMarketTarget}
                />
                <div className="flex items-center gap-2 mt-2 mb-2">
                  <span className='text-xs'>Limit</span>
                  <button
                    type="button"
                    onClick={() => toggleOrderSetting('isMarketTarget')}
                    className={`w-8 h-4 rounded-full ${orderSettings.isMarketTarget ? 'bg-blue-900' : 'bg-gray-600'}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transform ${orderSettings.isMarketTarget ? 'translate-x-4' : 'translate-x-0'} transition-transform`}
                    />
                  </button>
                  <span className='text-xs'>Market</span>
                </div>
                <label className="block mt-2">Trigger Price</label>
                <input
                  type="number"
                  defaultValue="1076.00"
                  {...register('target_price_trigger')}
                  className="w-20 px-3 py-2 bg-transparent border border-[#002F42] rounded-[15px] focus:outline-none"
                  step="0.5"
                />
              </>
            )}
          </div>
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex mt-6 justify-between">
          <button
            type="button"
            onClick={handleCancelButton}
            className="px-4 py-2 bg-[#e94560] text-white rounded-[15px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#2d9e73] text-white rounded-[15px]"
          >
            Submit
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default OrderModal;


