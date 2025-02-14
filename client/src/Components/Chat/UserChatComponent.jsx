import React from "react";
import { motion } from "framer-motion";

function UserChatComponent() {
  return (
    <div className="flex flex-col h-[80vh] bg-white shadow-lg rounded-lg p-4">
      {/* Chat Header */}
      <div className="bg-[#2D5F8B] text-white p-3 rounded-t-lg text-center font-semibold">
        Chat Room
      </div>

      {/* Messages Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-100"
      >
        {/* Example Messages */}
        <div className="flex justify-start">
          <div className="bg-gray-300 text-black px-4 py-2 rounded-lg max-w-xs">
            Hello! How are you?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-[#2D5F8B] text-white px-4 py-2 rounded-lg max-w-xs">
            I'm good, thank you!
          </div>
        </div>
      </motion.div>

      {/* Input Field */}
      <div className="p-3 border-t flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D5F8B]"
        />
        <button className="bg-[#2D5F8B] text-white px-4 py-2 rounded-md hover:bg-[#1A3A4D] transition">
          Send
        </button>
      </div>
    </div>
  );
}

export default UserChatComponent;
