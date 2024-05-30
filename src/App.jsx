import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to your backend server

const App = () => {
  const [message, setMessage] = useState("");
  const [displayMessae , setDisplayMessage] = useState("")
  const sendMessage = () => {
    socket.emit("send_message", { message: message });
  };

  // recived message

  useEffect(() => {
    socket.on("recived_message", (data) => {
      console.log(data);
      setDisplayMessage(data.message, ...displayMessae);
    },[]);
  });

  return (
    <div>
      <h1>Chat Application</h1>

      <input
        type="text"
        placeholder="Enter your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={() => sendMessage()}>Send</button>

      <h1>{displayMessae}</h1>
    </div>
  );
};

export default App;
