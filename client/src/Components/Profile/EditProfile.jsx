import React, { useState } from 'react';
import Header from '../Header/Header';
import defaultImage from '../../assets/Profle/7.png';

function EditProfile() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Handle the image change
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle edit state (to show/hide input)
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  // Trigger file input when edit icon is clicked
  const handleEditClick = () => {
    document.getElementById('imageInput').click();
  };

  return (
    <div className='mt-1 bg-[#D9D9D9]'>
      <Header />
      <div className='p-1 md:p-3 bg-[#DED7F8]'>
        <div className='p-2 md:p-8 md:px-24 border-2 border-gray-500 rounded-md'>
          <div>
            <div className="text-xl md:text-4xl text-black font-bold">
              <h1>Edit Profile</h1>
            </div>
            <div className="relative">
              {/* Profile image */}
              <img
                className="rounded-[50%] object-cover w-24 h-24"
                src={selectedImage || defaultImage}
                alt="Profile"
              />
              
              {/* Edit button inside the image */}
              <button
                className="absolute"
                onClick={handleEditClick} // Trigger file input when clicked
              >
                <i class="fa-solid fa-pen-to-square"></i>
              </button>

              {/* Hidden file input */}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;

