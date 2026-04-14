"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  HeartPulse,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { API_URL } from "@/utils/api";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

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
    <div className="flex min-h-screen flex-col bg-[#F8FBF9]">
      <style jsx>{`
        .login-float {
          animation: loginFloat 5s ease-in-out infinite;
        }

        .login-glow {
          animation: loginGlow 3.5s ease-in-out infinite;
        }

        @keyframes loginFloat {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes loginGlow {
          0% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.45;
            transform: scale(1);
          }
        }
      `}</style>

      <Navbar />

      <div className="flex-1 px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto grid min-h-[78vh] max-w-7xl overflow-hidden rounded-[36px] border border-[#74B49B]/15 bg-white shadow-[0_20px_80px_rgba(31,41,55,0.12)] lg:grid-cols-2">
          <div className="relative hidden overflow-hidden lg:flex">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f1f1a]/80 via-[#16342d]/60 to-[#74B49B]/35" />

            <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-[#74B49B]/25 blur-3xl login-glow" />
            <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-[#BAC94A]/20 blur-3xl login-glow" />

            <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 text-white xl:p-14">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-md">
                  <Sparkles size={16} /> Secure Healthcare Access
                </span>

                <h1 className="mt-8 text-5xl font-black leading-[1.02] xl:text-6xl">
                  Welcome back to
                  <br />
                  <span className="text-[#CFF4E7]">MediSync.</span>
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-8 text-white/85">
                  Access your healthcare workspace securely and continue managing
                  appointments, patient care, and records in one connected system.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md login-float">
                  <ShieldCheck size={22} className="mb-3 text-[#D9FBEF]" />
                  <p className="text-sm font-bold">Secure Access</p>
                  <p className="mt-1 text-xs text-white/80">Protected portal login</p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md login-float">
                  <HeartPulse size={22} className="mb-3 text-[#D9FBEF]" />
                  <p className="text-sm font-bold">Patient Ready</p>
                  <p className="mt-1 text-xs text-white/80">Track care with ease</p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md login-float">
                  <Stethoscope size={22} className="mb-3 text-[#D9FBEF]" />
                  <p className="text-sm font-bold">Doctor Workspace</p>
                  <p className="mt-1 text-xs text-white/80">Smarter clinical flow</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfa_100%)] p-6 md:p-10">
            <div className="absolute -top-12 right-8 h-40 w-40 rounded-full bg-[#74B49B]/10 blur-3xl" />
            <div className="absolute bottom-10 left-0 h-48 w-48 rounded-full bg-[#6C8CBF]/10 blur-3xl" />

            <div className="relative z-10 w-full max-w-[480px] rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-10">
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-20 w-auto items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="MediSync Logo"
                    className="h-full w-auto object-contain"
                  />
                </div>

                <h2 className="text-3xl font-black text-slate-800 md:text-4xl">
                  Welcome Back
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to continue to your healthcare portal.
                </p>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/15"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-11 pr-12 text-sm text-slate-800 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/15"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(92,141,122,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(92,141,122,0.34)]"
                >
                  Sign In <ArrowRight size={18} />
                </button>
              </form>

              <div className="mt-8">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-[#F8FBF9] px-3 py-3">
                    <p className="text-base font-black text-slate-800">24/7</p>
                    <p className="text-[11px] text-slate-500">System Access</p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FBF9] px-3 py-3">
                    <p className="text-base font-black text-slate-800">Secure</p>
                    <p className="text-[11px] text-slate-500">Role-based Login</p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FBF9] px-3 py-3">
                    <p className="text-base font-black text-slate-800">Fast</p>
                    <p className="text-[11px] text-slate-500">Connected Workflow</p>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#5AA7A7] hover:underline"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}