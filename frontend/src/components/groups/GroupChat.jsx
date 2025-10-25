import React, { useState, useRef, useEffect } from "react";
import "../../Chat.css";



export default function GroupChat({ group, onClose }) {
  const [messages, setMessages] = useState([
    { text: `Welcome to ${group.name} group chat!`, type: "received" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const sendMessage = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { text: input, type: "sent" }]);
    setInput("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="chat-container relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
        >
          ✕
        </button>

        <div className="chat-header">
          💬 {group.name} - Group Chat
        </div>

        <div className="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        <div className="chat-footer">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>➤</button>
        </div>
      </div>
    </div>
  );
}
