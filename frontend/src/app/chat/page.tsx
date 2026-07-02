"use client";

import React, { useEffect, useState } from "react";
import { ChatState } from "@/context/ChatProvider";
import axios from "axios";

export default function ChatPage() {
  const { user, chats, setChats, selectedChat, setSelectedChat } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.get("http://localhost:5000/api/chat", config);
      setChats(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchAgain]);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* Sidebar - Chat List */}
      <div
        className="glass-panel"
        style={{
          width: "30%",
          minWidth: "300px",
          borderRight: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>My Chats</h2>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          {chats ? (
            chats.map((chat) => (
              <div
                onClick={() => setSelectedChat(chat)}
                key={chat._id}
                style={{
                  padding: "1rem",
                  marginBottom: "0.5rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: selectedChat === chat ? "var(--primary-color)" : "rgba(30, 41, 59, 0.5)",
                  color: selectedChat === chat ? "white" : "var(--text-light)",
                  transition: "background 0.3s ease",
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {!chat.isGroupChat
                    ? chat.users.find((u: any) => u._id !== user?._id)?.name
                    : chat.chatName}
                </div>
                {chat.latestMessage && (
                  <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    <b>{chat.latestMessage.sender.name}: </b>
                    {chat.latestMessage.content}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</div>
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedChat ? (
          <>
            <div className="glass-panel" style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.5rem" }}>
                {!selectedChat.isGroupChat
                  ? selectedChat.users.find((u: any) => u._id !== user?._id)?.name
                  : selectedChat.chatName.toUpperCase()}
              </h2>
            </div>
            
            <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {/* Messages will render here */}
              <div style={{ textAlign: "center", marginTop: "auto", marginBottom: "auto", color: "var(--text-muted)" }}>
                Start chatting!
              </div>
            </div>

            <div className="glass-panel" style={{ padding: "1rem" }}>
              <input
                type="text"
                className="input-field"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newMessage) {
                    // Send message logic
                  }
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-center" style={{ flex: 1, height: "100%", fontSize: "1.5rem", color: "var(--text-muted)" }}>
            Click on a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
