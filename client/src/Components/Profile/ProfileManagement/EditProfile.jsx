import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../../Header/Header';
import defaultImage from '../../../assets/Profle/7.png';
import AccountTable from '../Accounts/AccountTable';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../interceptors';
import { ToastContainer } from 'react-toastify';
import ResetPassword from './ResetPassword';
import AddAccountButton from '../Accounts/AddAccountButton'
import Watchlist from '../../Watchlist/Watchlist';


function EditProfile() {
  const [loading, setLoading] = useState(true); // For loading state
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null); // File for upload
  const [previewImage, setPreviewImage] = useState(defaultImage); // Image preview
  const [userDetails, setUserDetails] = useState(null); // Store user details
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const isAuth = useSelector((state) => state.auth.isAuth);

  useEffect(() => {
    if (!isAuth) {
      navigate('/'); // Redirect if not authenticated
      return;
    }

    // Check if user is not is_staff
    if (isAuth.is_staff) {
      toast.error('Unauthorized Access');
      navigate('admin/'); // Redirect to an unauthorized page or homepage
      return;
    }

    api.get(`user/profile/${isAuth.user_id}/`, {
      headers: {
        Authorization: `Bearer ${isAuth.access}`,
      },
    })
      .then((response) => {
        setUserDetails(response.data.user);
        setValue('first_name', response.data.user.first_name);
        setValue('last_name', response.data.user.last_name);
        setValue('email', response.data.user.email);
        setValue('username', response.data.user.username);
        setPreviewImage(response.data.user.profile_picture ? `http://localhost:8000/${response.data.user.profile_picture}` : defaultImage);
      })
      .catch((error) => {
        console.error('Error fetching user details:', error);
        toast.error('Failed to load user data');
      })
      .finally(() => {
        setLoading(false); // Set loading to false once the data is fetched
      });
  }, [isAuth, navigate, setValue]);

  const onSubmit = (data) => {
    const userData = JSON.parse(localStorage.getItem('userInfo'));

    // Create a FormData object
    const formData = new FormData();
    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    formData.append('email', data.email);
    formData.append('username', data.username);

    if (selectedImage) {
      formData.append('profile_picture', selectedImage); // Add the image file
    }

    api.patch(`user/profile/edit/${userData.user_id}/`, formData, {
      headers: {
        Authorization: `Bearer ${isAuth.access}`,
        'Content-Type': 'multipart/form-data', // Ensure correct content type 
      },
    })
      .then((response) => {
        setUserDetails(response.data.data);
        
        setPreviewImage('http://localhost:8000/' + response.data.data.profile_picture);
        toast.success(response.data.message);

      })
      .catch((error) => {

        const error_message = error.response.data.error
        toast.error(error_message);

      });
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file); // Save file for upload
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result); // Set preview
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!isAuth) {
      navigate('/');
    }
  }, [isAuth, navigate]);

  const handleEditClick = () => {
    document.getElementById('profile_picture').click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className='mt-1 bg-[#D9D9D9] dark:bg-black'>
      <Header />
      <div className='flex flex-row'>
        <div className='hidden lg:flex p-3'>
          <Watchlist />
        </div>
        <div className='w-screen py-2'>
        <div className='p-1 md:p-1 bg-[#DED7F8] dark:bg-black'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='p-2 md:p-8 bg-[#DED7F8] md:px-24 border-2 border-gray-500 rounded-md'>
            <div>
              <div className="text-xl md:text-4xl text-black font-bold">
                <h1>Edit Profile</h1>
              </div>
              <div className='flex md:justify-between flex-col md:flex-row'>
                <div className='grid grid-cols-2 gap-16'>
                  <div className="relative">
                    <img
                      className="rounded-[50%] object-cover w-24 h-24"
                      src={previewImage}
                      alt="Profile"
                    />
                    <button
                      type="button"
                      className="absolute"
                      onClick={handleEditClick}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <input
                      id="profile_picture"
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
                        {userDetails ? userDetails.plan : ""}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='text-white p-5 mt-6 grid gap-10 md:mt-0'>
                  <div className='bg-[#2D5F8B] rounded-lg flex justify-center'><ResetPassword /></div>
                  <div className='bg-[#2D5F8B] rounded-lg flex justify-center'><AddAccountButton /></div>
                  <div className='text-black'>
                    <div>
                      <h1>User Joined Date</h1>
                    </div>
                    <div className='flex justify-center text-black text-lg font-semibold border border-black rounded-md'>
                      {userDetails ? userDetails.date_joined : ''
                      }
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
                        id="first_name"
                        className='rounded-md border border-gray-300'
                        type="text"
                        {...register('first_name', {
                          required: 'First Name is required',
                          minLength: {
                            value: 2,
                            message: 'First Name must be at least 2 characters long',
                          },
                          validate: {
                            noSpaces: (value) => value.trim() !== '' || 'Firstname cannot be only spaces',
                            minLength: (value) => value.trim().length >= 4 || 'Firstname needs at least 4 characters',
                          }
                        })}
                      />
                      {errors.first_name && (
                        <span className="text-red-600 text-sm">{errors.first_name.message}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className='w-56 p-2'>
                  <div className=''>
                    <label className='text-lg font-semibold text-[#002F42]' htmlFor="lastName">Last Name</label>
                    <div>
                      <input
                        id="last_name"
                        className='rounded-md border border-gray-300'
                        type="text"
                        {...register('last_name', {
                          required: 'Last Name is required',
                          minLength: {
                            value: 2,
                            message: 'Last Name must be at least 1 characters long',
                          },
                          validate: {
                            noSpaces: (value) => value.trim() !== '' || 'Lastname cannot be only spaces',
                            minLength: (value) => value.trim().length >= 2 || 'Lastname needs at least 2 character',
                          }
                        })}
                      />
                      {errors.last_name && (
                        <span className="text-red-600 text-sm">{errors.last_name.message}</span>
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
                          validate: {
                            noSpaces: (value) => value.trim() !== '' || 'Username cannot be only spaces',
                            minLength: (value) => value.trim().length >= 4 || 'Username needs at least 4 characters',
                          }
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
        </div>
      </div>
      
      <div>
        <AccountTable />
      </div>
    </div>
  );
}

export default EditProfile;

