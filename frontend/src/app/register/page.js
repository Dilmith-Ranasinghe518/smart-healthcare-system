"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, ShieldCheck, ArrowRight, Activity, Eye, EyeOff } from "lucide-react";
import { API_URL } from "@/utils/api";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register");
      register(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="glass-panel w-full max-w-[480px] animate-[fadeIn_0.5s_ease-out]">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-20 w-auto flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="MediSync Logo" className="h-full w-auto object-contain" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-br from-slate-800 dark:from-white to-slate-500 dark:to-slate-400 bg-clip-text text-transparent mb-2">
              Create Account
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Join the secure healthcare network.</p>
          </div>

          {error && (
            <div className="text-rose-400 mb-4 text-center bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <User size={18} className="text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                className="input-field pl-10 mb-0"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <ShieldCheck size={18} className="text-slate-500 absolute left-3 top-3.5 z-10" />
              <select 
                className="input-field pl-10 mb-0 appearance-none cursor-pointer" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="user" className="bg-slate-900">Patient (User)</option>
                <option value="doctor" className="bg-slate-900">Doctor</option>
                <option value="admin" className="bg-slate-900">Administrator</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2 gap-2">
              Sign Up <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center mt-6 text-slate-400 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
