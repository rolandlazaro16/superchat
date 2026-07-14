"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChatState } from "@/context/ChatProvider";
import { ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { user, setUser } = ChatState();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPic(user.profilePic || "");
    } else {
      const userInfo = localStorage.getItem("userInfo");
      if (!userInfo) {
        router.push("/");
      } else {
        const parsed = JSON.parse(userInfo);
        setName(parsed.name);
        setEmail(parsed.email);
        setPic(parsed.profilePic || "");
      }
    }
  }, [user, router]);

  const postDetails = (pics: any) => {
    setPicLoading(true);
    setError("");
    setSuccess("");
    if (pics === undefined) {
      setError("Please Select an Image!");
      setPicLoading(false);
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "superchat"); 
      data.append("cloud_name", "your_cloud_name"); // We assume these defaults match what the user had in page.tsx
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
    setSuccess("");
    setSubmitLoading(true);

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user?.token || JSON.parse(localStorage.getItem("userInfo") || "{}").token}`,
        },
      };

      const payload: any = { name, email, profilePic: pic };
      if (password) {
        payload.password = password;
      }

      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/profile`,
        payload,
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      setSuccess("Profile updated successfully!");
      setPassword(""); // Clear password field
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
          <Link href="/chat" className="flex items-center text-gray-500 hover:text-green-600 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} className="mr-1" /> Back to Chat
          </Link>

          <h1 className="text-center mb-6 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500">
            Profile Settings
          </h1>

          {error && <div className="text-red-500 mb-4 text-center text-sm font-medium p-3 bg-red-50 rounded-lg">{error}</div>}
          {success && <div className="text-green-600 mb-4 text-center text-sm font-medium p-3 bg-green-50 rounded-lg">{success}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col items-center mb-2">
              <div className="relative w-24 h-24 rounded-full bg-green-100 mb-2 border-4 border-white shadow-md overflow-hidden flex items-center justify-center group">
                {pic ? (
                  <img src={pic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-green-600">{name ? name.charAt(0).toUpperCase() : "U"}</span>
                )}
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={24} color="white" />
                  <span className="text-white text-xs mt-1 font-medium">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        postDetails(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">Click image to update</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
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
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="Leave blank to keep unchanged"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl mt-2 shadow-lg shadow-green-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={picLoading || submitLoading}
            >
              {picLoading ? "Uploading Image..." : submitLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
