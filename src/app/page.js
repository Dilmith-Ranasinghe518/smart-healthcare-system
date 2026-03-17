"use client";

import Link from "next/link";
import { Heart, ShieldCheck, Activity, ArrowRight, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="hero-gradient min-h-screen w-screen overflow-x-hidden bg-slate-950 text-white flex flex-col">
      {/* Shared Navbar */}
      <Navbar />

      {/* Main Hero Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center pt-16 pb-24 animate-[fadeIn_0.8s_ease-out] flex-1">
        
        {/* Left Column: CTA & Headline */}
        <div className="flex flex-col items-start">
          <span className="badge font-normal text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4 normal-case tracking-normal">
            ✨ Intelligent Healthcare Node Template
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
            Transforming Care, <br />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">One Node</span> At A Time.
          </h1>
          <p className="mt-6 mb-10 text-lg text-slate-400 max-w-lg leading-relaxed">
            A unified, premium ecosystem designed to bridge the gap between patients, physicians, and administrative nodes through scalable cloud frameworks.
          </p>
          <div className="flex gap-4">
            <Link href="/register" className="btn btn-primary px-8 py-4 gap-2">
              Get Started <ArrowRight size={20} />
            </Link>
            <Link href="/login" className="btn btn-secondary px-8 py-4">
              Demo Portal
            </Link>
          </div>
        </div>

        {/* Right Column: Floating Overlapping Dynamic Glass Display */}
        <div className="relative h-[380px] md:h-[450px] w-full flex items-center justify-center scale-90 md:scale-100 transition-transform duration-300">
          
          {/* Card 1: Vitals (Floating) */}
          <div className="glass-panel absolute top-2 left-2 md:top-5 md:left-5 w-56 md:w-60 z-10 float-up bg-slate-900/85 p-5 md:p-6 animate-[fadeIn_1s_0.2s_backwards]">
            <div className="flex justify-between mb-3 md:mb-4">
              <h4 className="text-xs text-slate-400">Live Pulse</h4>
              <Heart size={16} className="text-rose-500" />
            </div>
            <p className="text-2xl md:text-3xl font-bold">72 <span className="text-xs font-normal text-slate-400">BPM</span></p>
            <div className="h-1.5 md:h-2 rounded-full bg-slate-800 overflow-hidden mt-3">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: "72%" }}></div>
            </div>
          </div>

          {/* Card 2: Appointment Notice (Floating) */}
          <div className="glass-panel absolute bottom-5 right-2 md:bottom-8 md:right-5 w-60 md:w-64 z-10 float-down bg-slate-900/85 p-4 md:p-5 animate-[fadeIn_1s_0.4s_backwards]">
            <div className="flex gap-3 items-center">
              <div className="bg-emerald-500/10 p-1.5 md:p-2 rounded-lg">
                <Clock size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-slate-400">Next Consultation</p>
                <h4 className="text-xs md:text-sm font-semibold text-slate-100">Dr. Smith - 14:30</h4>
              </div>
            </div>
          </div>

          {/* Card 3: Main Dashboard Preview Layer */}
          <div className="glass-panel w-[280px] md:w-[320px] h-[260px] md:h-[300px] bg-slate-900/60 border border-white/5 rounded-3xl flex flex-col gap-4 p-5 md:p-6 translate-y-[-10px] md:translate-y-[-20px] z-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="flex-1 bg-white/2 rounded-xl p-4 flex items-center justify-center">
              <Activity size={56} className="text-indigo-500/40 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {[
            { icon: <Heart size={24} className="text-rose-500" />, bg: "bg-rose-500/10", title: "Patient Portal", text: "Register, monitor vital streams, and securely map appointments flawlessly." },
            { icon: <Activity size={24} className="text-emerald-500" />, bg: "bg-emerald-500/10", title: "Doctor Workspace", text: "Physician dashboards streamlined for queue management node updates." },
            { icon: <ShieldCheck size={24} className="text-indigo-400" />, bg: "bg-indigo-500/10", title: "Admin Management", text: "Detailed audit streams and secure access configuration restrict nodes." }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel stat-card p-8 text-left backdrop-blur-xl bg-slate-900/50">
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}

        </div>
      </div>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
