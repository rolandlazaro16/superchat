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
    <div className="min-h-screen flex items-center justify-center p-4 w-full" style={{ flex: 1, background: "radial-gradient(circle at top right, #ffffff, #f8fafc 40%, #e2e8f0 100%)" }}>
      
      {/* Abstract Background Elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-emerald-200 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-teal-200 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>

      <div className="glass-panel bg-white/90 w-full max-w-md rounded-2xl pt-5 px-8 pb-8 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-300">
        
        <div className="relative z-10">
          <div className="text-center" style={{ marginBottom: "2rem" }}>
            <h1 className="text-4xl font-extrabold tracking-tight mb-1" style={{ background: "linear-gradient(135deg, #10b981 0%, #0f766e 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Superchat
            </h1>
            <p className="text-sm text-slate-500">Connect with your community</p>
          </div>
          
          <div className="relative flex items-center bg-slate-100 rounded-xl p-1.5 border border-slate-200 shadow-inner shadow-slate-300/50" style={{ marginBottom: "2.5rem" }}>
            {/* Sliding Background Indicator with Soft Glow */}
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-[0_4px_10px_rgba(16,185,129,0.3)] transition-transform duration-300 ease-out z-0`}
              style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }}
            ></div>

            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`relative z-10 flex-1 h-[40px] flex items-center justify-center text-sm font-bold rounded-lg transition-colors duration-300 tracking-wide ${
                isLogin 
                  ? "text-white" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`relative z-10 flex-1 h-[40px] flex items-center justify-center text-sm font-bold rounded-lg transition-colors duration-300 tracking-wide ${
                !isLogin 
                  ? "text-white" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg p-3 text-center" style={{ marginBottom: "1.5rem" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8" style={{ marginTop: "1rem" }}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 uppercase tracking-wider mb-2 ml-1">Name</label>
                  <input
                    type="text"
                    className="input-field !py-4 !px-4 !text-base bg-white border border-slate-200 shadow-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-xl w-full"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 uppercase tracking-wider mb-2 ml-1">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-base text-slate-600 file:mr-4 file:py-4 file:px-6 file:rounded-xl file:border-0 file:font-semibold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100 transition-all cursor-pointer bg-slate-50 border border-slate-200 shadow-sm rounded-xl"
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
              <label className="block text-xs font-medium text-slate-600 uppercase tracking-wider mb-2 ml-1">Email Address</label>
              <input
                type="email"
                className="input-field !py-4 !px-4 !text-base bg-white border border-slate-200 shadow-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-xl w-full"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field !py-4 !px-4 !text-base bg-white border border-slate-200 shadow-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-14 rounded-xl w-full"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-8 flex justify-center items-center h-[52px] rounded-xl font-bold text-white shadow-xl shadow-emerald-500/30 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-[1.05rem]"
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
