"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChatState } from "@/context/ChatProvider";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 w-full" style={{ flex: 1 }}>
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-xl relative overflow-hidden border border-gray-100">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-400 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400 rounded-full blur-3xl opacity-20 -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-center mb-6 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500">
            Superchat
          </h1>
          
          <div className="flex mb-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`flex-1 p-3 text-sm font-semibold transition-colors border-b-2 ${
                isLogin 
                  ? "border-green-600 text-green-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`flex-1 p-3 text-sm font-semibold transition-colors border-b-2 ${
                !isLogin 
                  ? "border-green-600 text-green-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && <div className="text-red-500 mb-4 text-center text-sm font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl mt-4 shadow-lg shadow-green-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={picLoading || submitLoading}
            >
              {picLoading ? "Uploading Image..." : submitLoading ? "Please wait..." : (isLogin ? "Login" : "Sign Up")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
