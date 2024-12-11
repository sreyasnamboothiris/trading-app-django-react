import React, { useState } from 'react'
import Form from '../Form/Form'

function Login() {
  const  [isLogin,setIsLogin] = useState(true)
  return (
    <div className='flex flex-col items-center rounded-xl'>
      <div className='flex justify-center p-4 text-black'>
      <h1 className='text-4xl font-bold'>Welcome</h1>
      </div>
      <div className='flex justify-center'>
      <p className="text-black font-semibold text-xl">
        {isLogin ? 'Please login to continue' : 'Please sign up to create your account'}
      </p>
      </div>
      <Form signupStatus = {isLogin}/>
    <div className='w-96 grid grid-cols-1 gap-6'>
      <div className="grid grid-cols-3 items-center gap-2">
        <div className="w-full h-[2px] bg-black"></div>
        <div className="text-black text-center">Or</div>
        <div className="w-full h-[2px] bg-black"></div>
      </div>
      <div className='flex items-center justify-center'>
        <p>
          {isLogin ? "Dont't have any account" : 'Already have account'}
        </p>
      </div>


      <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-[50%] py-2 bg-[#2D5F8B] text-white font-bold text-xl rounded-md hover:bg-[#05a2be] transition"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
        </div>
      </div>
    </div>
  )
}

export default Login
