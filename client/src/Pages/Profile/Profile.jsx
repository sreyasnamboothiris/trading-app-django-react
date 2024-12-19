import React, { useEffect, useState } from 'react';
import Header from '../../Components/Header/Header';
import ProfileContent from '../../Components/Profile/ProfileContent';
import Watchlist from '../../Components/Watchlist/Watchlist';
import { useDispatch, useSelector } from 'react-redux'; // To access state
import { useNavigate } from 'react-router-dom'; // For navigation

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access the authentication state from Redux
  const isAuth = useSelector(state => state.auth.isAuth);
  const [loading, setLoading] = useState(true); // Loading state to prevent flashing unauthorized content

  useEffect(() => {
    // Check authentication and role
    if (!isAuth) {
      navigate('/'); // Redirect to login if not authenticated
    } else if (isAuth.is_staff) {
      navigate('/admin'); // Redirect to admin if the user is staff
    } else {
      setLoading(false); // Allow rendering if all checks pass
    }
  }, [isAuth, navigate]);

  if (loading) {
    // Show a loading spinner or message while authentication is being checked
    return <div>Loading...</div>;
  }

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
