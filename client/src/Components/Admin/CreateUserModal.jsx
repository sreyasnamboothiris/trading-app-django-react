import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../interceptors';
import { useSelector } from 'react-redux';

function CreateUserModal() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const isAuth = useSelector((state)=>state.auth.isAuth)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = (data) => {
    // Validate for spaces-only inputs
    if (
      !data.firstName.trim() ||
      !data.lastName.trim() ||
      !data.username.trim() ||
      !data.email.trim() ||
      !data.password.trim()
    ) {
      toast.error('Fields cannot contain only spaces');
      return;
    }

    setLoading(true);

    api
      .post('mp-admin/user/create/', data,
        {
            headers: {
              Authorization: `Bearer ${isAuth.access}`,
            },
          }
      )
      .then((response) => {
        toast.success('User successfully created');
        reset(); // Reset the form fields
        setShowModal(false); // Close the modal
      })
      .catch((error) => {
        toast.error('Error creating user');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className='bg-[#2D5F8B] rounded-lg flex justify-center'>
      {/* Button to show the modal */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="bg-[#2D5F8B] text-white p-1 text-lg font-bold rounded-lg px-4 py-2"
      >
        Create User
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-[#2D5F8B] border-black border-4 rounded-xl w-96 md:w-[600px]">
            <div className="bg-[#002F42] w-full p-2 flex justify-center">
              <h2 className="text-4xl font-semibold mb-4">Create User</h2>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-2 flex grid grid-cols-2 gap-4"
            >
              {/* First Name */}
              <div className="">
                <label className="block text-black text-sm font-semibold">
                  First Name
                </label>
                <input
                  type="text"
                  className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md placeholder-gray-700"
                  placeholder="First Name"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must have at least 2 characters',
                    },
                  })}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="">
                <label className="block text-black text-sm font-semibold">
                  Last Name
                </label>
                <input
                  type="text"
                  className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md placeholder-gray-700"
                  placeholder="Last Name"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 1,
                      message: 'Last name must have at least 1 character',
                    },
                  })}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="">
                <label className="block text-black text-sm font-semibold">
                  Username
                </label>
                <input
                  type="text"
                  className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md placeholder-gray-700"
                  placeholder="Username"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 2,
                      message: 'Username must have at least 2 characters',
                    },
                  })}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="">
                <label className="block text-black text-sm font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md placeholder-gray-700"
                  placeholder="Email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: 'Enter a valid email',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="">
                <label className="block text-black text-sm font-semibold">
                  Password
                </label>
                <input
                  type="password"
                  className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md placeholder-gray-700"
                  placeholder="Password"
                  {...register('password', {
                    required: 'Password is required',
                    pattern: {
                      value:
                        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                      message:
                        'Password must contain 6 characters, an uppercase letter, a number, and a special character',
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Image (Optional) */}
              <div className="w-1/2">
                <label className="block text-black text-sm font-semibold">
                  Image (Optional)
                </label>
                <input
                  type="file"
                  className="bg-gray-400 text-black w-full p-2 mt-1 border border-gray-300 rounded-md"
                  {...register('image')}
                  onChange={handleImageChange}
                />
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="col-span-2 flex justify-center mt-2">
                  <img
                    src={imagePreview}
                    alt="Selected Preview"
                    className="w-32 h-32 object-cover rounded-md border border-gray-300"
                  />
                </div>
              )}

              {/* Is Staff */}
              <div className="w-full col-span-2 flex items-center gap-2">
                <input
                    type="checkbox"
                    className="w-6 h-6"
                    {...register('is_staff')}
                />
                <label className="text-black text-sm font-semibold">
                    Admin Privileges
                </label>
                <p className="text-sm text-gray-500 ml-2">
                    Grant admin privileges to the user.
                </p>
                </div>

              {/* Submit and Cancel */}
              <div className="flex justify-between gap-4 w-full mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    reset();
                  }}
                  className="bg-red-500 text-lg font-bold text-white rounded-lg px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="text-lg font-bold bg-[#002F42] text-white rounded-lg px-4 py-2"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateUserModal;

