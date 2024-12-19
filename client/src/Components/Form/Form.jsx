import React from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InputField from './InputField';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../store/authSlice';

function Form(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLogin = props.signupStatus;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    if (isLogin) {
      // Wrap the API call with toast.promise
      toast.promise(
        api.post('user/login/', data),  // Ensure API call is correct
        {
          pending: 'Logging in...',  // Show loading message
          success: 'Login successful!', // Success toast
          error: 'Error: Please try again!' // Error toast
        }
      ).then((response) => {
        // Once promise resolves successfully
        console.log(response.data)
        const { access, refresh, email, username, user_id, is_staff } = response.data;
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('userInfo', JSON.stringify({ email, username, user_id, is_staff, access, refresh }));

        console.log({access,refresh,user_id,is_staff},'this is form.jsx while after login')
        dispatch(isAuthenticated({access,user_id,is_staff,refresh}));
  
        if (is_staff){
          setTimeout(()=>{
            navigate('admin/')
          },500)
        }
        setTimeout(() => {
          navigate('user/profile/');
        }, 1000); // 1-second delay
      }).catch((error) => {
        // You can log or handle any errors that occur here if needed
        console.error('Error during login:', error);
      });
    } else {
      // Handle sign-up similarly
      api.post('user/signup/', data)
        .then(response => {
          
          // Wait 1 second before navigating to profile
          navigate('login/otp') // 1-second delay
        })
        .catch(error => {
          toast.error('Error during signup!');
        });
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
                { !isLogin && 
                  <div className="flex flex-col">
                    <div className="flex flex-row bg-[#1A3B5D] rounded-md items-center justify-center">
                      <InputField
                        control={control}
                        name="username"
                        type="text"
                        placeholder="Enter your Username"
                        rules={{
                          required: "Username is required",
                        }}
                      />
                    </div>
                    {errors.username && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.username.message}
                      </span>
                    )}
                  </div>
                }
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
                    <label htmlFor="" className='ms-2 text-sm text-black'>Remember me</label>
                  </div>
                  <div>
                    <a href="" className='text-black text-sm'>Forgot password</a>
                  </div>
                </div> : 
                <div className='flex justify-between'>
                  <div className='flex items-center me-4'></div>
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
      <ToastContainer position="top-center" 
          autoClose={2000} 
          hideProgressBar={true} 
          newestOnTop={false} 
          closeOnClick />
    </div>
  );
}

export default Form;
