import React,{useState} from 'react'
import { useForm } from 'react-hook-form'
import api from '../../api';

import InputField from './InputField';

function Form(props) {
  const isLogin = props.signupStatus
    const {
        control,
        handleSubmit,
        formState: { errors },
      } = useForm();
      const onSubmit = (data) => {
        if (isLogin) {
          console.log("Logging In:", data);
          alert("Login Successful!");
        } else {
          api.post('user/signup/',data)
      .then(response=>{
        
       
      })
      .catch(error=>{
        
        
      })
          alert("Sign Up Successful!");
        }
      };
  return (
    <div>
      <div className="flex flex-col items-center justify-center mt-24 bg-white">
      <div className="w-96 p-6 bg-white">
        <h2 className="text-2xl font-bold text-center text-black mb-6">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Input */}
      <div className='grid grid-cols-1 gap-10'>
        <div className='grid grid-cols-1 gap-y-12'>
          <div className="flex flex-col">
            <div className="flex flex-row bg-[#1A3B5D] rounded-md items-center justify-center">
            
              <InputField
                control={control}
                name="email"
                type="email"
                placeholder="Enter your email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email address",
                  },
                }}
              />
            </div>
            {errors.email && (
              <span className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col mb-4">
            <div className="flex flex-row bg-[#1A3B5D] rounded-md items-center justify-center">
              <InputField
                control={control}
                name="password"
                type="password"
                placeholder="Enter your password"
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
              />
            </div>
            {errors.password && (
              <span className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </span>
            )}
          </div>
        </div>
          {isLogin ? 
            <div className='flex justify-between'>
            <div className='flex items-center me-4'>
              <input type="checkbox" className='rounded-[12px]' />
              <label htmlFor="" className='ms-2 text-sm text-black '>Remember me</label>
            </div>
            <div>
              <a href="" className='text-black text-sm'>Forgot password</a>
            </div>
            </div>
            : <div className='flex justify-between'>
                <div className='flex items-center me-4'>

                </div>
              </div>
            }
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-[#2D5F8B] text-white font-bold text-xl rounded-md hover:bg-[#05a2be] transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  </div>
  )
}

export default Form
