"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    phonenumber: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement backend integration later
    console.log('Register Data:', formData);
    // Simulate successful registration
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent rounded-full blur-3xl opacity-20 -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Superchat</h1>
            <p className="text-sm text-gray-400 mt-2">Create your account to start chatting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="username">Username</label>
              <input 
                id="username"
                name="username"
                type="text" 
                required
                value={formData.username}
                onChange={handleChange}
                className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="phonenumber">Phone Number</label>
              <input 
                id="phonenumber"
                name="phonenumber"
                type="tel" 
                required
                value={formData.phonenumber}
                onChange={handleChange}
                className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="e.g. +255 700 000 000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">Password</label>
              <input 
                id="password"
                name="password"
                type="password" 
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="Enter your password"
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full text-white font-medium py-3 rounded-xl mt-6 shadow-lg hover:shadow-primary/30 transition-all duration-300"
            >
              Sign Up
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
