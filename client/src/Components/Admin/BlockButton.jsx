import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../../interceptors';
import { useParams } from 'react-router-dom';

const BlockButton = ({ userId, userStatus }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [status, setStatus] = useState(userStatus); // Track user status locally
  
  const handleBlockClick = () => {
    setShowModal(true);  // Show the confirmation modal
  };

  const handleConfirmBlock = () => {
    setLoading(true);

    // Make API call to toggle user status
    api
      .post(
        '/mp-admin/user/block/',
        {
          user_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${isAuth.access}`,
          },
        }
      )
      .then((response) => {
        // Check if the response is successful
        if (response.data === "Successfully completed") {
            // Toggle user status after successful response
            setStatus(!status);
            toast.success(status ? 'User activated successfully' : 'User blocked successfully');
            setShowModal(false); // Close the modal after the operation
        } else {
            // If the response is 'failed', display an error toast message
            toast.error('User not found or failed to update');
        }
    })
    .catch((error) => {
        // Handle any error that occurs during the API call
        toast.error('Error updating user status. Please try again.');
        console.error(error);
    })
    .finally(() => {
        // End the loading state, regardless of success or failure
        setLoading(false);
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);  // Close the modal without doing anything
  };

  return (
    <div className="bg-[#2D5F8B] rounded-lg flex justify-center">
      {/* Block/Activate Button */}
      <button
        type="button"
        onClick={handleBlockClick}
        className="bg-[#2D5F8B] text-white p-1 text-lg font-bold rounded-lg px-4 py-2"
        disabled={loading}
      >
        {loading ? 'Processing...' : (status ? 'Block' : 'Activate')}
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-[#2D5F8B] border-black border-4 rounded-xl w-96 md:w-[600px]">
            <div className="bg-[#002F42] w-full p-2 flex justify-center">
              <h2 className="text-4xl font-semibold mb-4">Confirm {status ? 'Block' : 'Activate'}</h2>
            </div>

            <div className="p-2 text-center">
              <p className="text-white text-lg mb-4">Are you sure you want to {status ? 'block' : 'activate'} this user?</p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between gap-4 w-full p-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="bg-red-500 text-lg font-bold text-white rounded-lg px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                disabled={loading}
                className="text-lg font-bold bg-[#002F42] text-white rounded-lg px-4 py-2"
              >
                {loading ? 'Processing...' : (status ? 'Block' : 'Activate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockButton;
