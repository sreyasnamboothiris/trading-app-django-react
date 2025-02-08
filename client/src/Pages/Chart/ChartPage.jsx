import React, { useState } from 'react'
import Chart from '../../Components/Chart/Chart'
import Header from '../../Components/Header/Header'
import Watchlist from '../../Components/Watchlist/Watchlist'
import { useSelector } from 'react-redux'
import OrderModal from '../../Components/Positions/OrderModal'

function ChartPage() {
  const {selectedAsset, orderAsset} = useSelector((state)=>state.homeData)
  
  return (
    <div className='dark:bg-gray-900 bg-[#D9D9D9] mt-1'>
      <Header />
      <div className='flex flex-row justify-center'>

        <div className='hidden lg:flex p-3'>
          <Watchlist />
        </div>
        {orderAsset && <OrderModal/>}
        <div className='w-screen py-3 pr-3'>
          <Chart/>
        </div>
      </div>
    </div>
  )
}

export default ChartPage



