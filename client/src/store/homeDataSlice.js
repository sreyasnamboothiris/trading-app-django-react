import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  selectedAsset: {
    name: 'BITCOIN',
    asset_type: 'crypto',
    symbol: 'BTC',
    tradingview_symbol: 'BTCUSD', 
    last_traded_price: '19500.00',
    percent_change: '0.00',
    net_change: '0.00',
    is_crypto: false
  },
  watchlistData: [],
  loading: false,
  error: null
};

const homeDataSlice = createSlice({
  name: 'homeData',
  initialState,
  reducers: {
    setSelectedAsset: (state, action) => {
      state.selectedAsset = action.payload;
    },
    setWatchlistData: (state, action) => {
      state.watchlistData = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { 
  setSelectedAsset,
  setWatchlistData, 
  setLoading,
  setError
} = homeDataSlice.actions;

export default homeDataSlice.reducer;
