"use client";

import React, { useEffect, useState } from "react";
import { ChatState } from "@/context/ChatProvider";
import axios from "axios";
import io, { Socket } from "socket.io-client";
import { Video, Phone, Search, MoreVertical, Plus, Smile, Mic, Send } from "lucide-react";

const ENDPOINT = "https://superchat-yzyw.onrender.com";
let socket: Socket;

export default function ChatPage() {
  const { user, chats, setChats, selectedChat, setSelectedChat } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  const fetchChats = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };
      const { data } = await axios.get(`${ENDPOINT}/api/chat`, config);
      setChats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };
      const { data } = await axios.get(
        `${ENDPOINT}/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (newMessage) {
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          `${ENDPOINT}/api/message`,
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
        setFetchAgain(!fetchAgain);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    if (socket) {
      socket.on("message received", (newMessageReceived: any) => {
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
          // You could notify the user here
        } else {
          setMessages([...messages, newMessageReceived]);
        }
      });
    }
  });

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
                  background: selectedChat?._id === chat._id ? "var(--primary-color)" : "rgba(30, 41, 59, 0.5)",
                  color: selectedChat?._id === chat._id ? "white" : "var(--text-light)",
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
            <div className="glass-panel" style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", background: "rgba(15, 23, 42, 0.95)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.2rem" }}>
                  {(!selectedChat.isGroupChat ? selectedChat.users.find((u: any) => u._id !== user?._id)?.name : selectedChat.chatName).charAt(0).toUpperCase()}
                </div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "600" }}>
                  {!selectedChat.isGroupChat
                    ? selectedChat.users.find((u: any) => u._id !== user?._id)?.name
                    : selectedChat.chatName}
                </h2>
              </div>
              <div style={{ display: "flex", gap: "20px", color: "var(--text-light)", alignItems: "center" }}>
                <Video size={22} style={{ cursor: "pointer", transition: "color 0.2s" }} className="hover:text-white" />
                <Phone size={20} style={{ cursor: "pointer", transition: "color 0.2s" }} className="hover:text-white" />
                <div style={{ width: "1px", height: "20px", background: "var(--border-color)", margin: "0 5px" }}></div>
                <Search size={20} style={{ cursor: "pointer", transition: "color 0.2s" }} className="hover:text-white" />
                <MoreVertical size={20} style={{ cursor: "pointer", transition: "color 0.2s" }} className="hover:text-white" />
              </div>
            </div>
            
            <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: "contain", backgroundBlendMode: "overlay", backgroundColor: "rgba(15, 23, 42, 0.9)" }}>
              {messages.length > 0 ? (
                messages.map((m: any, i: number) => (
                  <div
                    key={m._id || i}
                    style={{
                      alignSelf: m.sender._id === user?._id ? "flex-end" : "flex-start",
                      background: m.sender._id === user?._id ? "var(--primary-color)" : "rgba(30, 41, 59, 0.7)",
                      color: "white",
                      padding: "8px 15px",
                      borderRadius: "15px",
                      maxWidth: "70%",
                      wordBreak: "break-word"
                    }}
                  >
                    {m.content}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", marginTop: "auto", marginBottom: "auto", color: "var(--text-muted)" }}>
                  Start chatting!
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: "15px 1.5rem", display: "flex", gap: "15px", alignItems: "center", background: "rgba(15, 23, 42, 0.95)" }}>
              <div style={{ display: "flex", gap: "15px", color: "var(--text-light)" }}>
                <Smile size={24} style={{ cursor: "pointer", transition: "color 0.2s" }} className="hover:text-white" />
                <Plus size={26} style={{ cursor: "pointer", transition: "color 0.2s" }} className="hover:text-white" />
              </div>
              <input
                type="text"
                className="input-field"
                style={{ flex: 1, borderRadius: "20px", padding: "12px 20px", border: "none", background: "rgba(30, 41, 59, 0.7)", outline: "none", color: "white" }}
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
              {newMessage.trim() ? (
                <div onClick={sendMessage} style={{ background: "var(--primary-color)", borderRadius: "50%", width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
                  <Send size={20} color="white" style={{ marginLeft: "-2px" }} />
                </div>
              ) : (
                <Mic size={24} style={{ cursor: "pointer", color: "var(--text-light)", transition: "color 0.2s", margin: "0 10px" }} className="hover:text-white" />
              )}
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
