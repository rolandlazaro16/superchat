"use client";

import React, { useEffect, useState } from "react";
import { ChatState } from "@/context/ChatProvider";
import axios from "axios";
import io, { Socket } from "socket.io-client";
import { Video, Phone, Search, MoreVertical, Plus, Smile, Mic, Send, MessageSquarePlus, CheckCheck, Users, UserX, MessageCircle, UserPlus, ChevronDown, Archive, BellOff, Pin, Heart, List, Ban, MinusCircle, Trash2, Mail, LogOut, ArrowLeft, MessageSquare, Settings, Lock, PhoneIncoming, PhoneCall } from "lucide-react";
import { useRouter } from "next/navigation";

const ENDPOINT = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
let socket: Socket;

const formatTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ChatDropdownMenu = ({ 
  closeMenu,
  onPin,
  onClear,
  onDelete,
  onBlock,
  onHide,
  isPinned = false
}: { 
  closeMenu: () => void;
  onPin?: () => void;
  onClear?: () => void;
  onDelete?: () => void;
  onBlock?: () => void;
  onHide?: () => void;
  isPinned?: boolean;
}) => {
  return (
    <>
      <div 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
        onClick={(e) => { e.stopPropagation(); closeMenu(); }} 
      />
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', right: '30px', top: '40px', background: 'rgba(30, 41, 59, 1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 0', minWidth: '220px', zIndex: 100, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column' }}
      >
        {onPin && <div className="hover:bg-slate-700/80 transition-colors" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onPin(); closeMenu(); }}><Pin size={16} /> {isPinned ? "Unpin chat" : "Pin chat"}</div>}
        
        {onBlock && (
          <>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
            <div className="hover:bg-slate-700/80 transition-colors" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onBlock(); closeMenu(); }}><Ban size={16} /> Block User</div>
          </>
        )}
        
        {onClear && <div className="hover:bg-slate-700/80 transition-colors" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onClear(); closeMenu(); }}><MinusCircle size={16} /> Clear chat</div>}
        
        {onDelete && <div className="hover:bg-red-500/20 transition-colors" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', cursor: 'pointer', color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); onDelete(); closeMenu(); }}><Trash2 size={16} /> Delete chat</div>}
        
        {onHide && <div className="hover:bg-red-500/20 transition-colors" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', cursor: 'pointer', color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); onHide(); closeMenu(); }}><Trash2 size={16} /> Remove contact</div>}
      </div>
    </>
  );
};

