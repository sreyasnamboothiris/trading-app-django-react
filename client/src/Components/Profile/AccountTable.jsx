import React, { useEffect, useState } from 'react';
import api from '../../interceptors'; // Import the configured Axios instance

function AccountTable() {
  const [accounts, setAccounts] = useState([]); // State to store account details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch account details on component mount
  useEffect(() => {
    setLoading(true);  // Start loading when the effect runs

    api.get('user/account/list/')  // Call the API directly
      .then(response => {
        setAccounts(response.data); // Assuming the API returns a list of accounts
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.detail || err.message);  // Capture specific error message from API
        setLoading(true);
      });
  }, []); // Empty dependency array means this will run once on mount

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex items-center justify-center bg-[#002F42] py-4 m-6">
      <div className="w-full max-w-6xl space-y-4">
        {/* Table Header */}
        <div className="text-lg text-white grid grid-cols-6 gap-6 p-4 rounded-md shadow-md">
          <div className="text-center font-semibold">Status</div>
          <div className="text-center font-semibold">Name</div>
          <div className="text-center font-semibold">Total Fund</div>
          <div className="text-center font-semibold">Currency</div>
          <div className="text-center font-semibold">Action</div>
        </div>

        {/* Render Account Rows */}
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-[#00496f] text-lg text-white grid grid-cols-6 gap-6 p-4 rounded-md shadow-md border border-gray-500"
          >
            <div className="text-center">{account.is_active ? 'Active' : 'Inactive'}</div>
            <div className="text-center">{account.name}</div>
            <div className="text-center">
              {account.funds.toLocaleString()} {account.currency.symbol}
            </div>
            <div className="text-center">{account.currency}</div>
            <div className="text-center space-x-2">
              <button className="text-blue-500 hover:text-blue-700">Edit</button>
              <button className="text-red-500 hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AccountTable;
