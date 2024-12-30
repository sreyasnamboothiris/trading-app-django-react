import { useEffect, useState } from 'react'
import React from 'react'
import Login from '../../Components/Login/Login'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

function LoginPage() {

  const [isSignup,setSignup] = useState(true)
  const isAuth = useSelector(state => state.auth.isAuth);
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(()=>{
    if(isAuth){
      const previousUrl = location.state?.from || '/home/';
      navigate(previousUrl)
      console.log('redirect to homepage')
    }
  },[isAuth,navigate,location.state])

  return (
    <div className='flex flex-col'>
      
      <Login/>

    </div>
  )
}

export default LoginPage