import React from 'react'
import Header from '../../Components/Header/Header'
import Watchlist from '../../Components/Watchlist/Watchlist'
import Order from '../../Components/Positions/Order'


function OrderPage() {
  return (
    <div className='dark:bg-gray-900 bg-[#D9D9D9] mt-1'>
    <Header />
    <div className='flex flex-row'>
      <div className='hidden lg:flex p-3'>
        <Watchlist />
      </div>
      <div className='w-screen py-3 pr-3'>
        <Order/>
      </div>
    </div>
  </div>
  )
}

export default OrderPage