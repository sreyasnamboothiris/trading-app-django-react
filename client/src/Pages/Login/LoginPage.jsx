import { useState } from 'react'
import React from 'react'
import Login from '../../Components/Login/Login'

function LoginPage() {

  const [isSignup,setSignup] = useState(true)

  return (
    <div className='flex flex-col'>
      
      <Login/>

    </div>
  )
}

export default LoginPage