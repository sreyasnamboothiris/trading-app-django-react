import { useState } from 'react'
import React from 'react'
import Login from '../../Components/Login/Login'

function LoginPage() {
  const [isSignup,setSignup] = useState(true)
  return (
    <div className='flex flex-col'>
      <div className='flex justify-center p-4 text-black'>
      <h1 className='text-4xl font-bold'>Welcome</h1>
      </div>
      <div className='flex justify-center'>
      <p className="text-black font-semibold text-xl">
        {isSignup ? 'Please sign up to create your account' : 'Please login to continue'}
      </p>
      </div>
      <Login/>
      
    </div>
  )
}

export default LoginPage
