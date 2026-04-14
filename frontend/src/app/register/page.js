"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Activity,
  Eye,
  EyeOff,
  Sparkles,
  HeartPulse,
  Stethoscope,
  BadgeCheck,
} from "lucide-react";
import { API_URL } from "@/utils/api";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Register() {
  const [step, setStep] = useState("EMAIL");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [isOtpEnabled, setIsOtpEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  useEffect(() => {
    fetch(`${API_URL}/auth/otp/config`)
      .then((res) => res.json())
      .then((data) => setIsOtpEnabled(data.isOtpEnabled))
      .catch((err) => console.error("Failed to fetch OTP config", err));
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isOtpEnabled) {
        setStep("DETAILS");
        return;
      }

      const res = await fetch(`${API_URL}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setStep("OTP");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");

      setVerificationToken(data.verificationToken);
      setStep("DETAILS");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          verificationToken: isOtpEnabled ? verificationToken : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register");
      register(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepTitle =
    step === "EMAIL"
      ? "Create Account"
      : step === "OTP"
      ? "Verify Email"
      : "Complete Profile";

  const stepText =
    step === "EMAIL"
      ? "Join the secure healthcare network."
      : step === "OTP"
      ? "Enter the 6-digit code sent to your email."
      : "Finish setting up your MediSync account.";

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FBF9]">
      <style jsx>{`
        .register-float {
          animation: registerFloat 5.5s ease-in-out infinite;
        }

        .register-glow {
          animation: registerGlow 3.8s ease-in-out infinite;
        }

        @keyframes registerFloat {
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

        @keyframes registerGlow {
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
                  "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f1f1a]/80 via-[#16342d]/60 to-[#74B49B]/35" />

            <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-[#74B49B]/25 blur-3xl register-glow" />
            <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-[#BAC94A]/20 blur-3xl register-glow" />

            <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 text-white xl:p-14">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-md">
                  <Sparkles size={16} /> Connected Healthcare Platform
                </span>

                <h1 className="mt-8 text-5xl font-black leading-[1.02] xl:text-6xl">
                  Build your
                  <br />
                  <span className="text-[#CFF4E7]">MediSync profile.</span>
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-8 text-white/85">
                  Create a secure account to access appointments, healthcare
                  workflows, patient support tools, and smart medical services in
                  one place.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md register-float">
                  <HeartPulse size={22} className="mb-3 text-[#D9FBEF]" />
                  <p className="text-sm font-bold">Patient Access</p>
                  <p className="mt-1 text-xs text-white/80">Health journey in one portal</p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md register-float">
                  <Stethoscope size={22} className="mb-3 text-[#D9FBEF]" />
                  <p className="text-sm font-bold">Doctor Workspace</p>
                  <p className="mt-1 text-xs text-white/80">Clinical tools and records</p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md register-float">
                  <BadgeCheck size={22} className="mb-3 text-[#D9FBEF]" />
                  <p className="text-sm font-bold">Admin Control</p>
                  <p className="mt-1 text-xs text-white/80">Secure role-based access</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfa_100%)] p-6 md:p-10">
            <div className="absolute -top-12 right-8 h-40 w-40 rounded-full bg-[#74B49B]/10 blur-3xl" />
            <div className="absolute bottom-10 left-0 h-48 w-48 rounded-full bg-[#6C8CBF]/10 blur-3xl" />

            <div className="relative z-10 w-full max-w-[520px] rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-10">
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-20 w-auto items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="MediSync Logo"
                    className="h-full w-auto object-contain"
                  />
                </div>

                <div className="mb-5 flex items-center justify-center gap-2">
                  <div
                    className={`h-2.5 w-10 rounded-full ${
                      step === "EMAIL" ? "bg-[#74B49B]" : "bg-[#74B49B]/30"
                    }`}
                  />
                  <div
                    className={`h-2.5 w-10 rounded-full ${
                      step === "OTP" ? "bg-[#74B49B]" : "bg-[#74B49B]/30"
                    }`}
                  />
                  <div
                    className={`h-2.5 w-10 rounded-full ${
                      step === "DETAILS" ? "bg-[#74B49B]" : "bg-[#74B49B]/30"
                    }`}
                  />
                </div>

                <h2 className="text-3xl font-black text-slate-800 md:text-4xl">
                  {stepTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {stepText}
                </p>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-600">
                  {error}
                </div>
              )}

              {step === "EMAIL" && (
                <form onSubmit={handleSendOtp} className="mt-8 flex flex-col gap-5">
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
                    <ShieldCheck
                      size={18}
                      className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-all duration-300 focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/15"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="user">Patient (User)</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(92,141,122,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(92,141,122,0.34)] disabled:opacity-70"
                  >
                    {loading
                      ? "Processing..."
                      : isOtpEnabled
                      ? "Send Verification Code"
                      : "Continue"}{" "}
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {step === "OTP" && (
                <form onSubmit={handleVerifyOtp} className="mt-8 flex flex-col gap-5">
                  <div className="relative">
                    <Activity
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-11 pr-4 text-center text-xl font-bold tracking-[0.6em] text-slate-800 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-300 focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/15"
                      placeholder="000000"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(92,141,122,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(92,141,122,0.34)] disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Verify Email"}{" "}
                    <ArrowRight size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("EMAIL")}
                    className="text-center text-xs text-slate-500 transition-colors hover:text-[#5AA7A7]"
                  >
                    Change Email
                  </button>
                </form>
              )}

              {step === "DETAILS" && (
                <form
                  onSubmit={handleSubmitRegistration}
                  className="mt-8 flex flex-col gap-5"
                >
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/15"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                    disabled={loading}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(92,141,122,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(92,141,122,0.34)] disabled:opacity-70"
                  >
                    {loading ? "Finalizing..." : "Complete Registration"}{" "}
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}

              <div className="mt-8">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-[#F8FBF9] px-3 py-3">
                    <p className="text-base font-black text-slate-800">Easy</p>
                    <p className="text-[11px] text-slate-500">Quick onboarding</p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FBF9] px-3 py-3">
                    <p className="text-base font-black text-slate-800">Secure</p>
                    <p className="text-[11px] text-slate-500">Protected access</p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FBF9] px-3 py-3">
                    <p className="text-base font-black text-slate-800">Smart</p>
                    <p className="text-[11px] text-slate-500">Connected workflow</p>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#5AA7A7] hover:underline"
                >
                  Login here
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