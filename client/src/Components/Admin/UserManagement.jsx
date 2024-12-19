import React, { useEffect, useState } from 'react';
import api from '../../interceptors';
import { useNavigate } from 'react-router-dom';
import CreateUserModal from './CreateUserModal';
import { useSelector } from 'react-redux';

function UserManagement() {
  const [usersList, setUsersList] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0); // Total number of users
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [usersPerPage] = useState(6); // Number of users per page
  const navigate = useNavigate();
  const isAuth = useSelector((state) => state.auth.isAuth);

  useEffect(() => {
    // Fetch users from API with pagination
    api
      .get('mp-admin/users/', {
        headers: {
          Authorization: `Bearer ${isAuth.access}`,
          'Content-Type': 'multipart/form-data', // Ensure correct content type
        },
        params: {
          page: currentPage,
          limit: usersPerPage, // Request only the specified number of users per page
        },
      })
      .then((response) => {
        setUsersList(response.data.users); // Assuming API response contains 'users' array
        setTotalUsers(response.data.totalUsers); // Assuming API response contains total user count
      })
      .catch((error) => {
        console.error('There was an error fetching the users data!', error);
      });
  }, [currentPage, isAuth]); // Trigger effect when currentPage or auth token changes

  // Calculate total pages
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-4 bg-[#DED7F8] min-h-screen">
      {/* Top Section */}
      <div className="flex justify-between items-center mb-4">
        {/* Total Users */}
        <div className="w-1/2 text-center">
          <p className="text-sm font-medium text-gray-600">Total Users</p>
          <p className="text-xl font-bold text-gray-800">{totalUsers}</p>
        </div>

        {/* Total Accounts */}
        <div className="w-1/2 text-center">
          <p className="text-sm font-medium text-gray-600">Total Accounts</p>
          <p className="text-xl font-bold text-gray-800">0</p>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t-2 border-gray-300 my-4" />

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-center gap-6">
        {/* Basic Users */}
        <div className="bg-[#2D5F8B] text-white p-4 rounded-[16px] text-center flex-none w-1/4 mx-2 mb-4 md:mb-0">
          <p className="text-sm font-medium">Basic Users</p>
          <p className="text-lg font-bold mt-2">
            {usersList.filter((user) => user.plan === 'free').length}
          </p>
        </div>
        {/* Premium Users */}
        <div className="bg-[#2D5F8B] text-white p-4 rounded-[16px] text-center flex-none w-1/4 mx-2">
          <p className="text-sm font-medium">Premium Users</p>
          <p className="text-lg font-bold mt-2">
            {usersList.filter((user) => user.plan === 'Premium').length}
          </p>
        </div>
        {/* Create User Modal */}
        <div className="text-white p-4 rounded-lg text-center flex-1 mx-2 mb-4 md:mb-0">
          <div>
            <CreateUserModal />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-8">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#002F42] text-white rounded-[18px] overflow-hidden">
            {/* Table Head */}
            <thead className="bg-[#002F42]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Username</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Number of Accounts</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Subscriptions</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {usersList.length > 0 ? (
                usersList.map((user) => (
                  <tr key={user.id} className="bg-black hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-gray-400 mt-1">Joined: {user.date_joined}</p>
                    </td>
                    <td className="px-4 py-4 text-sm">{user.status ? 'Active' : 'Blocked'}</td>
                    <td className="px-4 py-4 text-sm">{user.number_of_accounts}</td>
                    <td className="px-4 py-4 text-sm">{user.plan}</td>
                    <td className="px-4 py-4 text-sm">
                      <button onClick={() => {navigate(`/admin/user/edit/${user.id}`)}} className="text-blue-400 hover:text-blue-600">Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center text-sm font-medium">No users available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50" 
          disabled={currentPage <= 1}>
          Previous
        </button>
        <span className="mx-4 text-lg font-medium">{currentPage} / {totalPages}</span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50" 
          disabled={currentPage >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default UserManagement;
