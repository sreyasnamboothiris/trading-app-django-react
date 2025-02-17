import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InputField from './InputField';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../store/authSlice';
import Otp from './Otp'; // Import your OTP modal component


function Form(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLogin = props.signupStatus;
  const [showModal, setShowModal] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    if (isLogin) {
      // Wrap the API call with toast.promise for login
      toast.promise(
        api.post('user/login/', data),  // Ensure API call is correct
        {
          pending: 'Logging in...',  // Show loading message
          success: 'Login successful!', // Success toast
          error: 'Error: Please try again!' // Error toast
        }
      ).then((response) => {
        // Once promise resolves successfully
        console.log(response.data);
        const { access, refresh, email, username, user_id, is_staff } = response.data;
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('userInfo', JSON.stringify({ email, username, user_id, is_staff, access, refresh }));

        dispatch(isAuthenticated({ access, user_id, is_staff, refresh }));

        if (is_staff) {
          setTimeout(() => {
            navigate('admin/');
          }, 500);
        }

        setTimeout(() => {
          navigate('user/profile/');
        }, 1000); // 1-second delay after login
      }).catch((error) => {
        console.error('Error during login:', error);
        toast.error('Login failed. Please try again!');
      });
    } else {
      // Handle sign-up similarly with toast for success and error
      toast.promise(
        api.post('user/signup/', data),
        {
          pending: 'Signing up...',  // Show loading message
          success: 'Sign up successful! Please check your inbox for OTP.', // Success toast
          error: 'Error: Sign up failed! Please try again.' // Error toast
        }
      ).then((response) => {
        console.log(response.data.email)
        localStorage.setItem('email', response.data.email);
        setShowModal(true); // Show the OTP modal
      }).catch((error) => {
        console.error('Error during signup:', error);
        toast.error('Error during signup! Please try again.');
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center mt-2 bg-white">
        <div className="w-96 p-6 bg-white">
          <h2 className="text-2xl font-bold text-center text-black mb-6">
            {isLogin ? "Login" : "Sign Up"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Input */}
            <div className='grid grid-cols-1 gap-10'>
              <div className='grid grid-cols-1 gap-y-12'>
                {!isLogin &&
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


      {/* Modal to display OTP */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-2 rounded-md max-w-sm w-full">
          <Otp onSuccess={() => window.location.reload()} />
            <button
              onClick={() => setShowModal(false)} // Close the modal when clicked
              className="mt-4 w-full py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Form;

