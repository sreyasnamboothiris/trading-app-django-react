import { configureStore } from "@reduxjs/toolkit";
import authReducer from './authSlice'
import homeDataReducer from './homeDataSlice'


export const store = configureStore({
    reducer:{
        auth:authReducer,
        homeData:homeDataReducer
    }
})


export default store;