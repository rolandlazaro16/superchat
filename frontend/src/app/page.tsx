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
  const [rememberMe, setRememberMe] = useState(false);
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
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1976D2 0%, #1565C0 40%, #0D47A1 100%)",
      }}
    >
      {/* Outer decorative spheres on the blue background */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-80px",
          left: "-60px",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #42A5F5, #1565C0 60%, #0D47A1)",
          boxShadow: "inset -8px -8px 20px rgba(0,0,0,0.3), 4px 4px 20px rgba(0,0,0,0.2)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "60px",
          left: "100px",
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #64B5F6, #1E88E5 60%, #1565C0)",
          boxShadow: "inset -4px -4px 12px rgba(0,0,0,0.25), 2px 2px 10px rgba(0,0,0,0.15)",
        }}
      />

      {/* Main Card */}
      <div
        className="relative z-10 flex w-full max-w-[960px] mx-4 overflow-hidden"
        style={{
          borderRadius: "24px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          minHeight: "540px",
        }}
      >
        {/* ==================== LEFT PANEL ==================== */}
        <div
          className="hidden md:flex flex-col justify-center relative overflow-hidden"
          style={{
            width: "42%",
            background: "linear-gradient(160deg, #1565C0 0%, #1976D2 50%, #1E88E5 100%)",
            padding: "48px 40px",
          }}
        >
          {/* Large sphere top-left */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-100px",
              left: "-80px",
              width: "340px",
              height: "340px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 38% 38%, #1E88E5, #0D47A1 70%, #0A3D91)",
              boxShadow: "inset -12px -12px 30px rgba(0,0,0,0.4), 6px 6px 20px rgba(0,0,0,0.2)",
            }}
          />
          {/* Large sphere bottom-right */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: "-60px",
              right: "-40px",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #42A5F5, #1565C0 65%, #0D47A1)",
              boxShadow: "inset -10px -10px 25px rgba(0,0,0,0.35), 4px 4px 16px rgba(0,0,0,0.2)",
            }}
          />
          {/* Medium sphere bottom-left */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: "20px",
              left: "20px",
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 38% 38%, #42A5F5, #1976D2 65%, #1565C0)",
              boxShadow: "inset -6px -6px 16px rgba(0,0,0,0.3), 3px 3px 12px rgba(0,0,0,0.15)",
            }}
          />
          {/* Small accent sphere */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "55%",
              right: "15%",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #64B5F6, #1E88E5 60%, #1565C0)",
              boxShadow: "inset -3px -3px 8px rgba(0,0,0,0.25)",
            }}
          />

          {/* Text content */}
          <div className="relative z-10">
            <h1
              className="uppercase tracking-wide"
              style={{
                fontSize: "32px",
                fontWeight: 900,
                color: "#ffffff",
                marginBottom: "4px",
                letterSpacing: "2px",
                textShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              Welcome
            </h1>
            <h2
              className="uppercase"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#4FC3F7",
                letterSpacing: "3px",
                marginBottom: "24px",
              }}
            >
              Your Headline Name
            </h2>
            <p
              style={{
                fontSize: "11px",
                lineHeight: "1.7",
                color: "rgba(255,255,255,0.7)",
                maxWidth: "260px",
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
              <br /><br />
              Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper.
            </p>
          </div>
        </div>

        {/* ==================== RIGHT PANEL ==================== */}
        <div
          className="flex flex-col justify-center bg-white"
          style={{
            width: "100%",
            padding: "48px 44px",
          }}
        >
          <div className="w-full max-w-sm mx-auto md:mx-0">
            {/* Header */}
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#1a1a2e",
                marginBottom: "6px",
              }}
            >
              {isLogin ? "Sign in" : "Sign up"}
            </h2>
            <p
              style={{
                fontSize: "10px",
                color: "#999",
                marginBottom: "28px",
                lineHeight: "1.5",
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </p>

            {error && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                  fontSize: "12px",
                  fontWeight: 500,
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Sign Up extra fields */}
              {!isLogin && (
                <>
                  {/* Name */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderBottom: "1px solid #e0e0e0",
                      marginBottom: "20px",
                      paddingBottom: "8px",
                    }}
                  >
                    <User size={16} style={{ color: "#555", marginRight: "12px", flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="User Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        fontSize: "13px",
                        color: "#333",
                        width: "100%",
                        background: "transparent",
                      }}
                    />
                  </div>
                  {/* Profile Picture */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderBottom: "1px solid #e0e0e0",
                      marginBottom: "20px",
                      paddingBottom: "8px",
                    }}
                  >
                    <Camera size={16} style={{ color: "#555", marginRight: "12px", flexShrink: 0 }} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          postDetails(e.target.files[0]);
                        }
                      }}
                      style={{
                        border: "none",
                        outline: "none",
                        fontSize: "12px",
                        color: "#666",
                        width: "100%",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </>
              )}

              {/* Email / User Name */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid #e0e0e0",
                  marginBottom: "20px",
                  paddingBottom: "8px",
                }}
              >
                <User size={16} style={{ color: "#555", marginRight: "12px", flexShrink: 0 }} />
                <input
                  type="email"
                  placeholder={isLogin ? "User Name" : "Email Address"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "13px",
                    color: "#333",
                    width: "100%",
                    background: "transparent",
                  }}
                />
              </div>

              {/* Password */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid #e0e0e0",
                  marginBottom: "16px",
                  paddingBottom: "8px",
                }}
              >
                <Lock size={16} style={{ color: "#555", marginRight: "12px", flexShrink: 0 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "13px",
                    color: "#333",
                    width: "100%",
                    background: "transparent",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    border: "none",
                    background: "none",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#1a1a2e",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.5px",
                  }}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>

              {/* Remember me / Forgot Password row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "11px",
                    color: "#666",
                    cursor: "pointer",
                    gap: "6px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: "14px",
                      height: "14px",
                      accentColor: "#1565C0",
                      cursor: "pointer",
                    }}
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  style={{
                    fontSize: "11px",
                    color: "#1565C0",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={picLoading || submitLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#1a1a3e",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: picLoading || submitLoading ? "not-allowed" : "pointer",
                  opacity: picLoading || submitLoading ? 0.7 : 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { if (!picLoading && !submitLoading) e.currentTarget.style.background = "#12122e"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#1a1a3e"; }}
              >
                {picLoading || submitLoading ? (
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid rgba(255,255,255,0.2)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                ) : (
                  isLogin ? "Sing in" : "Sing up"
                )}
              </button>
            </form>

            {/* OR divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "20px 0",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
              <span
                style={{
                  padding: "0 16px",
                  fontSize: "11px",
                  color: "#aaa",
                }}
              >
                Or
              </span>
              <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
            </div>

            {/* Sign in with other */}
            <button
              type="button"
              style={{
                width: "100%",
                padding: "11px",
                background: "#fff",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginBottom: "24px",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8f8f8";
                e.currentTarget.style.borderColor = "#bbb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#ddd";
              }}
            >
              {isLogin ? "Sing in with other" : "Sing up with other"}
            </button>

            {/* Bottom toggle */}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "#888" }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1565C0",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe for spinner */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
