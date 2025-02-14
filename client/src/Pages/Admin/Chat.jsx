import React, { useState, useEffect } from "react";
import Header from "../../Components/Admin/Header";
import SideMenu from "../../Components/Admin/SideMenu";
import ChatComponent from "../../Components/Admin/ChatComponent";
import { motion } from "framer-motion"; // Animation

function Chat() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000); // Simulate loading delay
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#002F42] text-white">
      {/* Header */}
      <div className="bg-[#2D5F8B] shadow-md">
        <Header />
      </div>

      {/* Main Content */}
      <div className="flex flex-row flex-1">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 bg-black p-4"
        >
          <SideMenu />
        </motion.div>

        {/* Chat Section */}
        <div className="flex-1 flex">
          {/* User List (Left Side) */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-72 bg-[#2D5F8B] p-4 border-r border-white"
          >
            <h2 className="text-lg font-bold mb-4">Users</h2>
            <ul>
              {["User 1", "User 2", "User 3"].map((user, index) => (
                <li
                  key={index}
                  className="p-2 rounded-md cursor-pointer hover:bg-white hover:text-[#002F42] transition duration-300"
                >
                  {user}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Chat Section */}
          <div className="flex-1 p-4">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                className="text-center text-xl font-semibold"
              >
                Loading Chat...
              </motion.div>
            ) : (
              <ChatComponent />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
