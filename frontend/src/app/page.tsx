"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChatState } from "@/context/ChatProvider";
import { Eye, EyeOff } from "lucide-react";

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
      data.append("upload_preset", "superchat"); // You will need to create this preset in Cloudinary
      data.append("cloud_name", "your_cloud_name"); // Update this with actual cloud name
      fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            setPic(data.url.toString());
          } else {
            setError("Failed to upload image. Please check Cloudinary config.");
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
    <div className="min-h-screen flex items-center justify-center p-4 w-full" style={{ flex: 1, background: "radial-gradient(circle at top right, #1e1b4b, #0f172a 40%, #020617 100%)" }}>
      
      {/* Abstract Background Elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      <div className="glass-panel w-full max-w-md rounded-2xl pt-5 px-8 pb-8 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
        
        <div className="relative z-10">
          <div className="text-center" style={{ marginBottom: "2rem" }}>
            <h1 className="text-4xl font-extrabold tracking-tight mb-1" style={{ background: "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Superchat
            </h1>
            <p className="text-sm text-slate-400">Connect with your community</p>
          </div>
          
          <div className="relative flex items-center bg-slate-900/60 rounded-xl p-1.5 border border-slate-700/50 shadow-inner shadow-black/20" style={{ marginBottom: "2.5rem" }}>
            {/* Sliding Background Indicator with Soft Glow */}
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-transform duration-300 ease-out z-0`}
              style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }}
            ></div>

            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`relative z-10 flex-1 h-[40px] flex items-center justify-center text-sm font-bold rounded-lg transition-colors duration-300 tracking-wide ${
                isLogin 
                  ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`relative z-10 flex-1 h-[40px] flex items-center justify-center text-sm font-bold rounded-lg transition-colors duration-300 tracking-wide ${
                !isLogin 
                  ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-medium rounded-lg p-3 text-center backdrop-blur-sm" style={{ marginBottom: "1.5rem" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8" style={{ marginTop: "1rem" }}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 ml-1">Name</label>
                  <input
                    type="text"
                    className="input-field !py-4 !px-4 !text-base shadow-inner shadow-black/10 rounded-xl"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 ml-1">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-base text-slate-400 file:mr-4 file:py-4 file:px-6 file:rounded-xl file:border-0 file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 transition-all cursor-pointer shadow-inner shadow-black/10 rounded-xl bg-slate-800/30"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        postDetails(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
              <input
                type="email"
                className="input-field !py-4 !px-4 !text-base shadow-inner shadow-black/10 rounded-xl"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field !py-4 !px-4 !text-base shadow-inner shadow-black/10 pr-14 rounded-xl"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-8 flex justify-center items-center h-[52px] rounded-xl font-bold text-white shadow-xl shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-[1.05rem]"
              disabled={picLoading || submitLoading}
            >
              {picLoading || submitLoading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                isLogin ? "Login to Superchat" : "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
