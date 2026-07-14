"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChatState } from "@/context/ChatProvider";
import { User, Lock, Mail, Camera } from "lucide-react";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setUser } = ChatState();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      router.push("/chat");
    }
  }, [router]);

  const postDetails = (pics: any) => {
    setPicLoading(true);
    if (pics === undefined) {
      setError("Please Select an Image!");
      setPicLoading(false);
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "superchat"); 
      data.append("cloud_name", "your_cloud_name"); 
      fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            setPic(data.url.toString());
          } else {
            setError("Failed to upload image.");
          }
          setPicLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Error uploading image");
          setPicLoading(false);
        });
    } else {
      setError("Please Select an Image (JPEG/PNG)!");
      setPicLoading(false);
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitLoading(true);

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      if (isLogin) {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`,
          { email, password },
          config
        );
        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data);
        router.push("/chat");
      } else {
        if (!name) {
          setError("Please fill all the fields");
          return;
        }
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/register`,
          { name, email, password, profilePic: pic },
          config
        );
        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data);
        router.push("/chat");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-500 w-full" style={{ flex: 1, background: "#0056b3" }}>
      
      {/* Main Container Card */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 min-h-[600px]">
        
        {/* Left Panel (Visuals) */}
        <div className="hidden md:flex flex-col justify-center items-start w-1/2 p-12 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0056b3 0%, #007bff 100%)" }}>
          
          {/* Abstract Circles */}
          <div className="absolute top-[-15%] left-[-15%] w-[400px] h-[400px] bg-blue-600 rounded-full opacity-80 mix-blend-overlay"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-400 rounded-full opacity-60 mix-blend-overlay"></div>
          <div className="absolute top-[60%] left-[10%] w-48 h-48 bg-blue-500 rounded-full opacity-70 mix-blend-overlay"></div>

          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase drop-shadow-md">Welcome</h1>
            <h2 className="text-xl font-bold mb-6 uppercase tracking-wider drop-shadow-md">Superchat User</h2>
            <p className="text-sm text-blue-100 leading-relaxed max-w-xs drop-shadow-sm">
              Connect with your community instantly. Join thousands of users enjoying seamless text, voice, and high-quality video communication.
            </p>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <div className="flex flex-col justify-center w-full md:w-1/2 p-8 md:p-12 bg-white relative">
          
          {/* Mobile Background Decoration (only shows on small screens) */}
          <div className="md:hidden absolute top-0 left-0 right-0 h-32 bg-blue-600 rounded-b-[50px] -z-0"></div>

          <div className="w-full max-w-md mx-auto relative z-10 bg-white md:bg-transparent rounded-2xl md:rounded-none p-6 md:p-0 shadow-xl md:shadow-none mt-16 md:mt-0">
            <div className="text-center md:text-left mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                {isLogin ? "Sign in" : "Sign up"}
              </h2>
              <p className="text-xs text-slate-400">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg p-3 text-center mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!isLogin && (
                <>
                  {/* Name Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-600" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all focus:outline-none"
                      placeholder="User Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  {/* Picture Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Camera size={18} className="text-slate-600" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-lg text-sm text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all cursor-pointer focus:outline-none"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          postDetails(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </>
              )}
              
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {isLogin ? <User size={18} className="text-slate-600" /> : <Mail size={18} className="text-slate-600" />}
                </div>
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all focus:outline-none"
                  placeholder={isLogin ? "User Name (Email)" : "Email Address"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-600" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-16 py-3 bg-slate-100 border-none rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all focus:outline-none"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Extras Row */}
              <div className="flex items-center justify-between mt-2 mb-2">
                <label className="flex items-center text-xs text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
                  <input type="checkbox" className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                  Remember me
                </label>
                <a href="#" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">
                  Forgot Password?
                </a>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-lg font-semibold text-sm transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                disabled={picLoading || submitLoading}
              >
                {picLoading || submitLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  isLogin ? "Sign in" : "Sign up"
                )}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-4 text-xs text-slate-400 uppercase">Or</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            <button 
              type="button"
              className="w-full py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-sm transition-colors flex justify-center items-center gap-2 mb-6 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isLogin ? "Sign in with other" : "Sign up with other"}
            </button>

            <div className="text-center">
              <p className="text-xs text-slate-500">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(""); }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
