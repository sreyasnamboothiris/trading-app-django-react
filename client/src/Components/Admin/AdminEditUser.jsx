import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Header from './Header';
import defaultImage from '../../assets/Profle/7.png';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../interceptors';
import SideMenu from './SideMenu';
import { ToastContainer } from 'react-toastify';
import AccountTable from '../Profile/Accounts/AccountTable';
import { useSelector } from 'react-redux';
import BlockButton from './BlockButton';


function AdminEditUser() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(defaultImage);
  const [userDetails, setUserDetails] = useState(null);
  const [status, setStatus] = useState('Active'); // Status (Active or Blocked)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const isAuth = useSelector((state) => state.auth.isAuth)
  const [role, setRole] = useState('User'); 
  const {id : userId} = useParams();

  const { id } = useParams();
  useEffect(() => {
    // Fetch User Details
    api.get(`/mp-admin/user/edit/${id}/`,{
      headers: {
        Authorization: `Bearer ${isAuth.access}`,
      },
    })
      .then((response) => {
        setUserDetails(response.data);
        setRole(response.data.is_staff ? 'Admin' : 'User');
        setStatus(response.data.status); // Set initial status
        setValue('first_name', response.data.first_name);
        setValue('last_name', response.data.last_name);
        setValue('email', response.data.email);
        setValue('username', response.data.username);
        setPreviewImage('http://localhost:8000/'+response.data.profile_picture || defaultImage);
      })
      .catch((error) => console.error('Error fetching user details:', error));
  }, [userId, setValue]);

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    formData.append('email', data.email);
    formData.append('username', data.username);
    formData.append('is_staff', role === 'Admin');

    if (selectedImage) {
      formData.append('profile_picture', selectedImage);
    }

    api.patch(`mp-admin/user/edit/${userId}/`, formData)
  .then(() => {
    alert('User details updated successfully!');
  })
  .catch((error) => {
    console.error('Error updating user profile:', error);
  });
  };


  return (
    <div>
      <div>
        <Header />
        <ToastContainer position="top-center" 
          autoClose={2000} 
          hideProgressBar={true} 
          newestOnTop={false} 
          closeOnClick />
      </div>
      <div className="flex flex-row">
        <div className="m-2">
          <SideMenu />
        </div>
        <div className="flex-1">
        <div className='p-1 md:p-3 bg-[#DED7F8] dark:bg-black'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='p-2 md:p-8 bg-[#DED7F8] md:px-24 border-2 border-gray-500 rounded-md'>
            <div>
              <div className="text-xl md:text-4xl text-black font-bold">
                <h1>Edit Profile</h1>
              </div>
              <div className='flex md:justify-between flex-col md:flex-row'>
                <div className='grid grid-cols-2'>
                  
                <div className="relative">
                    <img
                      className="rounded-[50%] object-cover w-24 h-24"
                      src={previewImage}
                      alt="Profile"
                    />
                    
                    
                  </div>
                    
                  <div className='flex p-5 text-sm text-black items-end'>
                    <div className='flex flex-row gap-2'>
                      <div>
                      <div>
                        <h1>User Plan</h1>
                      </div>
                      <div className='flex justify-center text-lg font-semibold border border-black rounded-md'>
                      {userDetails ? userDetails.plan : ''}
                      </div>
                      </div>
                      <div>
                      <div>
                        <h1>User Status</h1>
                      </div>
                      <div className='flex justify-center text-lg font-semibold border border-black rounded-md'>
                        {userDetails && userDetails.is_active ? 'Active' : 'Block'}
                      </div>
                      </div>
                      
                    </div>
                  </div>
                </div>

                <div className='text-white p-5 mt-6 grid gap-10 md:mt-0'>
                { userDetails && 
                <div className=''><BlockButton userId = {userDetails.id} userStatus={userDetails.is_active}/></div>}
                  {/* <div className='bg-[#2D5F8B] rounded-lg flex justify-center'><button type='button' className='p-1 text-lg font-bold'>Add Account</button></div> */}
                  <div className='text-black'>
                    <div>
                      <h1>User Joined Date</h1>
                    </div>
                    <div className='flex justify-center text-black text-lg font-semibold border border-black rounded-md'>
                      {userDetails ? userDetails.date_joined: ''}
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
                        {...register('first_name')}
                        readOnly
                      />
                      
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
                        {...register('last_name')}
                        readOnly
                      />
                      
                    </div>
                  </div>
                </div>

                <div className='w-56 p-2'>
                  <div className=''>
                    <label className='text-lg font-semibold text-[#002F42]' htmlFor="email">Email</label>
                    <div>
                      <input
                        id="email"
                        className='rounded-md border border-gray-300 cursor-not-allowed'
                        type="email"
                        {...register('email')}
                        readOnly
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
                        className='rounded-md border border-gray-300 cursor-not-allowed'
                        type="text"
                        {...register('username')}
                        readOnly
                      />
                      {errors.username && (
                        <span className="text-red-600 text-sm">{errors.username.message}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className='bg-[#2D5F8B] flex items-center justify-center w-32 h-12 rounded-lg '>
                <button type='submit' className='flex bg-[#2D5F8B] text-lg text-white font-bold'>
                  Save
                </button>
                </div>
                <div className="mt-4">
                  <label htmlFor="role" className="text-lg font-semibold text-[#002F42]">Select Role</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)} // Update role state
                    className="mt-2 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>


              </div>
            </div>

          </div>
        </form>
      </div>
      {/* <AccountTable/> */}
      <div>
        
        
      </div>
        </div>
      </div>
    </div>

  );
}

export default AdminEditUser;


