import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [displayMessages, setDisplayMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const register = async () => {
    try {
      const response = await axios.post("http://localhost:5000/register", {
        username,
        password,
      });
      alert(response.data.message);
    } catch (error) {
      alert("Error registering user");
    }
  };

  const login = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
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

  const sendPrivateMessage = () => {
    socket.emit("send_private_message", { recipient, message });
    setDisplayMessages((prevMessages) => [
      ...prevMessages,
      `To ${recipient}: ${message}`,
    ]);
    setMessage("");
  };

  useEffect(() => {
    socket.on("received_private_message", (data) => {
      setDisplayMessages((prevMessages) => [
        ...prevMessages,
        `${data.sender}: ${data.message}`,
      ]);
    });

    socket.on("update_user_list", (users) => {
      setUsers(users);
    });

    return () => {
      socket.off("received_private_message");
      socket.off("update_user_list");
    };
  }, []);

  const isOnline = (user) => {
    return users.includes(user);
  };

  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="header">
          <h1>Register or Login</h1>
        </div>
        <div className="main">
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
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Chat Application</h1>
      </div>
      <div className="main">
        <h2>Online Users:</h2>
        <ul className="online-users">
          {users.map((user, index) => (
            <li
              key={index}
              onClick={() => setRecipient(user)}
              className={isOnline(user) ? "online" : "offline"}
            >
              {user}
            </li>
          ))}
        </ul>
        <h4>{recipient}</h4>
        <div className="chat-box">
          {displayMessages.map((msg, index) => (
            <p
              key={index}
              className={`message ${msg.startsWith("To") ? "to" : "from"}`}
            >
              {msg}
            </p>
          ))}
        </div>
        <input
          type="text"
          placeholder="Enter your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendPrivateMessage}>Send</button>
      </div>
      <div className="footer">
        <p>Logged in as: {username}</p>
      </div>
    </div>
  );
};

export default App;
