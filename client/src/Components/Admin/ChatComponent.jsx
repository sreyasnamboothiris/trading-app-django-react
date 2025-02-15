// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion"; // For animations

// function ChatComponent({ selectedUser }) {
//   const [messages, setMessages] = useState([]);
//   const [reply, setReply] = useState("");
//   let socket; // Declare socket here so we can access it throughout the component

//   useEffect(() => {
//     // Open a WebSocket connection
//     socket = new WebSocket("ws://localhost:8000/ws/chat/");

//     // Listen for incoming messages
//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data); // Assuming the server sends JSON data
//       setMessages((prev) => [...prev, data]);
//     };

//     // Clean up the WebSocket connection when the component is unmounted
//     return () => {
//       socket.close();
//     };
//   }, []); // This effect runs only once after the component mounts

//   useEffect(() => {
//     // If a new user is selected, clear the existing chat messages
//     setMessages([]);
//   }, [selectedUser]);

//   const sendMessage = () => {
//     if (reply && selectedUser) {
//       const messageData = {
//         sender: "admin",
//         receiver: selectedUser,
//         text: reply,
//       };

//       // Send the message to the WebSocket server
//       socket.send(JSON.stringify(messageData)); // Ensure data is sent as a string
//       setMessages((prevMessages) => [...prevMessages, messageData]); // Update local messages
//       setReply(""); // Clear the input field
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-[#002F42] text-white p-4">
//       <div className="flex-1 flex flex-col">
//         <h2 className="text-xl font-bold mb-2">
//           Chat with {selectedUser || "-"}
//         </h2>

//         {/* Messages Container */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.8 }}
//           className="flex-1 overflow-y-auto border border-gray-300 p-4 bg-[#1A3A4D] rounded-lg"
//           style={{ maxHeight: "70vh" }}
//         >
//           {messages
//             .filter((msg) => msg.receiver === "admin" || msg.sender === "admin")
//             .map((msg, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className={`mb-2 p-2 rounded-md max-w-xs ${
//                   msg.sender === "admin"
//                     ? "bg-[#2D5F8B] ml-auto text-white"
//                     : "bg-white text-[#002F42]"
//                 }`}
//               >
//                 <b>{msg.sender}:</b> {msg.text}
//               </motion.div>
//             ))}
//         </motion.div>

//         {/* Input Field */}
//         <div className="flex gap-2 p-2">
//           <input
//             type="text"
//             value={reply}
//             onChange={(e) => setReply(e.target.value)}
//             placeholder="Type a message..."
//             className="flex-1 p-2 border rounded text-black"
//           />
//           <button
//             onClick={sendMessage}
//             className="px-4 py-2 bg-[#2D5F8B] text-white rounded hover:bg-[#1A3A4D] transition"
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChatComponent;
