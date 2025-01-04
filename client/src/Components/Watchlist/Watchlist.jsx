import React, { useState } from 'react'
import SymbolSearchWidget from './SymbolSearchWidget'

function Watchlist() {
  const [isActive, setIsActive] = useState(true)
  const [isNonactive, setIsNonactive] = useState('')
  return (
    <div className='md:w-40 lg:w-60 xl:w-80 bg-[#2D5F8B] p-2 flex flex-col'>
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
      </div>
      <div className='w-full'>
       
        <SymbolSearchWidget />
      </div>

    </div>
  )
}

export default Watchlist