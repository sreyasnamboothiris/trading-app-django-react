// src/Pages/Profile/Profile.jsx
import React, { useEffect, useState } from 'react';
import ProfileContent from '../../Components/Profile/ProfileManagement/ProfileContent';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuth) {
      navigate('/');
    } else if (isAuth.is_staff) {
      navigate('/admin');
    } else {
      setLoading(false);
    }
  }, [isAuth, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <ProfileContent />;
}

export default Profile;