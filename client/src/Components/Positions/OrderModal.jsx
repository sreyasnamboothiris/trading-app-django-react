import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { updateIsOrder } from "../../store/homeDataSlice";
import api from "../../interceptors";

const OrderModal = () => {
  const user = useSelector((state) => state.auth.isAuth);
  const { orderAsset } = useSelector((state) => state.homeData);
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: { price: "", quantity: 1 },
  });

  const [activeTab, setActiveTab] = useState("normal");
  const [productType, setProductType] = useState("intraday");
  const [assetPrice, setAssetPrice] = useState(null);
  const [orderSettings, setOrderSettings] = useState({
    isBuy: true,
    isMarketOrder: false,
    isMarketStopLoss: false,
    isMarketTarget: false,
    enableStopLoss: false,
    enableTarget: false,
  });

  const darkMode = localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const priceValue = watch("price");

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/assets/");
    socket.onopen = () => orderAsset && socket.send(JSON.stringify({
      watchlist_symbols: [orderAsset.smart_api_token || orderAsset.symbol]
    }));
    socket.onmessage = (e) => setAssetPrice(JSON.parse(e.data));
    return () => socket.close();
  }, [orderAsset]);

  useEffect(() => {
    if (orderSettings.isMarketOrder && assetPrice?.price) {
      setValue("price", assetPrice.price, { shouldValidate: true });
    }
  }, [assetPrice, orderSettings.isMarketOrder, setValue]);

  const toggleOrderSetting = useCallback((setting) => {
    setOrderSettings((prev) => {
      const newSettings = { ...prev, [setting]: !prev[setting] };
      if (setting === "isMarketOrder") {
        if (newSettings.isMarketOrder && assetPrice?.price) {
          setValue("price", assetPrice.price, { shouldValidate: true });
        } else if (!newSettings.isMarketOrder) {
          setValue("price", "", { shouldValidate: true });
        }
      }
      return newSettings;
    });
  }, [assetPrice, setValue]);

  const onSubmit = (data) => {
    const updatedData = {
      ...data,
      product_type: productType,
      order_type: orderSettings.isMarketOrder ? "market" : "limit",
      trade_type: orderSettings.isBuy ? "buy" : "sell",
      asset_id: orderAsset.id,
      is_stop_loss: orderSettings.enableStopLoss,
      is_market_stop_loss: orderSettings.isMarketStopLoss,
      is_target: orderSettings.enableTarget,
      is_market_target: orderSettings.isMarketTarget,
      is_market_price: orderSettings.isMarketOrder,
      price: orderSettings.isMarketOrder ? null : data.price,
      stop_loss: orderSettings.enableStopLoss && !orderSettings.isMarketStopLoss ? data.stop_loss : null,
      stop_loss_trigger: orderSettings.enableStopLoss ? data.stop_loss_trigger : null,
      target_price: orderSettings.enableTarget && !orderSettings.isMarketTarget ? data.target_price : null,
      target_price_trigger: orderSettings.enableTarget ? data.target_price_trigger : null,
    };

    api.post("trade/test/", updatedData, {
      headers: { Authorization: `Bearer ${user.access}`, "Content-Type": "application/json" },
    })
      .then(() => {
        console.log("Order created successfully", updatedData);
        dispatch(updateIsOrder(null));
      })
      .catch((error) => console.error("Order creation failed", error, updatedData));

    alert(JSON.stringify(updatedData, null, 2));
  };

  const variants = {
    modal: { hidden: { opacity: 0, scale: 0.9, y: 50 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } }, exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } } },
    button: { hover: { scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }, tap: { scale: 0.95 } },
    tab: { hover: { scale: 1.05 }, active: { scale: 1.1, color: darkMode ? "#68A875" : "#2D5F8B" } },
  };

  const inputClass = `px-3 py-2 rounded-lg border shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${darkMode ? "bg-gray-700 text-white border-gray-600 focus:ring-gray-500" : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-blue-500"}`;

  return (
    <motion.div variants={variants.modal} initial="hidden" animate="visible" exit="exit" drag dragMomentum={false} className={`w-full max-w-4xl p-4 sm:p-6 rounded-xl shadow-2xl absolute z-[1000] ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-lg sm:text-xl font-semibold">{orderAsset.name}</span>
            <span className={darkMode ? "text-red-400" : "text-red-500"}>{assetPrice?.price || orderAsset.last_traded_price}</span>
            <span className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm sm:text-base`}>{orderAsset.percent_change || "0.00"}% ({orderAsset.net_change || "0.00"})</span>
          </div>
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-xl p-1 mt-2 sm:mt-0">
            {["Buy", "Sell"].map((type) => (
              <motion.button key={type} type="button" variants={variants.button} whileHover="hover" whileTap="tap"
                onClick={() => setOrderSettings((prev) => ({ ...prev, isBuy: type === "Buy" }))}
                className={`px-3 py-1 text-sm font-semibold rounded-xl ${orderSettings.isBuy === (type === "Buy") ? (darkMode ? "bg-green-600 text-white" : "bg-green-500 text-white") : (darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-900")}`}>
                {type}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          {["normal", "stoploss"].map((tab) => (
            <motion.button key={tab} type="button" variants={variants.tab} whileHover="hover" animate={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-base sm:text-lg font-semibold relative ${activeTab === tab ? (darkMode ? "text-[#68A875]" : "text-[#2D5F8B]") : (darkMode ? "text-gray-400" : "text-gray-600")}`}>
              {tab === "normal" ? "Normal" : "Stop Loss"}
              {activeTab === tab && <motion.div className={`absolute bottom-0 left-0 right-0 h-0.5 ${darkMode ? "bg-[#68A875]" : "bg-[#2D5F8B]"}`} layoutId="underline" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.3 }} />}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Product Type</label>
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-xl p-1">
              {["intraday", "delivery"].map((type) => (
                <motion.button key={type} type="button" variants={variants.button} whileHover="hover" whileTap="tap"
                  onClick={() => setProductType(type)} className={`px-3 py-1 text-sm font-semibold rounded-xl ${productType === type ? (darkMode ? "bg-[#1A3B5D] text-white" : "bg-[#2D5F8B] text-white") : (darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-900")}`}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </motion.button>
              ))}
            </div>
            <label className="block mt-2 text-sm font-medium">Quantity</label>
            <motion.input 
              type="number" 
              {...register("quantity", { valueAsNumber: true, min: 1 })} 
              whileFocus={{ scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" }} 
              className={`w-20 ${inputClass}`} 
              step="1" 
              min={1} 
            />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">Quantity must be at least 1</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Price</label>
            <motion.input
              type="number"
              {...register("price", { 
                required: !orderSettings.isMarketOrder,
                valueAsNumber: true 
              })}
              value={orderSettings.isMarketOrder ? (assetPrice?.price || "") : priceValue}
              onChange={(e) => {
                if (!orderSettings.isMarketOrder) {
                  setValue("price", e.target.value, { shouldValidate: true });
                }
              }}
              whileFocus={{ scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" }}
              className={`w-24 ${inputClass}`}
              step="0.05"
              disabled={orderSettings.isMarketOrder}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">Price is required for limit orders</p>}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs">Limit</span>
              <motion.button 
                type="button" 
                onClick={() => toggleOrderSetting("isMarketOrder")} 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                className={`w-8 h-4 rounded-full ${orderSettings.isMarketOrder ? (darkMode ? "bg-blue-700" : "bg-blue-500") : "bg-gray-400"}`}
              >
                <motion.div 
                  className="w-4 h-4 bg-white rounded-full" 
                  animate={{ x: orderSettings.isMarketOrder ? 16 : 0 }} 
                  transition={{ type: "spring", stiffness: 300 }} 
                />
              </motion.button>
              <span className="text-xs">Market</span>
            </div>
          </div>

          <div className="space-y-1">
            {/* Changed from justify-between to gap-2 */}
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium">Stop Loss</label>
              <motion.button 
                type="button" 
                variants={variants.button} 
                whileHover="hover" 
                whileTap="tap" 
                onClick={() => toggleOrderSetting("enableStopLoss")}
                className={`px-2 py-1 text-xs rounded-lg ${orderSettings.enableStopLoss ? (darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white") : (darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-400 text-gray-900")}`}
              >
                {orderSettings.enableStopLoss ? "Disable" : "Enable"}
              </motion.button>
            </div>
            <AnimatePresence>
              {orderSettings.enableStopLoss && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                  <motion.input 
                    type="number" 
                    {...register("stop_loss")} 
                    whileFocus={{ scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" }} 
                    className={`w-20 ${inputClass} ${orderSettings.isMarketStopLoss ? "opacity-50 cursor-not-allowed" : ""}`} 
                    step="0.5" 
                    disabled={orderSettings.isMarketStopLoss} 
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">Limit</span>
                    <motion.button type="button" onClick={() => toggleOrderSetting("isMarketStopLoss")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`w-8 h-4 rounded-full ${orderSettings.isMarketStopLoss ? (darkMode ? "bg-blue-700" : "bg-blue-500") : "bg-gray-400"}`}>
                      <motion.div className="w-4 h-4 bg-white rounded-full" animate={{ x: orderSettings.isMarketStopLoss ? 16 : 0 }} transition={{ type: "spring", stiffness: 300 }} />
                    </motion.button>
                    <span className="text-xs">Market</span>
                  </div>
                  <label className="block mt-1 text-sm font-medium">Trigger Price</label>
                  <motion.input 
                    type="number" 
                    defaultValue="1045.00" 
                    {...register("stop_loss_trigger")} 
                    whileFocus={{ scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" }} 
                    className={`w-20 ${inputClass}`} 
                    step="0.5" 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-1">
            {/* Changed from justify-between to gap-2 */}
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium">Target Price</label>
              <motion.button 
                type="button" 
                variants={variants.button} 
                whileHover="hover" 
                whileTap="tap" 
                onClick={() => toggleOrderSetting("enableTarget")}
                className={`px-2 py-1 text-xs rounded-lg ${orderSettings.enableTarget ? (darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white") : (darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-400 text-gray-900")}`}
              >
                {orderSettings.enableTarget ? "Disable" : "Enable"}
              </motion.button>
            </div>
            <AnimatePresence>
              {orderSettings.enableTarget && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                  <motion.input 
                    type="number" 
                    defaultValue="1075.00" 
                    {...register("target_price")} 
                    whileFocus={{ scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" }} 
                    className={`w-20 ${inputClass} ${orderSettings.isMarketTarget ? "opacity-50 cursor-not-allowed" : ""}`} 
                    step="0.5" 
                    disabled={orderSettings.isMarketTarget} 
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">Market</span>
                    <motion.button type="button" onClick={() => toggleOrderSetting("isMarketTarget")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`w-8 h-4 rounded-full ${orderSettings.isMarketTarget ? (darkMode ? "bg-blue-700" : "bg-blue-500") : "bg-gray-400"}`}>
                      <motion.div className="w-4 h-4 bg-white rounded-full" animate={{ x: orderSettings.isMarketTarget ? 16 : 0 }} transition={{ type: "spring", stiffness: 300 }} />
                    </motion.button>
                    <span className="text-xs">Limit</span>
                  </div>
                  <label className="block mt-1 text-sm font-medium">Trigger Price</label>
                  <motion.input 
                    type="number" 
                    defaultValue="1076.00" 
                    {...register("target_price_trigger")} 
                    whileFocus={{ scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" }} 
                    className={`w-20 ${inputClass}`} 
                    step="0.5" 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <motion.button 
            type="button" 
            variants={variants.button} 
            whileHover="hover" 
            whileTap="tap" 
            onClick={() => dispatch(updateIsOrder(null))}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold ${darkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
          >
            Cancel
          </motion.button>
          <motion.button 
            type="submit" 
            variants={variants.button} 
            whileHover="hover" 
            whileTap="tap"
            className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold ${darkMode ? "bg-green-600 hover:bg-green-700 text-white" : "bg-[#2d9e73] hover:bg-[#3ab885] text-white"}`}
          >
            Submit
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default OrderModal;