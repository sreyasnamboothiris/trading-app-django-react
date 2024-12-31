// Importing necessary dependencies and components
import React, { useEffect, useState } from 'react';
import api from '../../../interceptors'; // Custom API interceptor for handling requests
import { useSelector } from 'react-redux'; // Redux hook to access authentication state
import { ToastContainer, toast } from 'react-toastify'; // For displaying success/error messages
import 'react-toastify/dist/ReactToastify.css'; // Importing toast styles
import EditAccountModal from './EditAccountModal';

function AccountTable() {
  // State for storing accounts data
  const [accounts, setAccounts] = useState([]);
  // State to manage loading spinner
  const [loading, setLoading] = useState(true);
  // State to store error messages
  const [error, setError] = useState(null);
  // State to toggle the confirmation modal
  const [showModal, setShowModal] = useState(false);
  // State to track the selected account for switching
  const [selectedAccount, setSelectedAccount] = useState(null);
  // Access the authentication token from Redux store
  const isAuth = useSelector((state) => state.auth.isAuth);

  // Fetch accounts data when the component mounts

  const fetchAccounts = () => {
    setLoading(true); // Show loading spinner
  
    api
      .get('user/account/list/', {
        headers: {
          Authorization: `Bearer ${isAuth.access}`,
        },
      })
      .then((response) => {
        const sortedAccounts = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setAccounts(sortedAccounts);
        setLoading(false); // Stop loading spinner
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message); // Capture error message
        setLoading(false);
      });
  };
  useEffect(() => {
    fetchAccounts()
  }, []);

  // Function to handle account switching
  const handleSwitchAccount = (accountId) => {
    api
      .patch(
        'user/account/update/',
        { account_id: accountId,
          is_active:true,
         }, // Payload for switching account
        {
          headers: {
            Authorization: `Bearer ${isAuth.access}`, // Add authentication token to headers
          },
        }
      )
      .then(() => {
        // Update the accounts state to reflect the active account
        fetchAccounts();
        setShowModal(false); // Close the modal
        toast.success('Account switched successfully!'); // Show success message
        
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message); // Capture error message
        toast.error('Failed to switch account. Please try again.'); // Show error message
      });
  };

  // Show loading spinner while fetching data
  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  // Show error message if there's an issue fetching data
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  // Render the accounts table
  return (
    <div className="flex items-center justify-center bg-[#002F42] py-4 m-6">
      <div className="w-full max-w-6xl space-y-4">
        {/* Table headers */}
        <div className="text-lg text-white grid grid-cols-6 gap-6 p-4 rounded-md shadow-md">
          <div className="text-center font-semibold">Status</div>
          <div className="text-center font-semibold">Name</div>
          <div className="text-center font-semibold">Total Fund</div>
          <div className="text-center font-semibold">Currency</div>
          <div className="text-center font-semibold">Action</div>
        </div>

        {/* Render account rows */}
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-[#00496f] text-lg text-white grid grid-cols-6 gap-6 p-4 rounded-md shadow-md border border-gray-500"
          >
            <div className="text-center">
              {account.is_active ? 'Using' : 'Inactive'}
            </div>
            <div className="text-center">{account.name}</div>
            <div className="text-center">
              {account.funds.toLocaleString()} {account.currency.symbol}
            </div>
            <div className="text-center">{account.currency}</div>
            <div className="text-center space-x-2">
              <EditAccountModal account={account} onUpdate={fetchAccounts}  />
              <button className="text-red-500 hover:text-red-700">Delete</button>
            </div>
            {!account.is_active && (
              <div
                className="text-green-500 cursor-pointer"
                onClick={() => {
                  setSelectedAccount(account.id); // Set selected account for modal
                  setShowModal(true); // Show modal
                }}
              >
                Switch Account
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for confirming account switch */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Switch Account</h2>
            <p>Are you sure you want to switch to this account?</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={() => setShowModal(false)} // Close modal on cancel
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md"
                onClick={() => handleSwitchAccount(selectedAccount)} // Confirm switch
              >
                Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast container for notifications */}
      <ToastContainer
        position="top-center" // Display notifications at the top center
        autoClose={1000} // Close notifications automatically after 1 second
        hideProgressBar={true} // Hide progress bar
        closeOnClick // Close notifications on click
        pauseOnHover={false} // Do not pause on hover
        draggable // Allow notifications to be dragged
        theme="colored" // Use colored theme for notifications
        style={{ margin: '0 auto' }}
      />
    </div>
  );
}

export default AccountTable;
