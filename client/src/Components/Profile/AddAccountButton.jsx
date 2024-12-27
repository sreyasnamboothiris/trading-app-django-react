import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../interceptors";

function AddAccountButton() {
  const [showModal, setShowModal] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [currency, setCurrency] = useState("");
  const [funds, setFunds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    // Fetch available currencies from the backend
    api.get("user/currency/list/")
      .then((response) => {
        setCurrencies(response.data); // Assuming API returns a list of currencies
      })
      .catch(() => {
        toast.error("Failed to fetch currencies");
      });
  }, []);

  const handleAddAccount = () => {
    if (!accountName || !currency || funds < 0) {
      toast.error("Please fill in all fields with valid data");
      return;
    }

    setLoading(true);

    api.post("user/account/create/", {
      name: accountName,
      currency,
      funds,
    })
      .then(() => {
        toast.success("Account created successfully");
        setShowModal(false); // Close modal
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Error creating account";
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="bg-[#2D5F8B] text-white p-1 text-lg font-bold rounded-lg px-4 py-2"
      >
        Add Account
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-[#2D5F8B] border-black border-4 rounded-xl w-96">
            <div className="bg-[#002F42] w-full p-2 flex justify-center">
              <h2 className="text-4xl font-semibold mb-4">Add Account</h2>
            </div>

            <div className="mb-4 p-6">
              <label className="block text-black text-sm font-semibold">
                Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md placeholder-gray-700"
                placeholder="Enter account name"
              />
            </div>

            <div className="mb-4 p-6">
              <label className="block text-black text-sm font-semibold">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md"
              >
                <option value="">Select currency</option>
                {currencies.map((cur) => (
                  <option key={cur.id} value={cur.id}>
                    {cur.name} ({cur.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 p-6">
              <label className="block text-black text-sm font-semibold">
                Funds
              </label>
              <input
                type="number"
                value={funds}
                onChange={(e) => setFunds(Number(e.target.value))}
                className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md placeholder-gray-700"
                placeholder="Enter funds amount"
              />
            </div>

            <div className="flex justify-between gap-4 mt-6 p-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-red-500 text-lg font-bold text-white rounded-lg px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAccount}
                disabled={loading}
                className="text-lg font-bold bg-[#002F42] text-white rounded-lg px-4 py-2"
              >
                {loading ? "Creating..." : "Add Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddAccountButton;
