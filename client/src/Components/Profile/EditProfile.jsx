import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../Header/Header';
import defaultImage from '../../assets/Profle/7.png';
import AccountTable from './AccountTable';

function EditProfile() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, formState:{errors}} = useForm();

  const onSubmit = (data) =>{
    console.log(data)
    alert(data)
  }

  // Handle the image change
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle edit state (to show/hide input)
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  // Trigger file input when edit icon is clicked
  const handleEditClick = () => {
    document.getElementById('imageInput').click();
  };

  return (
    <div className='mt-1 bg-[#D9D9D9] dark:bg-black'>
      <Header />
      <div className='p-1 md:p-3 bg-[#DED7F8] dark:bg-black'>
      <form  onSubmit={handleSubmit(onSubmit)}>
        <div className='p-2 md:p-8 bg-[#DED7F8] md:px-24 border-2 border-gray-500 rounded-md'>
          <div>
            <div className="text-xl md:text-4xl text-black font-bold">
              <h1>Edit Profile</h1>
            </div>
            <div className='flex md:justify-between flex-col md:flex-row'>
              <div className='grid grid-cols-2 gap-16'>
                  <div className="relative">
                  {/* Profile image */}
                  <img
                    className="rounded-[50%] object-cover w-24 h-24"
                    src={selectedImage || defaultImage}
                    alt="Profile"
                  />
                  
                  {/* Edit button inside the image */}
                  <button
                    className="absolute"
                    onClick={handleEditClick} // Trigger file input when clicked
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>

                  {/* Hidden file input */}
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  </div>
                  <div className='flex p-5 text-sm text-black items-end'>
                    <div>
                        <div>
                          <h1>User Plan</h1>
                        </div>
                        <div className='flex justify-center text-lg font-semibold border border-black rounded-md'>
                            Basic
                        </div>
                    </div>
                        
                        
                  </div>
              </div>
           
            <div className='text-white p-5 mt-6 grid gap-10 md:mt-0 '>
               <div className='bg-[#2D5F8B] rounded-lg flex justify-center'><button type='button' className='p-1 text-lg font-bold'>Reset Password</button></div>  
               <div className='bg-[#2D5F8B] rounded-lg flex justify-center'><button type='button' className='p-1 text-lg font-bold'>Add Account</button></div>
               <div>
                        <div>
                          <h1>User Joined Date</h1>
                        </div>
                        <div className='flex justify-center text-black text-lg font-semibold border border-black rounded-md'>
                            29/11/2024
                        </div>
                    </div>
            </div>
          </div>
            
          </div>
          <div className='flex justify-between'>
          
            <div className='p-1 border grid gap-2 md:grid md:grid-cols-2 md:gap-8 md:gap-x-24'>
            <div className='w-56 p-2'>
            <div className=''>
                <label className='text-lg font-semibold text-[#002F42]' htmlFor="firstName">First Name</label>
                <div className='grid w-24'>
                  <input
                    id="firstName"
                    className='rounded-md border border-gray-300'
                    type="text"
                    {...register('firstName', { required: 'First Name is required' })}
                  />
                  {errors.firstName && (
                    <span className="text-red-600 text-sm">{errors.firstName.message}</span>
                  )}
                </div>
              </div>
            </div>

          <div className='w-56 p-2'>
            <div className=''>
                <label className='text-lg font-semibold text-[#002F42]' htmlFor="lastName">Last Name</label>
                <div>
                  <input
                    id="lastName"
                    className='rounded-md border border-gray-300'
                    type="text"
                    {...register('lastName', { required: 'Last Name is required' })}
                  />
                  {errors.lastName && (
                    <span className="text-red-600 text-sm">{errors.lastName.message}</span>
                  )}
                </div>
              </div>
            </div>

            <div className='w-56 p-2'>
            <div className=''>
                <label className='text-lg font-semibold text-[#002F42]' htmlFor="email">Email</label>
                <div>
                  <input
                    id="email"
                    className='rounded-md border border-gray-300'
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <span className="text-red-600 text-sm">{errors.email.message}</span>
                  )}
                </div>
              </div>
            </div>
            <div className='w-56 p-2'>
            <div className=''>
                <label className='text-lg font-semibold text-[#002F42]' htmlFor="username">User name</label>
                <div>
                  <input
                    id="username"
                    className='rounded-md border border-gray-300'
                    type="text"
                    {...register('username', {
                      required: 'Username is required',
                      minLength: {
                        value: 4,
                        message: 'Username must be at least 4 characters long',
                      },
                    })}
                  />
                  {errors.username && (
                    <span className="text-red-600 text-sm">{errors.username.message}</span>
                  )}
                </div>
              </div>
            </div>
            
              <button type='submit' className='flex rounded-md justify-center bg-[#2D5F8B] p-1 text-lg text-white font-bold'>
                Save
                </button>
            
          </div>

        
          
          </div>
          
        </div>
      </form>
      </div>
      <div>
        <AccountTable/>
      </div>
    </div>

  );
}

export default EditProfile;

