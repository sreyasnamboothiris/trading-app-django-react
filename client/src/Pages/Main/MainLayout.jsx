import React from 'react';
import Header from '../../Components/Header/Header';
import Watchlist from '../../Components/Watchlist/Watchlist';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import OrderModal from '../../Components/Positions/OrderModal'

function MainLayout() {
    const { orderAsset} = useSelector((state)=>state.homeData)
  return (
    <div className='dark:bg-gray-900 bg-[#D9D9D9] mt-1'>
      <Header />
      <div className='flex flex-row'>
        <div className='hidden lg:flex p-3'>
          <Watchlist />
        </div>
        {orderAsset && <OrderModal/>}
        <div className='w-screen py-3 pr-3'>
          <Outlet /> {/* This will render the page content dynamically */}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