export default function ChatPage() {
  const router = useRouter();
  const { user, setUser, chats, setChats, selectedChat, setSelectedChat } = ChatState();
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
  
  // Block User Modal States
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<any>(null);
  
  // Unblock User Modal States
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);
  const [userToUnblock, setUserToUnblock] = useState<any>(null);
  
  // Dropdown UI states
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("chats");
  const [callSearch, setCallSearch] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [readChatIds, setReadChatIds] = useState<string[]>([]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    router.push("/");
  };

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

  const handlePinChat = async (chatId: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.put(`${ENDPOINT}/api/chat/${chatId}/pin`, {}, config);
      if (user) {
        const updatedUser = { ...user, pinnedChats: data };
        setUser(updatedUser);
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      }
      setFetchAgain(!fetchAgain);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearChat = async (chatId: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.put(`${ENDPOINT}/api/chat/${chatId}/clear`, {}, config);
      if (user) {
        const updatedUser = { ...user, clearedChats: data };
        setUser(updatedUser);
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      }
      if (selectedChat?._id === chatId) {
        setMessages([]);
        setFetchAgain(!fetchAgain);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      
      // Optimistic update for immediate feedback
      setChats(chats.filter((c: any) => c._id !== chatId));
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
      }

      const { data } = await axios.put(`${ENDPOINT}/api/chat/${chatId}/delete`, {}, config);
      if (user) {
        const updatedUser = { ...user, deletedChats: data };
        setUser(updatedUser);
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      }
      setFetchAgain(!fetchAgain);
    } catch (error) {
      console.error(error);
      // Revert if error
      fetchChats();
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.put(`${ENDPOINT}/api/user/${userId}/block`, {}, config);
      if (user) {
        const updatedUser = { ...user, blockedUsers: data };
        setUser(updatedUser);
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const confirmBlockUser = (userObj: any) => {
    setUserToBlock(userObj);
    setIsBlockModalOpen(true);
  };

  const confirmUnblockUser = (userObj: any) => {
    setUserToUnblock(userObj);
    setIsUnblockModalOpen(true);
  };

  const handleHideContact = async (userId: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      
      // Optimistic update
      setAllUsers(allUsers.filter((u: any) => u._id !== userId));
      
      const { data } = await axios.put(`${ENDPOINT}/api/user/${userId}/hide`, {}, config);
      if (user) {
        const updatedUser = { ...user, hiddenContacts: data };
        setUser(updatedUser);
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error(error);
      fetchAllUsers(); // Revert on error
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
    <>
      <style>{`
        @media (max-width: 768px) {
          .mini-nav { display: ${selectedChat ? 'none' : 'flex'} !important; }
          .sidebar-container { display: ${selectedChat ? 'none' : 'flex'} !important; flex: 1 !important; width: auto !important; }
          .main-chat-container { display: ${selectedChat ? 'flex' : 'none'} !important; width: 100% !important; }
          .mobile-back-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-back-btn { display: none !important; }
        }
      `}</style>

      {/* Calculate unread chats */}
      {(() => {
        const unreadChatsCount = chats.filter(chat => {
          if (readChatIds.includes(chat._id) || selectedChat?._id === chat._id) return false;
          return chat.unreadCount > 0 || (chat.latestMessage && chat.latestMessage.sender._id !== user?._id);
        }).length;
        
        return (
          <div style={{ display: "flex", height: "100vh", width: "100%" }}>
        {/* Mini Navigation Bar */}
        <div 
          className="mini-nav"
          style={{ 
            width: "60px", 
            flexShrink: 0, 
            background: "rgba(10, 15, 30, 0.95)",
            borderRight: "1px solid var(--border-color)", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            padding: "15px 0",
            zIndex: 10
          }}
        >
          {/* Top Icons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "25px", flex: 1, alignItems: "center" }}>
            <div 
              onClick={() => setActiveTab("chats")}
              style={{ position: "relative", padding: "8px", borderRadius: "50%", background: activeTab === "chats" ? "rgba(255,255,255,0.1)" : "transparent", cursor: "pointer" }} 
              className="hover:bg-white/10 transition-colors"
            >
              <MessageSquare size={22} color={activeTab === "chats" ? "var(--text-light)" : "var(--text-muted)"} />
              {unreadChatsCount > 0 && (
                <div style={{ position: "absolute", top: "0px", right: "-2px", background: "#22c55e", color: "white", borderRadius: "50%", minWidth: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold", border: "2px solid rgba(10, 15, 30, 0.95)" }}>
                  {unreadChatsCount}
                </div>
              )}
            </div>
            <div 
              onClick={() => setActiveTab("calls")}
              style={{ padding: "8px", borderRadius: "50%", background: activeTab === "calls" ? "rgba(255,255,255,0.1)" : "transparent", cursor: "pointer" }} 
              className="hover:bg-white/10 transition-colors"
            >
              <Phone size={22} color={activeTab === "calls" ? "var(--text-light)" : "var(--text-muted)"} />
            </div>
            <div 
              onClick={() => setActiveTab("communities")}
              style={{ padding: "8px", borderRadius: "50%", background: activeTab === "communities" ? "rgba(255,255,255,0.1)" : "transparent", cursor: "pointer" }} 
              className="hover:bg-white/10 transition-colors"
            >
              <Users size={22} color={activeTab === "communities" ? "var(--text-light)" : "var(--text-muted)"} />
            </div>
          </div>
          
          {/* Bottom Icons (Settings & Profile) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
            <div style={{ padding: "8px", borderRadius: "50%", cursor: "pointer" }} className="hover:bg-white/5 transition-colors">
              <Settings size={22} color="var(--text-muted)" />
            </div>
            {/* Profile Icon */}
            <div style={{ position: "relative" }}>
              {user?.profilePic ? (
                <img 
                  src={user.profilePic} 
                  alt="profile" 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", cursor: "pointer", border: "2px solid rgba(255,255,255,0.1)" }} 
                />
              ) : (
                <div 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.1rem", cursor: "pointer", border: "2px solid rgba(255,255,255,0.1)" }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}

              {isProfileMenuOpen && (
                <>
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
                    onClick={() => setIsProfileMenuOpen(false)} 
                  />
                  <div 
                    style={{ position: 'absolute', left: '45px', bottom: '0px', background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', padding: '10px 0', minWidth: '160px', zIndex: 100, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column' }}
                  >
                    <div 
                      className="hover:bg-gray-100 transition-colors" 
                      style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', color: '#e11d48' }} 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleLogout(); 
                        setIsProfileMenuOpen(false); 
                      }}
                    >
                      <LogOut size={20} /> Log out
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Chat List */}
        <div
          className="sidebar-container"
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
        {activeTab === "chats" ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Sidebar Header */}
        <div style={{ padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--text-light)" }}>Chats</h2>
          <div style={{ display: "flex", gap: "15px", color: "var(--text-light)", alignItems: "center" }}>
            {user?.isAdmin && (
              <UserPlus size={22} style={{ cursor: "pointer", transition: "color 0.2s" }} className="hover:text-white" onClick={() => setIsRegisterModalOpen(true)} />
            )}
            <div style={{ position: "relative" }}>
              <MoreVertical 
                size={22} 
                style={{ cursor: "pointer", transition: "color 0.2s" }} 
                className="hover:text-white" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHeaderMenuOpen(!isHeaderMenuOpen);
                }}
              />
              {isHeaderMenuOpen && (
                <>
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
                    onClick={() => setIsHeaderMenuOpen(false)} 
                  />
                  <div 
                    style={{ position: 'absolute', right: 0, top: '30px', background: 'rgba(30, 41, 59, 1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 0', minWidth: '160px', zIndex: 100, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column' }}
                  >
                    <div 
                      className="hover:bg-slate-700/80 transition-colors" 
                      style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', cursor: 'pointer', color: '#ef4444' }} 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleLogout(); 
                        setIsHeaderMenuOpen(false); 
                      }}
                    >
                      <LogOut size={16} /> Logout
                    </div>
                  </div>
                </>
              )}
            </div>
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
          <span 
            onClick={() => setShowUnreadOnly(false)}
            style={{ padding: "6px 16px", borderRadius: "15px", background: !showUnreadOnly ? "rgba(30, 41, 59, 0.8)" : "rgba(30, 41, 59, 0.4)", color: !showUnreadOnly ? "white" : "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}
          >
            All
          </span>
          <span 
            onClick={() => setShowUnreadOnly(true)}
            style={{ padding: "6px 16px", borderRadius: "15px", background: showUnreadOnly ? "rgba(30, 41, 59, 0.8)" : "rgba(30, 41, 59, 0.4)", color: showUnreadOnly ? "white" : "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}
          >
            Unread
          </span>
          <span style={{ padding: "6px 16px", borderRadius: "15px", background: "rgba(30, 41, 59, 0.4)", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer" }}>Favorites</span>
        </div>
        
        {/* Chats List or Search Results */}
        <div className="custom-scrollbar" style={{ flex: 1, overflowY: "scroll", padding: "5px 0", minHeight: 0 }}>
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
                    background: "transparent",
                    transition: "background 0.2s ease",
                    gap: "15px",
                    position: "relative"
                  }}
                  className="hover:bg-slate-800/50"
                >
                  <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.2rem", flexShrink: 0 }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                      <span style={{ fontWeight: "600", fontSize: "1.05rem", color: "var(--text-light)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {u.name}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {u.email}
                      </span>
                    </div>
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
              {chats && chats.length > 0 && chats
                .filter((chat) => {
                  if (showUnreadOnly) {
                    if (readChatIds.includes(chat._id) || selectedChat?._id === chat._id) return false;
                    return chat.unreadCount > 0 || (chat.latestMessage && chat.latestMessage.sender._id !== user?._id);
                  }
                  return true;
                })
                .slice()
                .sort((a, b) => {
                  const isAPinned = user?.pinnedChats?.includes(a._id);
                  const isBPinned = user?.pinnedChats?.includes(b._id);
                  if (isAPinned && !isBPinned) return -1;
                  if (!isAPinned && isBPinned) return 1;
                  return 0;
                })
                .map((chat) => (
              <div
                onMouseEnter={() => setHoveredItemId(chat._id)}
                onMouseLeave={() => setHoveredItemId(null)}
                onClick={() => {
                  setSelectedChat(chat);
                  if (!readChatIds.includes(chat._id)) {
                    setReadChatIds([...readChatIds, chat._id]);
                  }
                }}
                key={chat._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 15px",
                  cursor: "pointer",
                  background: selectedChat?._id === chat._id ? "rgba(30, 41, 59, 0.7)" : "transparent",
                  transition: "background 0.2s ease",
                  gap: "15px",
                  position: "relative"
                }}
                className="hover:bg-slate-800/50"
              >
                {/* 3 Dots / Chevron Icon */}
                {(hoveredItemId === chat._id || openMenuId === chat._id) && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === chat._id ? null : chat._id);
                    }}
                    style={{ position: 'absolute', right: '15px', top: '15px', padding: '5px', borderRadius: '50%', background: openMenuId === chat._id ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                    className="hover:bg-white/10 transition-colors"
                  >
                    <ChevronDown size={20} color="var(--text-muted)" />
                  </div>
                )}

                {/* Dropdown Menu */}
                {openMenuId === chat._id && (
                  <ChatDropdownMenu 
                    closeMenu={() => setOpenMenuId(null)}
                    onPin={() => handlePinChat(chat._id)}
                    onClear={() => handleClearChat(chat._id)}
                    onDelete={() => handleDeleteChat(chat._id)}
                    onBlock={() => {
                      const otherUser = chat.users.find((u: any) => u._id !== user?._id);
                      if (otherUser) confirmBlockUser(otherUser);
                    }}
                    isPinned={user?.pinnedChats?.includes(chat._id) || false}
                  />
                )}

                {/* Avatar */}
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.2rem", flexShrink: 0 }}>
                  {(!chat.isGroupChat ? chat.users.find((u: any) => u._id !== user?._id)?.name : chat.chatName).charAt(0).toUpperCase()}
                </div>
                
                {/* Chat Info */}
                <div style={{ flex: 1, overflow: "hidden", borderBottom: selectedChat?._id === chat._id ? "none" : "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                    <div style={{ fontWeight: 500, color: "white", fontSize: "1.05rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: "5px" }}>
                      {!chat.isGroupChat
                        ? chat.users.find((u: any) => u._id !== user?._id)?.name
                        : chat.chatName}
                      {user?.pinnedChats?.includes(chat._id) && <Pin size={14} color="var(--text-muted)" style={{ transform: "rotate(45deg)" }} />}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: 0 }}>
                      {chat.latestMessage ? formatTime(chat.latestMessage.createdAt) : formatTime(chat.updatedAt)}
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
              {allUsers.length > 0 ? allUsers.filter(u => !chats.some(chat => !chat.isGroupChat && chat.users.some((chatUser: any) => chatUser._id === u._id))).map((u) => (
                <div
                  onMouseEnter={() => setHoveredItemId(u._id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                  onClick={() => accessChat(u._id)}
                  key={u._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 15px",
                    cursor: "pointer",
                    background: "transparent",
                    transition: "background 0.2s ease",
                    gap: "15px",
                    position: "relative"
                  }}
                  className="hover:bg-slate-800/50"
                >
                  {/* 3 Dots / Chevron Icon */}
                  {(hoveredItemId === u._id || openMenuId === u._id) && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === u._id ? null : u._id);
                      }}
                      style={{ position: 'absolute', right: '15px', top: '15px', padding: '5px', borderRadius: '50%', background: openMenuId === u._id ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                      className="hover:bg-white/10 transition-colors"
                    >
                      <ChevronDown size={20} color="var(--text-muted)" />
                    </div>
                  )}

                  {/* Dropdown Menu */}
                  {openMenuId === u._id && (
                    <ChatDropdownMenu 
                      closeMenu={() => setOpenMenuId(null)} 
                      onBlock={() => confirmBlockUser(u)}
                      onHide={() => handleHideContact(u._id)}
                    />
                  )}

                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.2rem", flexShrink: 0 }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                      <div style={{ fontWeight: 500, color: "white", fontSize: "1.05rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                      <UserPlus size={14} /> 
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</span>
                    </div>
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
        ) : activeTab === "communities" ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "rgba(15, 23, 42, 0.95)" }}>
            <div style={{ padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--text-light)" }}>Communities</h2>
              <div style={{ display: "flex", gap: "15px", color: "var(--text-light)", alignItems: "center" }}>
                <Plus size={22} style={{ cursor: "pointer", transition: "color 0.2s" }} className="hover:text-white" />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem", textAlign: "center", flex: 1 }}>
              <div style={{ background: "rgba(34, 197, 94, 0.1)", padding: "2rem", borderRadius: "20px", marginBottom: "2rem" }}>
                <Users size={80} color="#22c55e" />
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "bold", color: "white", marginBottom: "1rem" }}>Stay connected with a community</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
                Communities bring members together in topic-based groups, and make it easy to get admin announcements. Any community you're added to will appear here.
              </p>
              <a href="#" style={{ color: "#22c55e", textDecoration: "none", fontWeight: 500, fontSize: "0.95rem", marginBottom: "2rem" }} className="hover:underline">
                See example communities
              </a>
              <button 
                style={{ background: "#22c55e", color: "white", border: "none", padding: "12px 24px", borderRadius: "24px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem", width: "100%" }}
                className="hover:bg-green-600 transition-colors"
              >
                Start your community
              </button>
            </div>
          </div>
        ) : activeTab === "calls" ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "rgba(15, 23, 42, 0.95)" }}>
            <div style={{ padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--text-light)" }}>Calls</h2>
              <div style={{ display: "flex", gap: "15px", color: "var(--text-light)", alignItems: "center" }}>
                <PhoneCall size={20} style={{ cursor: "pointer", transition: "color 0.2s" }} className="hover:text-white" />
              </div>
            </div>
            
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
              {/* Search Bar */}
              <div style={{ padding: "0 15px 15px 15px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ background: "rgba(30, 41, 59, 0.7)", borderRadius: "8px", display: "flex", alignItems: "center", padding: "8px 15px", gap: "10px" }}>
                  <Search size={18} color="var(--text-muted)" />
                  <input 
                    type="text" 
                    placeholder="Search name or number" 
                    value={callSearch}
                    onChange={(e) => setCallSearch(e.target.value)}
                    style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontSize: "0.95rem" }} 
                  />
                </div>
              </div>

              {callSearch ? (
                <div style={{ padding: "10px 0" }}>
                  {allUsers
                    .filter((u: any) => u.name.toLowerCase().includes(callSearch.toLowerCase()) || u.email.toLowerCase().includes(callSearch.toLowerCase()))
                    .map((u: any) => (
                      <div key={u._id} className="hover:bg-slate-800/50" style={{ display: "flex", alignItems: "center", gap: "15px", padding: "12px 20px", cursor: "pointer", transition: "background 0.2s" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.2rem", flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 500, color: "white", fontSize: "1.05rem", marginBottom: "3px" }}>{u.name}</div>
                            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{u.email}</div>
                          </div>
                          <PhoneCall size={18} color="var(--text-muted)" className="hover:text-green-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  {allUsers.filter((u: any) => u.name.toLowerCase().includes(callSearch.toLowerCase()) || u.email.toLowerCase().includes(callSearch.toLowerCase())).length === 0 && (
                    <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <div style={{ padding: "15px", background: "rgba(30, 41, 59, 0.5)", borderRadius: "50%" }}>
                        <Search size={32} color="var(--text-muted)" />
                      </div>
                      <p>No contacts found for "{callSearch}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Favorites */}
                  <div style={{ padding: "15px 20px 5px 20px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-light)", marginBottom: "15px" }}>Favorites</h3>
                    <div className="hover:bg-slate-800/50" style={{ display: "flex", alignItems: "center", gap: "15px", padding: "10px 0", cursor: "pointer", borderRadius: "8px", transition: "background 0.2s" }}>
                      <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
                        <Plus size={24} />
                      </div>
                      <div style={{ fontWeight: 500, color: "white", fontSize: "1.05rem" }}>Add favorite</div>
                    </div>
                  </div>

                  {/* Recent */}
                  <div style={{ padding: "15px 20px", marginTop: "10px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-light)", marginBottom: "15px" }}>Recent</h3>
                    
                    {/* Mock Call Item */}
                    <div className="hover:bg-slate-800/50" style={{ display: "flex", alignItems: "center", gap: "15px", padding: "10px 0", cursor: "pointer", borderRadius: "8px", transition: "background 0.2s" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#fde68a", display: "flex", alignItems: "center", justifyContent: "center", color: "#b45309", fontWeight: "bold", fontSize: "1.2rem", flexShrink: 0 }}>
                        M
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                          <div style={{ fontWeight: 500, color: "white", fontSize: "1.05rem" }}>Mu Isreal</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Yesterday</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                          <PhoneIncoming size={14} color="#22c55e" />
                          <span>Incoming</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer text */}
                  <div style={{ padding: "20px", marginTop: "10px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                    <Lock size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Your personal calls are <span style={{ color: "#22c55e", fontWeight: 500 }}>end-to-end encrypted</span>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}
        </div>

      {/* Main Chat Window */}
      <div className="main-chat-container" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedChat ? (
          <>
            <div className="glass-panel" style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", background: "rgba(15, 23, 42, 0.95)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <ArrowLeft 
                  size={24} 
                  className="mobile-back-btn hover:text-white" 
                  style={{ cursor: "pointer", color: "var(--text-light)", transition: "color 0.2s" }} 
                  onClick={() => setSelectedChat(null)} 
                />
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
            
            <div className="custom-scrollbar" style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: "contain", backgroundBlendMode: "overlay", backgroundColor: "rgba(15, 23, 42, 0.9)" }}>
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

            {(() => {
              const otherUser = !selectedChat?.isGroupChat 
                ? selectedChat?.users.find((u: any) => u._id !== user?._id) 
                : null;
              const isBlocked = otherUser && user?.blockedUsers?.includes(otherUser._id);

              if (isBlocked) {
                return (
                  <div className="glass-panel" style={{ padding: "15px 1.5rem", display: "flex", justifyContent: "center", gap: "20px", alignItems: "center", background: "rgba(15, 23, 42, 0.95)" }}>
                    <button 
                      onClick={() => handleDeleteChat(selectedChat._id)}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "24px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", cursor: "pointer", fontWeight: 500 }}
                      className="hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={18} /> Delete chat
                    </button>
                    <button 
                      onClick={() => confirmUnblockUser(otherUser)}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "24px", background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", border: "1px solid rgba(34, 197, 94, 0.3)", cursor: "pointer", fontWeight: 500 }}
                      className="hover:bg-green-500/20 transition-colors"
                    >
                      <Ban size={18} style={{ transform: "rotate(45deg)" }} /> Unblock
                    </button>
                  </div>
                );
              }

              return (
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
              );
            })()}
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
      
      {/* Block Confirmation Modal */}
      {isBlockModalOpen && userToBlock && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-panel" style={{ width: "90%", maxWidth: "400px", padding: "1.5rem", borderRadius: "12px", background: "white", color: "#1f2937" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 500, marginBottom: "1rem" }}>
              Block {userToBlock.name}?
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#6b7280", marginBottom: "1.5rem", lineHeight: "1.5" }}>
              This person won't be able to message or call you. They won't know you blocked or reported them.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button 
                onClick={() => {
                  setIsBlockModalOpen(false);
                  setUserToBlock(null);
                }} 
                style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #d1d5db", background: "transparent", color: "#374151", fontWeight: 500, cursor: "pointer", fontSize: "0.9rem" }}
                className="hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleBlockUser(userToBlock._id);
                  setIsBlockModalOpen(false);
                  setUserToBlock(null);
                }} 
                style={{ padding: "8px 16px", borderRadius: "20px", border: "none", background: "#ef4444", color: "white", fontWeight: 500, cursor: "pointer", fontSize: "0.9rem" }}
                className="hover:bg-red-600 transition-colors"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Unblock Confirmation Modal */}
      {isUnblockModalOpen && userToUnblock && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-panel" style={{ width: "90%", maxWidth: "400px", padding: "1.5rem", borderRadius: "20px", background: "white", color: "#1f2937" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 400, marginBottom: "2rem", marginTop: "0.5rem" }}>
              Unblock {userToUnblock.name}?
            </h2>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button 
                onClick={() => {
                  setIsUnblockModalOpen(false);
                  setUserToUnblock(null);
                }} 
                style={{ padding: "8px 16px", borderRadius: "20px", border: "none", background: "transparent", color: "#16a34a", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem" }}
                className="hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleBlockUser(userToUnblock._id); // toggles block status
                  setIsUnblockModalOpen(false);
                  setUserToUnblock(null);
                }} 
                style={{ padding: "8px 20px", borderRadius: "20px", border: "none", background: "#16a34a", color: "white", fontWeight: 500, cursor: "pointer", fontSize: "0.95rem" }}
                className="hover:bg-green-700 transition-colors"
              >
                Unblock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      );
    })()}
    </>
  );
}
