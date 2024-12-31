import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../Components/Admin/Header';
import SideMenu from '../../Components/Admin/SideMenu';
import UserManagement from '../../Components/Admin/UserManagement';
import { useSelector } from 'react-redux';

function Admin() {
  const location = useLocation(); // Get the current location (URL path)
  const navigate = useNavigate();
  const isAuth = useSelector(state => state.auth.isAuth);
  const [loading, setLoading] = useState(true); // Add a loading state

  const isUserManagementPage = location.pathname.includes('/admin/user');

  useEffect(() => {
    // Perform authentication and authorization checks
    if (!isAuth) {
      navigate('/'); // Redirect to login if not authenticated
    } else if (!isAuth.is_staff) {
      navigate('/user/profile'); // Redirect to user profile if not staff
    } else {
      setLoading(false); // Allow rendering if all checks pass
    }
  }, [isAuth, navigate]);

  if (loading) {
    // Show a loading indicator until the checks are complete
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <Header />
      </div>
      <div className="flex flex-row">
        <div className="m-2">
          <SideMenu />
        </div>
        <div className="flex-1">
          {isUserManagementPage ? (
            // Render UserManagement if URL matches "/admin/user"
            <UserManagement />
          ) : (
            // Render default or other content if URL does not match
            <div>Content for other admin pages</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
