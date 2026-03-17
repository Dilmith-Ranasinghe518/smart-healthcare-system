"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Activity, Eye, EyeOff } from "lucide-react";
import { API_URL } from "@/utils/api";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to login");
      login(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="glass-panel w-full max-w-[450px] animate-[fadeIn_0.5s_ease-out]">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Activity size={24} className="text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-400 text-sm">Sign in to access your portal node.</p>
          </div>

          {error && (
            <div className="text-rose-400 mb-4 text-center bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Mail size={18} className="text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                className="input-field pl-10 mb-0"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock size={18} className="text-slate-500 absolute left-3 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                className="input-field pl-10 pr-10 mb-0"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2 gap-2">
              Sign In <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center mt-6 text-slate-400 text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-indigo-400 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
