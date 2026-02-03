// src/pages/Auth/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setToken } from "../../api";

const BACKGROUND_IMAGE_URL = "/BS-cover-2025-10-10-12-01-48.png";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { username, password });
      if (!res.data.token) throw new Error("Invalid login response: missing token");

      const token = res.data.token;
      setToken(token);
      localStorage.setItem("userToken", token);
      localStorage.setItem("role", res.data.role || "USER");

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Login Box */}
      <div className="relative w-full max-w-md p-10 bg-white rounded-xl shadow-2xl z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-800">Brain Station 23</h1>
          <p className="text-lg text-gray-600 mt-1">Library Management Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-100 rounded-md p-2 text-center">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="admin"
              disabled={loading}
              className="w-full px-5 py-4 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-[#0072CE] outline-none transition
                         placeholder:text-gray-400 text-lg"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
              className="w-full px-5 py-4 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-[#0072CE] outline-none transition
                         placeholder:text-gray-400 text-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 rounded-lg bg-[#0072CE] text-white font-bold hover:bg-[#005bb5] disabled:opacity-60 transition shadow-md"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Professional Library Management System
        </p>
      </div>

      {/* Bottom Big Text */}
      <div className="absolute bottom-6 md:bottom-12 z-0">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white/50 tracking-widest">
          BRAIN STATION 23
        </h1>
      </div>
    </div>
  );
}
