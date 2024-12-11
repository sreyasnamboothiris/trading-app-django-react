import React from 'react'

function AccountTable() {
  return (
    <div className="flex items-center justify-center bg-[#002F42] py-4 m-6">
  <div className="w-full max-w-6xl space-y-4">
    <div className="text-lg text-white grid grid-cols-6 gap-6 p-4 rounded-md shadow-md">
      <div className="text-center font-semibold"></div>
      <div className="text-center font-semibold">Name</div>
      <div className="text-center font-semibold">Total Fund</div>
      <div className="text-center font-semibold">Currency</div>
      <div className="text-center font-semibold">Action</div>
    </div>
    <div className="bg-[#00496f] text-lg text-white grid grid-cols-6 gap-6 p-4 rounded-md shadow-md border border-gray-500">
      <div className="text-center">Active</div>
      <div className="text-center">Sre</div>
      <div className="text-center">$23,000</div>
      <div className="text-center">USD</div>
      <div className="text-center space-x-2">
        <button className="text-blue-500 hover:text-blue-700">Edit</button>
        <button className="text-red-500 hover:text-red-700">Delete</button>
      </div>
    </div>
    <div className="bg-[#00496f] text-lg text-white grid grid-cols-6 gap-6 p-4 rounded-md shadow-md border border-gray-500">
      <div className="text-center">Inactive</div>
      <div className="text-center">John</div>
      <div className="text-center">$12,000</div>
      <div className="text-center">EUR</div>
      <div className="text-center space-x-2">
        <button className="text-blue-500 hover:text-blue-700">Edit</button>
        <button className="text-red-500 hover:text-red-700">Delete</button>
      </div>
    </div>
  </div>
</div>

  
  )
}

export default AccountTable