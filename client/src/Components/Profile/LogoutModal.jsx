import React from "react";
import Modal from "react-modal";
import api from "../../interceptors";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loggedOut } from "../../store/authSlice";

Modal.setAppElement("#root"); // Set root element for accessibility

function LogoutModal() {
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await api.post(
        "/user/logout/",
        {
          refresh_token: localStorage.getItem("refreshToken"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      localStorage.clear();
      dispatch(loggedOut());
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {/* Button to open modal */}
      <button
        onClick={() => setModalIsOpen(true)}
        className="text-white md:font-bold md:text-lg text-sm cursor:pointer"
      >
        Logout
      </button>

      {/* Modal Component */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Are you sure you want to logout?
          </h2>
          <div className="flex justify-end space-x-4">
            {/* Cancel button */}
            <button
              onClick={() => setModalIsOpen(false)}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            {/* Confirm Logout */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default LogoutModal;
