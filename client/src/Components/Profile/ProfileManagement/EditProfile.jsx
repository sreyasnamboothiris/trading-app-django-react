import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../interceptors";
import Header from "../../Header/Header";
import defaultImage from "../../../assets/Profle/7.png";
import AccountTable from "../Accounts/AccountTable";
import ResetPassword from "./ResetPassword";
import AddAccountButton from "../Accounts/AddAccountButton";
import Watchlist from "../../Watchlist/Watchlist";

function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(defaultImage);
  const [userDetails, setUserDetails] = useState(null);
  const [darkMode] = useState(() =>
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const isAuth = useSelector((state) => state.auth.isAuth);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (!isAuth || !isAuth.user_id || !isAuth.access) {
      navigate("/");
      return;
    }
    if (isAuth.is_staff) {
      toast.error("Unauthorized Access");
      navigate("/admin/");
      return;
    }

    api
      .get(`user/profile/${isAuth.user_id}/`, {
        headers: { Authorization: `Bearer ${isAuth.access}` },
      })
      .then((response) => {
        const user = response.data.user || response.data;
        setUserDetails(user);
        setValue("first_name", user.first_name);
        setValue("last_name", user.last_name);
        setValue("email", user.email);
        setValue("username", user.username);
        setPreviewImage(user.profile_picture ? `http://localhost:8000/${user.profile_picture}` : defaultImage);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error.response?.data || error.message);
        toast.error("Failed to load user data");
      })
      .finally(() => setLoading(false));
  }, [isAuth, navigate, setValue]);

  const onSubmit = (data) => {
    const userData = JSON.parse(localStorage.getItem("userInfo")) || { user_id: isAuth.user_id };
    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    formData.append("username", data.username);
    if (selectedImage) formData.append("profile_picture", selectedImage);

    api
      .patch(`user/profile/edit/${userData.user_id}/`, formData, {
        headers: {
          Authorization: `Bearer ${isAuth.access}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setUserDetails(response.data.data);
        setPreviewImage(`http://localhost:8000/${response.data.data.profile_picture}`);
        toast.success(response.data.message);
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.error || "Failed to update profile";
        toast.error(errorMessage);
      });
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => document.getElementById("profile_picture").click();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-[#F5F5F5] text-gray-900"}`}
    >
      <AnimatePresence>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-screen"
          >
            <i className="fas fa-spinner fa-spin text-4xl mr-3" />
            <span className="text-xl font-semibold">Loading...</span>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row">

            {/* Main Content */}
            <motion.div
              variants={itemVariants}
              className="w-full lg:w-4/4 py-4 px-4 sm:px-8"
            >
              <div className={`p-6 sm:p-8 rounded-2xl shadow-xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <motion.h1
                  variants={itemVariants}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center md:text-left"
                >
                  Edit Profile
                </motion.h1>

                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Profile Header */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8"
                  >
                    <div className="relative group">
                      <img
                        className="rounded-full w-24 h-24 sm:w-32 sm:h-32 object-cover border-4 border-gray-300 dark:border-gray-600 shadow-md"
                        src={previewImage}
                        alt="Profile"
                      />
                      <motion.button
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        type="button"
                        onClick={handleEditClick}
                        className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      >
                        <i className="fas fa-camera text-white text-2xl" />
                      </motion.button>
                      <input
                        id="profile_picture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="text-center md:text-left">
                      <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Username</p>
                      <p className="text-xl font-semibold">{userDetails?.username || "N/A"}</p>
                      <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Plan: <span className="font-semibold">{userDetails?.plan || "N/A"}</span></p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Joined: <span className="font-semibold">{userDetails?.date_joined || "N/A"}</span></p>
                    </div>
                  </motion.div>

                  {/* Form Fields */}
                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
                  >
                    {[
                      { id: "first_name", label: "First Name", minLength: 4 },
                      { id: "last_name", label: "Last Name", minLength: 2 },
                      { id: "email", label: "Email", type: "email" },
                      { id: "username", label: "Username", minLength: 4 },
                    ].map((field) => (
                      <div key={field.id} className="relative">
                        <label
                          htmlFor={field.id}
                          className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {field.label}
                        </label>
                        <motion.input
                          id={field.id}
                          type={field.type || "text"}
                          whileFocus={{ scale: 1.02, borderColor: darkMode ? "#9CA3AF" : "#3B82F6" }}
                          className={`mt-1 w-full p-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                            darkMode
                              ? "bg-gray-700 text-white border-gray-600 focus:ring-gray-500"
                              : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-blue-500"
                          }`}
                          {...register(field.id, {
                            required: `${field.label} is required`,
                            minLength: field.minLength && {
                              value: field.minLength,
                              message: `${field.label} must be at least ${field.minLength} characters`,
                            },
                            pattern: field.id === "email" && {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Please enter a valid email address",
                            },
                            validate: {
                              noSpaces: (value) => value.trim() !== "" || `${field.label} cannot be only spaces`,
                            },
                          })}
                        />
                        <AnimatePresence>
                          {errors[field.id] && (
                            <motion.span
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute -bottom-6 left-0 text-red-500 text-xs"
                            >
                              {errors[field.id].message}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <ResetPassword />
                      <AddAccountButton />
                    </div>
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      type="submit"
                      className={`w-full sm:w-auto px-8 py-3 rounded-lg text-lg font-semibold shadow-lg transition-colors duration-300 ${
                        darkMode
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-[#2D5F8B] hover:bg-[#3A7CA8] text-white"
                      }`}
                    >
                      Save Changes
                    </motion.button>
                  </motion.div>
                </form>
              </div>

              {/* Account Table */}
              <motion.div variants={itemVariants} className="mt-8">
                <AccountTable />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
}

export default EditProfile;