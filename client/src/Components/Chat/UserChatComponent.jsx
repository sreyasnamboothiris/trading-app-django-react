// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";

// // Dynamically build the WebSocket URL using the username prop
// function UserChatComponent({ username }) {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     // Establish WebSocket connection dynamically using the username
//     const ws = new WebSocket(`ws://localhost:8000/ws/chat/${username}/`);

//     ws.onopen = () => {
//       console.log("Connected to the chat");
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { sender: data.sender, text: data.message },
//       ]);
//     };

//     ws.onclose = () => {
//       console.log("Disconnected from chat");
//     };

//     setSocket(ws);

//     // Clean up the WebSocket connection when the component unmounts
//     return () => {
//       if (ws) {
//         ws.close();
//       }
//     };
//   }, [username]);

//   // Send a message to the server
//   const sendMessage = () => {
//     if (message.trim() && socket) {
//       const messageData = {
//         sender: username,
//         receiver: "admin", // assuming the admin is the receiver
//         message: message,
//       };
//       socket.send(JSON.stringify(messageData));
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { sender: messageData.sender, text: messageData.message },
//       ]);
//       setMessage("");
//     }
//   };

//   return (
//     <div className="flex flex-col h-[80vh] bg-white shadow-lg rounded-lg p-4">
//       {/* Chat Header */}
//       <div className="bg-[#2D5F8B] text-white p-3 rounded-t-lg text-center font-semibold">
//         Chat with Admin
//       </div>

//       {/* Messages Section */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-100"
//       >
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`flex ${
//               msg.sender === "admin" ? "justify-start" : "justify-end"
//             }`}
//           >
//             <div
//               className={`px-4 py-2 rounded-lg max-w-xs ${
//                 msg.sender === "admin"
//                   ? "bg-gray-300 text-black"
//                   : "bg-[#2D5F8B] text-white"
//               }`}
//             >
//               {msg.text}
//             </div>
//           </div>
//         ))}
//       </motion.div>

//       {/* Input Field */}
//       <div className="p-3 border-t flex gap-2">
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type a message..."
//           className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D5F8B]"
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-[#2D5F8B] text-white px-4 py-2 rounded-md hover:bg-[#1A3A4D] transition"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }

// export default UserChatComponent;

