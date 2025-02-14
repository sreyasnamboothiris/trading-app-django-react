import React, { useState } from "react";
import OrderModal from "./OrderModal";
import { useEffect } from "react";
import io from "socket.io-client";


const socket = io("http://localhost:5000"); 
function Test() {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("userList", (userList) => {
      setUsers(userList);
    });
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, []);

  const sendMessage = () => {
    if (reply && selectedUser) {
      const messageData = {
        sender: "admin",
        receiver: selectedUser,
        text: reply,
      };
      socket.emit("message", messageData);
      setMessages([...messages, messageData]);
      setReply("");
    }
  };

  return (
    <div className="p-4 bg-[#DED7F8] min-h-screen">
      <div className="w-1/4 p-4 bg-gray-100 border-r">
        <h2 className="text-lg font-semibold">Users</h2>
        <ul>
          {users.map((user) => (
            <li
              key={user}
              className={`p-2 cursor-pointer ${
                selectedUser === user ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              {user}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex flex-col p-4">
        <h2 className="text-xl font-bold">Chat with {selectedUser || "-"}</h2>
        <div className="flex-1 overflow-y-auto border p-4">
          {messages
            .filter((msg) => msg.receiver === "admin" || msg.sender === "admin")
            .map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded ${
                  msg.sender === "admin" ? "bg-blue-200 ml-auto" : "bg-gray-200"
                }`}
              >
                <b>{msg.sender}:</b> {msg.text}
              </div>
            ))}
        </div>
        <div className="flex gap-2 p-2">
          <input
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Test;