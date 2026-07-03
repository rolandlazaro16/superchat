"use client";

import React, { useEffect, useState } from "react";
import { ChatState } from "@/context/ChatProvider";
import axios from "axios";
import io, { Socket } from "socket.io-client";
import { Video, Phone, Search, MoreVertical, Plus, Smile, Mic, Send, MessageSquarePlus, CheckCheck, Users, UserX, MessageCircle, UserPlus } from "lucide-react";

const ENDPOINT = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
let socket: Socket;

export default function ChatPage() {
  const { user, chats, setChats, selectedChat, setSelectedChat } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  // New User Registration Modal States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const handleRegisterNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    setRegisterLoading(true);

    if (!newUserName || !newUserEmail || !newUserPassword) {
      setRegisterError("Please fill all the fields");
      setRegisterLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user?.token}`, 
        },
      };

      const { data } = await axios.post(
        `${ENDPOINT}/api/auth/register`,
        { name: newUserName, email: newUserEmail, password: newUserPassword },
        config
      );

      setRegisterSuccess("User registered successfully!");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      
      fetchAllUsers();
      
      setTimeout(() => {
        setIsRegisterModalOpen(false);
        setRegisterSuccess("");
      }, 2000);

    } catch (err: any) {
      setRegisterError(err.response?.data?.message || "An error occurred.");
    } finally {
      setRegisterLoading(false);
    }
  };

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

  const fetchAllUsers = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };
      const { data } = await axios.get(`${ENDPOINT}/api/user`, config);
      setAllUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };
      const { data } = await axios.get(`${ENDPOINT}/api/user?search=${query}`, config);
      setSearchResult(data);
    } catch (error) {
      console.error(error);
    }
  };

  const accessChat = async (userId: string) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.post(`${ENDPOINT}/api/chat`, { userId }, config);
      
      if (!chats.find((c: any) => c._id === data._id)) setChats([data, ...chats]);
      
      setSelectedChat(data);
      setLoadingChat(false);
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      console.error(error);
      setLoadingChat(false);
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
      fetchAllUsers();
    }
  }, [user, fetchAgain]);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* Sidebar - Chat List */}
      <div
        style={{
          width: "350px",
          flexShrink: 0,
          borderRight: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          background: "rgba(15, 23, 42, 0.95)",
          overflow: "hidden",
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--text-light)" }}>Chats</h2>
          <div style={{ display: "flex", gap: "15px", color: "var(--text-light)", alignItems: "center" }}>
            {user?.isAdmin && (
              <UserPlus size={22} style={{ cursor: "pointer", transition: "color 0.2s" }} className="hover:text-white" onClick={() => setIsRegisterModalOpen(true)} />
            )}
            <MessageSquarePlus size={22} style={{ cursor: "pointer", transition: "color 0.2s" }} className="hover:text-white" />
            <MoreVertical size={22} style={{ cursor: "pointer", transition: "color 0.2s" }} className="hover:text-white" />
          </div>
        </div>
        
        {/* Search Bar */}
        <div style={{ padding: "0 15px 10px 15px" }}>
          <div style={{ background: "rgba(30, 41, 59, 0.7)", borderRadius: "8px", display: "flex", alignItems: "center", padding: "8px 15px", gap: "10px" }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search or start a new chat" 
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontSize: "0.95rem" }} 
            />
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: "0 15px 10px 15px", display: "flex", gap: "10px", borderBottom: "1px solid var(--border-color)" }}>
          <span style={{ padding: "6px 16px", borderRadius: "15px", background: "rgba(30, 41, 59, 0.8)", color: "white", fontSize: "0.85rem", cursor: "pointer" }}>All</span>
          <span style={{ padding: "6px 16px", borderRadius: "15px", background: "rgba(30, 41, 59, 0.4)", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer" }}>Unread</span>
          <span style={{ padding: "6px 16px", borderRadius: "15px", background: "rgba(30, 41, 59, 0.4)", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer" }}>Favorites</span>
        </div>
        
        {/* Chats List or Search Results */}
        <div style={{ flex: 1, overflowY: "auto", padding: "5px 0", minHeight: 0 }}>
          {search ? (
            searchResult.length > 0 ? (
              searchResult.map((u) => (
                <div
                  onClick={() => accessChat(u._id)}
                  key={u._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 15px",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    gap: "15px"
                  }}
                  className="hover:bg-slate-800/50"
                >
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.2rem", flexShrink: 0 }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px" }}>
                    <div style={{ fontWeight: 500, color: "white", fontSize: "1.05rem", marginBottom: "3px" }}>{u.name}</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{u.email}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", marginTop: "3rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "15px", background: "rgba(30, 41, 59, 0.5)", borderRadius: "50%" }}>
                  <Search size={32} color="var(--text-muted)" />
                </div>
                <p>No users found for "{search}"</p>
              </div>
            )
          ) : (
            <>
              {/* Existing Chats */}
              {chats && chats.length > 0 && chats.map((chat) => (
              <div
                onClick={() => setSelectedChat(chat)}
                key={chat._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 15px",
                  cursor: "pointer",
                  background: selectedChat?._id === chat._id ? "rgba(30, 41, 59, 0.7)" : "transparent",
                  transition: "background 0.2s ease",
                  gap: "15px"
                }}
                className="hover:bg-slate-800/50"
              >
                {/* Avatar */}
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.2rem", flexShrink: 0 }}>
                  {(!chat.isGroupChat ? chat.users.find((u: any) => u._id !== user?._id)?.name : chat.chatName).charAt(0).toUpperCase()}
                </div>
                
                {/* Chat Info */}
                <div style={{ flex: 1, overflow: "hidden", borderBottom: selectedChat?._id === chat._id ? "none" : "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                    <div style={{ fontWeight: 500, color: "white", fontSize: "1.05rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {!chat.isGroupChat
                        ? chat.users.find((u: any) => u._id !== user?._id)?.name
                        : chat.chatName}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: 0 }}>
                      Yesterday
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    {chat.latestMessage ? (
                      <>
                        <CheckCheck size={16} color="#34B7F1" />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {chat.latestMessage.content}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontStyle: "italic", display: "flex", alignItems: "center", gap: "5px" }}><MessageCircle size={14} /> No messages yet</span>
                    )}
                  </div>
                </div>
              </div>
              ))}
              
              {/* All Users / Contacts */}
              <div style={{ padding: "10px 15px", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={16} /> Contacts / Start a new chat
              </div>
              {allUsers.length > 0 ? allUsers.map((u) => (
                <div
                  onClick={() => accessChat(u._id)}
                  key={u._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 15px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    gap: "15px",
                    borderRadius: "8px",
                    margin: "0 10px 5px 10px"
                  }}
                  className="hover:bg-slate-800 hover:scale-[1.02]"
                >
                  <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary-color), #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.2rem", flexShrink: 0, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden", paddingBottom: "5px" }}>
                    <div style={{ fontWeight: 600, color: "white", fontSize: "1.05rem", marginBottom: "2px" }}>{u.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}><UserPlus size={14} /> {u.email}</div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: "center", marginTop: "1rem", marginBottom: "3rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div style={{ padding: "15px", background: "rgba(30, 41, 59, 0.5)", borderRadius: "50%" }}>
                    <UserX size={32} color="var(--text-muted)" />
                  </div>
                  <p>No other users registered yet.</p>
                </div>
              )}
            </>
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
      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-panel" style={{ width: "90%", maxWidth: "400px", padding: "2rem", borderRadius: "16px", position: "relative" }}>
            <button onClick={() => setIsRegisterModalOpen(false)} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", color: "white", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
            <h2 style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Register New User</h2>
            
            {registerError && <div style={{ color: "#ff4d4f", marginBottom: "1rem", textAlign: "center" }}>{registerError}</div>}
            {registerSuccess && <div style={{ color: "#4ade80", marginBottom: "1rem", textAlign: "center" }}>{registerSuccess}</div>}

            <form onSubmit={handleRegisterNewUser} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-light)" }}>Name</label>
                <input type="text" className="input-field" placeholder="User's Name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-light)" }}>Email</label>
                <input type="email" className="input-field" placeholder="User's Email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-light)" }}>Password</label>
                <input type="password" className="input-field" placeholder="Temporary Password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }} disabled={registerLoading}>
                {registerLoading ? "Registering..." : "Register User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
