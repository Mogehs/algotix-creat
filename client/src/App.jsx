import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import socket from "./socket";

const App = () => {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

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
      socket.off("chatMessage");
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
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl h-[552px] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-8 py-4 border-b border-gray-200 bg-sky-100">
          <h2 className="text-2xl font-semibold text-gray-800">Group Chat</h2>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4 bg-white">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 italic">No messages yet</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <p className="text-gray-900 font-medium text-sm">
                    {msg.userName}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {new Date(msg.timeStamp).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
                <p className="text-gray-700 text-sm mt-1">{msg.messageBody}</p>
              </div>
            ))
          )}
        </div>

        <div className="px-8 py-4 border-t border-gray-200 bg-sky-100">
          <div className="flex items-center gap-4">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
            <button
              onClick={sendMessage}
              className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
