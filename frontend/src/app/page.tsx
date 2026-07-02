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
          setPic(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.error(err);
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

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      if (isLogin) {
        const { data } = await axios.post(
          "http://localhost:5000/api/auth/login",
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
          "http://localhost:5000/api/auth/register",
          { name, email, password, profilePic: pic },
          config
        );
        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data);
        router.push("/chat");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="flex-center" style={{ flex: 1 }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "2rem", borderRadius: "16px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "2rem", fontWeight: 700 }}>
          Superchat
        </h1>
        
        <div style={{ display: "flex", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "transparent",
              color: isLogin ? "var(--primary-color)" : "var(--text-muted)",
              border: "none",
              borderBottom: isLogin ? "2px solid var(--primary-color)" : "2px solid transparent",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "transparent",
              color: !isLogin ? "var(--primary-color)" : "var(--text-muted)",
              border: "none",
              borderBottom: !isLogin ? "2px solid var(--primary-color)" : "2px solid transparent",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <div style={{ color: "#ff4d4f", marginBottom: "1rem", textAlign: "center" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!isLogin && (
            <>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field"
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
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }} disabled={picLoading}>
            {picLoading ? "Uploading Image..." : (isLogin ? "Login" : "Sign Up")}
          </button>
        </form>
      </div>
    </div>
  );
}
