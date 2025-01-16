import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../interceptors";
import { useSelector } from "react-redux";

function AddWatchlistModal() {
    const [showModal, setShowModal] = useState(false);
    const [watchlistName, setWatchlistName] = useState("");
    const [loading, setLoading] = useState(false);
    const isAuth = useSelector((state) =>  state.auth.isAuth )
    const handleAddWatchlist = () => {
        if (!watchlistName) {
            toast.error("Watchlist name cannot be empty");
            return;
        }

        setLoading(true);

        // Make API request to create a watchlist
        api
            .post("user/account/watchlists/", { name: watchlistName, user_id: isAuth.user_id }) // Pass watchlist name in the request body
            .then((response) => {
                toast.success(response.data.message || "Watchlist created successfully");

                // Close modal after a short delay to ensure toast is visible
                setTimeout(() => {
                    setShowModal(false);
                }, 500); // Adjust the delay as needed (e.g., 500ms)
            })
            .catch((error) => {
                console.log(error)
                const errorMessage =
                    error.response?.data?.error || "Failed to create watchlist";
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
                className="text-4xl font-bold"
            >
                +
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-[#2D5F8B] border-black border-4 rounded-xl w-96">
                        <div className="bg-[#002F42] w-full p-2 flex justify-center">
                            <h2 className="text-4xl font-semibold mb-4">Add Watchlist</h2>
                        </div>

                        <div className="mb-4 p-6">
                            <label className="block text-black text-sm font-semibold">
                                Watchlist Name
                            </label>
                            <input
                                type="text"
                                value={watchlistName}
                                onChange={(e) => setWatchlistName(e.target.value)}
                                className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md placeholder-gray-700"
                                placeholder="Enter watchlist name"
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
                                onClick={handleAddWatchlist}
                                disabled={loading}
                                className="text-lg font-bold bg-[#002F42] text-white rounded-lg px-4 py-2"
                            >
                                {loading ? "Creating..." : "Add Watchlist"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddWatchlistModal;

