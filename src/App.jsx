import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [displayMessages, setDisplayMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const register = async () => {
    try {
      const response = await axios.post("http://localhost:5000/register", { username, password });
      alert(response.data.message);
    } catch (error) {
      alert("Error registering user");
    }
  };

  const login = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", { username, password });
      if (response.data.message === "Login successful") {
        setIsLoggedIn(true);
        socket.emit("user_connected", username);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert("Error logging in");
    }
  };

  const sendMessage = () => {
    socket.emit("send_message", { message, username });
    setMessage("");
  };

  useEffect(() => {
    socket.on("received_message", (data) => {
      setDisplayMessages((prevMessages) => [...prevMessages, `${data.username}: ${data.message}`]);
    });

    socket.on("update_user_list", (users) => {
      setUsers(users);
    });

    return () => {
      socket.off("received_message");
      socket.off("update_user_list");
    };
  }, []);

  if (!isLoggedIn) {
    return (
      <div>
        <h1>Register or Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={register}>Register</button>
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Chat Application</h1>
      <h2>Online Users:</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Enter your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
      <div>
        {displayMessages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
};

export default App;
