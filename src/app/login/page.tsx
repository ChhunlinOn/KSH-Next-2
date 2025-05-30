"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { login } from "@/app/action/clientauth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      if (result.success) {
        router.push("/dashbaord/pages/resident"); // Fixed typo in path
        router.refresh(); // Refresh to update auth state
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen p-4">
      <div className="flex flex-col justify-center w-full md:w-1/3 p-8 bg-white rounded-lg mx-4 md:mx-0 md:mr-12">
        <div className="flex justify-center mb-6 md:mb-16">
          <Image
            src="https://res.cloudinary.com/dq5usncvp/image/upload/v1727160393/photo_2024_09_24_13_43_19_74e3099b67.jpg"
            alt="Logo"
            className="h-24 w-24 rounded-full"
            width={96}
            height={96}
          />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Get Started</h1>
        <p className="text-gray-500 mb-12">Welcome to our organization KSH</p>
        <div className="flex flex-col items-center mb-6">
          <hr className="w-1/2 md:w-2/3 border-stone-600 mb-4" />
        </div>
        <div className="space-y-4">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3" htmlFor="email">
              Email
            </label>
            <div className="flex items-center border border-stone-600 rounded px-3 py-2">
              <FaUser className="text-gray-400 mr-2" />
              <input
                className="p-2 bg-transparent border-none w-full text-gray-700 leading-tight focus:outline-none"
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-3" htmlFor="password">
              Password
            </label>
            <div className="flex items-center border border-stone-600 rounded px-3 py-2 relative">
              <FaLock className="text-gray-400 mr-2" />
              <input
                className="p-2 bg-transparent border-none w-full text-gray-700 leading-tight focus:outline-none"
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button
            className={`w-full p-3 text-white rounded-md ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#207137] hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
            }`}
            type="button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Signin"}
          </button>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 h-screen mt-3">
        <div className="relative w-full h-full">
          <Image
            src="https://res.cloudinary.com/dq5usncvp/image/upload/v1727161592/kshteam_f1e12ff6d3.jpg"
            alt="Group"
            className="object-cover rounded-xl"
            fill
            priority
          />
        </div>
      </div>
    </div>
  );
}