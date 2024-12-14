import React, { useEffect } from 'react';
import Header from '../../Components/Header/Header';
import ProfileContent from '../../Components/Profile/ProfileContent';
import Watchlist from '../../Components/Watchlist/Watchlist';
import { useDispatch, useSelector } from 'react-redux'; // To access state
import { useNavigate } from 'react-router-dom'; // For navigation

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Access the authentication state from Redux (assuming isAuthenticated state exists)
  const isAuth = useSelector(state => state.auth.isAuth);
  console.log(isAuth)
  useEffect(() => {
    // If the user is not authenticated, redirect them to the login page
    if (!isAuth) {
      navigate('/');  // Redirect to login page if not authenticated
    }
  }, [isAuth, navigate]); // Dependency array ensures the effect runs when the authentication state changes

  return (
    <div className='dark:bg-gray-900 bg-[#D9D9D9] mt-1'>
      <Header />
      <div className='flex flex-row'>
        <div className='hidden lg:flex p-3'>
          <Watchlist />
        </div>
        <div className='w-screen py-3 pr-3'>
          <ProfileContent />
        </div>
      </div>
    </div>
  );
}

export default Profile;
