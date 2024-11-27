import React,{useState} from 'react'
import { useForm } from 'react-hook-form'

import InputField from './InputField';

function Form() {
  const [isLogin, setIsLogin] = useState(true)
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
          console.log("Signing Up:", data);
          alert("Sign Up Successful!");
        }
      };
  return (
    <div>
      <div className="flex flex-col items-center justify-center h-screen bg-whit">
      <div className="w-96 p-6 bg-[#1E1E2C] rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Input */}
          <div className="flex flex-col mb-4">
            <div className="flex rounded-[12px] flex-row bg-[#1A3B5D] items-center justify-center">
              <i className="fa-solid fa-envelope p-2 ml-2 mr-2"></i>
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
            <div className="flex rounded-[12px] flex-row bg-[#1A3B5D] items-center justify-center">
              <i className="fa-solid fa-lock p-2 ml-2 mr-2"></i>
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-[#2D5F8B] text-white rounded-[12px] hover:bg-[#05a2be] transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Toggle Button */}
        <div className="mt-4 text-center">
          <p className="text-white text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#06b6d4] font-semibold hover:underline"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Form
