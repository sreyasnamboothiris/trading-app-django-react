import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../interceptors';

function ResetPasswordButton() {
  const [showModal, setShowModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);

    const userData = JSON.parse(localStorage.getItem('userInfo'));
    
    api.post('user/password/reset/', {
      user_id: userData.user_id,
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password:confirmPassword,
    })
      .then((response) => {
        toast.success('Password successfully changed');
        setShowModal(false); // Close the modal after successful change
      })
      .catch((error) => {
        toast.error('Error resetting password');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      {/* Button to show the modal */}
      <button
      type='button'
        onClick={() => setShowModal(true)}
        className="bg-[#2D5F8B] text-white p-1 text-lg font-bold rounded-lg px-4 py-2"
      >
        Reset Password
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-[#2D5F8B] border-black border-4 rounded-xl w-96">
            <div className='bg-[#002F42] w-full p-2 flex justify-center '>
            <h2 className="text-4xl font-semibold mb-4">Reset Password</h2>
            </div>

            <div className="mb-4 p-6">
              <label className="block text-black text-sm font-semibold">Old Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md placeholder-gray-700"
                placeholder="Enter your old password"
              />
            </div>

            <div className="mb-4 p-6">
              <label className="block text-sm font-semibold text-black">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md placeholder-gray-700"
                placeholder="Enter a new password"
              />
            </div>

            <div className="mb-4 p-6">
              <label className="block text-sm font-semibold text-black">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md placeholder-gray-700"
                placeholder="Confirm your new password"
              />
            </div>

            <div className="flex justify-between gap-4 mt-6 p-6">
              <button
                onClick={() => setShowModal(false)} // Close modal
                className="bg-red-500 text-lg font-bold text-white rounded-lg px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordReset}
                disabled={loading}
                className="text-lg font-bold bg-[#002F42] text-white rounded-lg px-4 py-2"
              >
                {loading ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPasswordButton;
