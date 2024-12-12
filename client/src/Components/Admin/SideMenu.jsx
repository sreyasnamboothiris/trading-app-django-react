import React from 'react'

function SideMenu() {
  return (
    <div>
        <div className='hidden md:flex justify-center lg:w-full bg-[#002F42] p-2 rounded-lg'>
            <div className='m-2'>
                <div className='my-2
                cursor-pointer shadow-xl 
                hover:scale-105 hover:shadow-md hover:shadow-black transform transition duration-300
                 border rounded-md bg-white font-bold md:text-lg lg:text-xl text-[#002F42] lg:p-1 md:px-4 lg:px-8 md:flex items-center justifycenter'>
                    Dashboard
                </div>
                <div className=' my-2 justify-center flex
                cursor-pointer shadow-xl 
                hover:scale-105 hover:shadow-md hover:shadow-black transform transition duration-300
                 border rounded-md bg-white font-bold md:text-lg lg:text-xl text-[#002F42] lg:p-1 md:px-4 lg:px-8 md:flex items-center justifycenter'>
                    User
                </div>

            </div>

        </div>


    </div>
  )
}

export default SideMenu