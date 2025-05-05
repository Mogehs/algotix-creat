import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import socket from "./socket";

const App = () => {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Load user data from localStorage or prompt for new info
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedId = localStorage.getItem("userId");

    if (storedName && storedId) {
      setUserName(storedName);
      setUserId(storedId);
    } else {
      const name = prompt("Enter your name");
      const id = uuid();
      localStorage.setItem("userName", name);
      localStorage.setItem("userId", id);
      setUserName(name);
      setUserId(id);
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data));

    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chatMessage"); // ✅ don't disconnect, just clean up listener
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;

    const msg = {
      userId,
      userName,
      messageBody: text,
      timeStamp: new Date(),
    };

    socket.emit("chatMessage", msg);
    setText("");
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Group Chat</h2>
      <button onClick={logout}>Logout</button>
      <div
        style={{ height: 300, overflowY: "scroll", border: "1px solid #ccc" }}
      >
        {messages.map((msg, idx) => (
          <p key={idx}>
            <strong>{msg.userName}</strong>: {msg.messageBody}
          </p>
        ))}
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default App;
