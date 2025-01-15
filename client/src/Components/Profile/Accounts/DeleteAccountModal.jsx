import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import api from '../../../interceptors';
import { useSelector } from 'react-redux';

function DeleteAccountModal({ account, onDelete }) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const isAuth = useSelector((state) => state.auth.isAuth);

    const handleDeleteAccount = () => {
        setLoading(true);

        api
            .delete(`user/account/delete/`, {
                headers: {
                    Authorization: `Bearer ${isAuth.access}`,
                },
                data: { account_id: account.id }, // Send account ID to delete
            })
            .then(() => {
                toast.success('Account deleted successfully');
                setShowModal(false); // Close modal
                onDelete(); // Call the onDelete function passed as a prop to update the UI
            })
            .catch((error) => {
                const errorMessage = error.response?.data?.error || 'Error deleting account';
                toast.error(errorMessage);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div>
            <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick />
            <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-red-500 hover:text-red-700"
            >
                Delete
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-[#2D5F8B] border-black border-4 rounded-xl w-96">
                        <div className="bg-[#002F42] w-full p-2 flex justify-center">
                            <h2 className="text-4xl font-semibold mb-4">Delete Account</h2>
                        </div>

                        <div className="mb-4 p-6">
                            <p className="text-black text-lg">
                                Are you sure you want to delete the account "{account.name}"? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex justify-between gap-4 mt-6 p-6">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 text-lg font-bold text-white rounded-lg px-4 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="text-lg font-bold bg-red-500 text-white rounded-lg px-4 py-2"
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeleteAccountModal;
