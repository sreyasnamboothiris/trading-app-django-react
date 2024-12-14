import { createSlice } from '@reduxjs/toolkit';

// Check for token in localStorage
const token = localStorage.getItem('accessToken');

const initialState = {
  isAuth: token || null, // If token exists, set isAuth to token; otherwise, null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set the authentication status
    isAuthenticated: (state, action) => {
      state.isAuth = action.payload;
    },
    // Logout and clear the token
    loggedOut: (state) => {
      state.isAuth = null;
    },
  },
});

export const { isAuthenticated, loggedOut } = authSlice.actions; // Export actions
export default authSlice.reducer; // Export reducer
