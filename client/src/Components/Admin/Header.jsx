import React from 'react'

function Header() {
  return (
    <div>
        <div className='grid gap-2 p-2 md:p-12 md:flex md:justify-between my-1 bg-[#002F42]'>
            <div className='text-4xl text-white font-bold'>
                Admin dashboard
            </div>
            <div className=''>
                <div className='hidden'>
                    breads crumb
                </div>
            </div>
            <div className='cursor-pointer hidden md:text-xl text-white font-bold md:flex items-center px-12'>
                Logout
            </div>
        </div>
    </div>
  )
}

export default Header