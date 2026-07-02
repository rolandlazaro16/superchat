"use client";

import React, { useState } from 'react';

// Mock data for UI demonstration
const mockContacts = [
  { id: 1, name: 'Alice Smith', status: 'online', avatar: 'A', lastMessage: 'See you tomorrow!', time: '10:30 AM' },
  { id: 2, name: 'Bob Johnson', status: 'offline', avatar: 'B', lastMessage: 'Thanks for the help', time: 'Yesterday' },
  { id: 3, name: 'Charlie Brown', status: 'online', avatar: 'C', lastMessage: 'Are we still on for the meeting?', time: '2:15 PM' },
];

const mockMessages = [
  { id: 1, senderId: 2, text: 'Hey, how are you doing?', time: '10:00 AM' },
  { id: 2, senderId: 'me', text: 'I am doing great, just working on the new Superchat app!', time: '10:05 AM' },
  { id: 3, senderId: 2, text: 'That sounds awesome. Can\'t wait to see it.', time: '10:08 AM' },
];

export default function ChatDashboard() {
  const [activeContact, setActiveContact] = useState(mockContacts[0]);
  const [message, setMessage] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
      
      {/* Sidebar */}
      <div className="w-80 border-r border-white/5 flex flex-col glass-panel z-10 m-4 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Messages</h2>
          <button className="p-2 rounded-full hover:bg-white/10 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-primary transition"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {mockContacts.map((contact) => (
            <div 
              key={contact.id} 
              onClick={() => setActiveContact(contact)}
              className={`flex items-center p-4 cursor-pointer transition-all border-l-2 ${
                activeContact.id === contact.id 
                  ? 'bg-primary/10 border-primary' 
                  : 'border-transparent hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {contact.avatar}
                </div>
                {contact.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-200">{contact.name}</h3>
                  <span className="text-xs text-gray-500">{contact.time}</span>
                </div>
                <p className="text-sm text-gray-400 truncate w-48">{contact.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* User profile section at bottom of sidebar */}
        <div className="p-4 border-t border-white/5 bg-black/20 flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">ME</div>
          <div className="ml-3 flex-1">
            <div className="text-sm font-medium text-gray-300">My Account</div>
            <div className="text-xs text-green-400">Online</div>
          </div>
          <button className="text-gray-500 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col my-4 mr-4 glass-panel rounded-2xl overflow-hidden shadow-2xl relative z-10">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-md">
              {activeContact.avatar}
            </div>
            <div className="ml-3">
              <h2 className="font-semibold text-gray-100">{activeContact.name}</h2>
              <span className={`text-xs ${activeContact.status === 'online' ? 'text-green-400' : 'text-gray-500'}`}>
                {activeContact.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-primary transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </button>
            <button 
              onClick={() => setIsVideoCallActive(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-primary/20 text-gray-300 hover:text-primary transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </button>
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all duration-200 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {mockMessages.map((msg) => {
            const isMe = msg.senderId === 'me';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                  isMe 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white/10 text-gray-200 rounded-bl-none'
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button type="button" className="p-3 text-gray-400 hover:text-white transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button 
              type="submit" 
              disabled={!message.trim()}
              className="p-3 bg-primary rounded-full text-white hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary transition shadow-lg shadow-primary/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Video Call Overlay (Simple Simulation) */}
      {isVideoCallActive && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col">
          <div className="p-6 flex justify-between items-center text-white">
            <div>
              <h2 className="text-2xl font-bold">End-to-End Encrypted Call</h2>
              <p className="text-gray-400 text-sm">Talking with {activeContact.name}...</p>
            </div>
            <div className="text-xl font-mono bg-white/10 px-4 py-2 rounded-xl">05:24</div>
          </div>
          
          <div className="flex-1 p-6 flex justify-center items-center relative">
            {/* Remote User Video (Simulated) */}
            <div className="w-full max-w-4xl aspect-video bg-gray-900 rounded-3xl overflow-hidden relative shadow-2xl border border-white/10 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-5xl">
                {activeContact.avatar}
              </div>
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-white text-sm">
                {activeContact.name}
              </div>
            </div>
            
            {/* Local User Video (Simulated) */}
            <div className="absolute bottom-10 right-10 w-48 aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-white/20 flex items-center justify-center">
               <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">ME</div>
            </div>
          </div>
          
          {/* Call Controls */}
          <div className="p-8 flex justify-center gap-6">
            <button className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <button className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button 
              onClick={() => setIsVideoCallActive(false)}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-[135deg]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
