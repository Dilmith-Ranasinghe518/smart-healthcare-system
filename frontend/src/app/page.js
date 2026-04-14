"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  HeartPulse,
  ShieldCheck,
  ArrowRight,
  CalendarCheck,
  Stethoscope,
  Users,
  FileText,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  Smartphone,
  MousePointer2,
  Clock3,
  MessageSquare,
  ClipboardList,
  Hospital,
  HelpCircle,
  Play,
  ScanHeart,
  Building2,
  BadgeCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const heroImages = [
    "https://i.pinimg.com/1200x/6c/20/17/6c2017d711da0a3178ad462e463cd824.jpg",
    "https://i.pinimg.com/1200x/27/7f/89/277f89c8acebda4c270a4affabc1267f.jpg",
    "https://i.pinimg.com/1200x/55/69/bb/5569bb0730a82c461b7f043001aadd0d.jp",
  ];

  const showcaseImages = [
    "https://i.pinimg.com/1200x/55/69/bb/5569bb0730a82c461b7f043001aadd0d.jpg",
    "https://i.pinimg.com/736x/8e/23/27/8e232727375aaf0359375b81f378240e.jpg",
    "https://i.pinimg.com/1200x/94/11/f2/9411f25c2e07a7e962036a89be017e64.jpg",
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const [currentShowcase, setCurrentShowcase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShowcase((prev) => (prev + 1) % showcaseImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [showcaseImages.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show-section");
        });
      },
      { threshold: 0.15 }
    );

    const sections = document.querySelectorAll(".reveal-section");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: <CalendarCheck size={24} className="text-[#74B49B]" />,
      title: "Patient Scheduling",
      text: "Smart booking system that optimizes clinic hours and reduces patient wait times.",
      bg: "bg-[#74B49B]/10",
    },
    {
      icon: <Stethoscope size={24} className="text-[#8EAC50]" />,
      title: "Clinical Workflow",
      text: "Digitize the entire consultation process from check-in to digital prescription.",
      bg: "bg-[#8EAC50]/10",
    },
    {
      icon: <FileText size={24} className="text-[#5C8D7A]" />,
      title: "Health Analytics",
      text: "Real-time data insights to track patient recovery and clinic performance.",
      bg: "bg-[#5C8D7A]/10",
    },
  ];

  const specialists = [
    { name: "Cardiology", icon: "❤️", count: "12 Doctors" },
    { name: "Neurology", icon: "🧠", count: "8 Doctors" },
    { name: "Pediatrics", icon: "🧸", count: "15 Doctors" },
    { name: "Dental", icon: "🦷", count: "10 Doctors" },
    { name: "Optometry", icon: "👁️", count: "6 Doctors" },
    { name: "Orthopedic", icon: "🦴", count: "9 Doctors" },
  ];

  const features = [
    {
      icon: <ShieldCheck size={22} className="text-[#74B49B]" />,
      title: "Secure Data Access",
      text: "Protect patient records with role-based access and secure medical workflows.",
    },
    {
      icon: <Clock3 size={22} className="text-[#BAC94A]" />,
      title: "Faster Operations",
      text: "Reduce delays in appointments, prescriptions, and daily hospital coordination.",
    },
    {
      icon: <MessageSquare size={22} className="text-[#6C8CBF]" />,
      title: "Connected Communication",
      text: "Keep doctors, staff, labs, and patients connected in one healthcare system.",
    },
  ];

  const roles = [
    {
      icon: <HeartPulse size={24} className="text-[#74B49B]" />,
      title: "For Patients",
      text: "Book appointments, access reports, and manage your healthcare journey with ease.",
    },
    {
      icon: <Stethoscope size={24} className="text-[#BAC94A]" />,
      title: "For Doctors",
      text: "Handle consultations, records, and prescriptions from one organized workspace.",
    },
    {
      icon: <ShieldCheck size={24} className="text-[#6C8CBF]" />,
      title: "For Admins",
      text: "Manage operations, users, and clinical workflows securely and efficiently.",
    },
  ];

  const faqs = [
    {
      q: "Can patients book appointments online?",
      a: "Yes. Patients can quickly book appointments and manage schedules through the system.",
    },
    {
      q: "Can doctors access patient history?",
      a: "Yes. Doctors can securely review consultation history, reports, and treatment details.",
    },
    {
      q: "Is the system mobile friendly?",
      a: "Yes. The platform is designed to work smoothly across desktop, tablet, and mobile devices.",
    },
  ];

  const floatingStats = [
    {
      icon: <ScanHeart size={18} />,
      title: "Live Monitoring",
      text: "Vitals synced",
      top: "top-[18%]",
      right: "right-[12%]",
      rotate: "rotate-[8deg]",
    },
    {
      icon: <Building2 size={18} />,
      title: "120+ Clinics",
      text: "Connected network",
      top: "top-[58%]",
      right: "right-[8%]",
      rotate: "-rotate-[6deg]",
    },
    {
      icon: <BadgeCheck size={18} />,
      title: "Trusted Care",
      text: "Verified doctors",
      top: "top-[70%]",
      left: "left-[58%]",
      rotate: "rotate-[5deg]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FBF9] text-slate-800 flex flex-col scroll-smooth">
      <style jsx>{`
        .reveal-section {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }

        .show-section {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-float {
          animation: heroFloat 5s ease-in-out infinite;
        }

        .hero-float-delay {
          animation: heroFloat 6.5s ease-in-out infinite;
        }

        .pulse-soft {
          animation: pulseSoft 2.8s ease-in-out infinite;
        }

        .slow-spin {
          animation: slowSpin 14s linear infinite;
        }

        @keyframes heroFloat {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes pulseSoft {
          0% {
            transform: scale(1);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.06);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.65;
          }
        }

        @keyframes slowSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <Navbar />

      <section
        id="home"
        className="relative h-[95vh] min-h-[720px] w-full overflow-hidden scroll-mt-24"
      >
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-[1600ms] ease-in-out ${
                currentImage === idx
                  ? "opacity-100 scale-105"
                  : "opacity-0 scale-100"
              }`}
              style={{
                backgroundImage: `url('${img}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#07130f]/80 via-[#0c1a16]/55 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07130f]/55 via-transparent to-[#07130f]/10" />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 overflow-hidden z-[1]">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#74B49B]/20 blur-3xl pulse-soft" />
          <div className="absolute top-32 right-16 w-72 h-72 rounded-full bg-[#6C8CBF]/20 blur-3xl pulse-soft" />
          <div className="absolute bottom-16 left-1/3 w-64 h-64 rounded-full bg-[#BAC94A]/20 blur-3xl pulse-soft" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-10 items-center w-full">
            <div className="max-w-3xl space-y-7">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#74B49B]/20 text-[#DFF7EE] text-sm font-bold border border-[#74B49B]/30 backdrop-blur-md shadow-lg">
                <Sparkles size={16} /> AI-Powered Health Management
              </span>

              <h1 className="text-5xl md:text-7xl xl:text-8xl font-black text-white leading-[0.95] tracking-tight">
                Care Beyond
                <br />
                <span className="text-[#74B49B]">Boundaries.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-200 max-w-xl leading-relaxed font-medium">
                Transforming healthcare delivery with an intuitive, elegant
                platform designed for hospitals, doctors, and patients in one
                connected experience.
              </p>

              <div className="flex flex-wrap gap-4 pt-3">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-full bg-[#74B49B] hover:bg-[#5C8D7A] text-white font-bold shadow-2xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
                >
                  Join Now <ArrowRight size={20} />
                </Link>

                <Link
                  href="/doctors"
                  className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-bold transition-all flex items-center gap-2"
                >
                  <Play size={18} /> Explore Services
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 max-w-2xl">
                {[
                  { value: "450+", label: "Doctors" },
                  { value: "98%", label: "Success Rate" },
                  { value: "24/7", label: "Support" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 px-4 py-4 text-white"
                  >
                    <p className="text-2xl md:text-3xl font-black">
                      {item.value}
                    </p>
                    <p className="text-xs md:text-sm text-slate-200 mt-1">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:flex items-center justify-center min-h-[620px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[430px] h-[430px] rounded-full border border-white/10 slow-spin" />
                <div className="absolute w-[300px] h-[300px] rounded-full border border-[#74B49B]/20" />
              </div>

              <div className="relative w-[540px] h-[540px]">
                <div className="absolute inset-10 rounded-[38px] overflow-hidden shadow-2xl border border-white/15 hero-float">
                  {showcaseImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Healthcare showcase"
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        currentShowcase === idx ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
                </div>

                {floatingStats.map((item, index) => (
                  <div
                    key={index}
                    className={`absolute ${item.top} ${item.right || ""} ${item.left || ""} ${item.rotate} bg-white/85 backdrop-blur-md rounded-2xl px-4 py-3 shadow-2xl border border-white/50 hero-float-delay`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#74B49B]/15 text-[#5C8D7A] flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="absolute bottom-0 left-8 bg-white/90 backdrop-blur-md rounded-2xl px-5 py-4 shadow-2xl border border-white/50 hero-float">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#6C8CBF]/15 text-[#6C8CBF] flex items-center justify-center">
                      <Hospital size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Smart Hospital Flow
                      </p>
                      <p className="text-xs text-slate-500">
                        Connected patients, doctors, admins
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 right-10 flex gap-4">
            <button
              onClick={() =>
                setCurrentImage(
                  (prev) => (prev - 1 + heroImages.length) % heroImages.length
                )
              }
              className="p-3 rounded-full border border-white/30 text-white hover:bg-[#74B49B] transition-all backdrop-blur-md"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() =>
                setCurrentImage((prev) => (prev + 1) % heroImages.length)
              }
              className="p-3 rounded-full border border-white/30 text-white hover:bg-[#74B49B] transition-all backdrop-blur-md"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-16 max-w-6xl mx-auto px-6 w-full reveal-section">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Active Doctors", val: "450+", icon: <Users /> },
            { label: "Patient Success", val: "98%", icon: <Activity /> },
            { label: "Secure Data", val: "256-bit", icon: <ShieldCheck /> },
            { label: "Global Clinics", val: "120+", icon: <HeartPulse /> },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-[#74B49B]/10 flex items-center gap-4 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="p-3 bg-[#74B49B]/10 rounded-2xl text-[#74B49B] shadow-sm">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-black">{stat.val}</p>
                <p className="text-sm text-slate-500 font-bold">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="services"
        className="py-24 bg-white scroll-mt-24 reveal-section"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="inline-flex px-4 py-2 rounded-full bg-[#74B49B]/10 text-[#5C8D7A] text-sm font-bold mb-4">
                Core Services
              </span>
              <h2 className="text-4xl font-bold">Healthcare Services</h2>
              <p className="text-[#74B49B] font-semibold mt-2">
                Core services designed for smarter care.
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-slate-500 hover:text-[#74B49B] font-bold transition-colors">
              Explore More <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {services.map((item, i) => (
              <div
                key={i}
                className="group p-10 rounded-[36px] bg-[#F8FBF9] border border-slate-100 hover:border-[#74B49B]/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-6 shadow-sm`}
                >
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-7">{item.text}</p>
                <div className="mt-6 text-sm font-bold text-[#5C8D7A] flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  Learn More <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-3xl font-bold">Browse by Specialists</h3>
                  <p className="text-slate-500 mt-2">
                    Discover categories of expert care with quick access.
                  </p>
                </div>
                <Link
                  href="/doctors"
                  className="hidden md:flex items-center gap-2 text-slate-500 hover:text-[#74B49B] font-bold transition-colors"
                >
                  View All Doctors <ChevronRight size={20} />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {specialists.map((spec, i) => (
                  <div
                    key={i}
                    className="p-8 rounded-[32px] bg-[#F8FBF9] border border-transparent hover:border-[#74B49B]/30 hover:shadow-lg text-center transition-all cursor-pointer group"
                  >
                    <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">
                      {spec.icon}
                    </div>
                    <h4 className="font-bold">{spec.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{spec.count}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80"
                alt="Specialist care"
                className="w-full h-[430px] object-cover rounded-[36px] shadow-2xl"
              />
              <div className="absolute inset-0 rounded-[36px] bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/85 backdrop-blur-md rounded-2xl p-5 shadow-xl">
                <p className="text-sm text-[#5C8D7A] font-bold mb-1">
                  Specialist Discovery
                </p>
                <h4 className="text-xl font-black text-slate-800">
                  Find the right doctor faster
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  Search by specialty, availability, and hospital network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="py-24 bg-[#F0F7F4] scroll-mt-24 reveal-section"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[60px] p-8 md:p-16 shadow-2xl border border-[#74B49B]/20 flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <div className="w-12 h-12 bg-[#74B49B] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Zap size={24} />
              </div>

              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                One Dashboard.
                <br />
                <span className="text-[#74B49B]">Unlimited Control.</span>
              </h2>

              <p className="text-lg text-slate-600">
                Monitor patient vitals, manage digital prescriptions, and
                coordinate with your medical team in real-time.
              </p>

              <ul className="space-y-4">
                {[
                  "Real-time bed availability",
                  "AI-assisted diagnosis",
                  "Secure vault",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 font-bold text-slate-700"
                  >
                    <CheckCircle2 size={20} className="text-[#74B49B]" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:w-1/2 relative">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80"
                alt="UI"
                className="rounded-3xl shadow-2xl border-4 border-[#74B49B]/10"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 hero-float">
                <p className="text-xs text-slate-500 font-semibold">
                  Secure Workflow
                </p>
                <p className="text-sm font-black text-slate-800 mt-1">
                  Reports, records, and monitoring unified
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {features.map((item, i) => (
              <div
                key={i}
                className="p-10 rounded-[36px] bg-white border border-[#74B49B]/10 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#F8FBF9] shadow-sm flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-7">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="roles"
        className="py-24 bg-white scroll-mt-24 reveal-section"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex px-4 py-2 rounded-full bg-[#6C8CBF]/15 text-[#6C8CBF] text-sm font-bold mb-4">
              User Roles
            </span>
            <h2 className="text-4xl font-bold">Built for every healthcare role</h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
              MediSync supports patients, doctors, and administrators with focused
              tools for each workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((item, i) => (
              <div
                key={i}
                className="p-10 rounded-[36px] bg-[#F8FBF9] border border-slate-100 hover:border-[#74B49B]/25 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-7">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#F0F7F4] reveal-section">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-16">Trusted by Professionals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-10 rounded-[40px] bg-white border border-slate-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex gap-1 mb-6 text-[#BAC94A]">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-lg text-slate-600 italic mb-8">
                  "The transition was effortless. The light green UI helps keep
                  our staff calm and our workflows clear."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#74B49B]/30" />
                  <div>
                    <h5 className="font-bold">Dr. Smith</h5>
                    <p className="text-xs text-[#74B49B]">Head of Surgery</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white reveal-section">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6C8CBF]/15 text-[#6C8CBF] text-sm font-bold mb-4">
              <HelpCircle size={16} />
              FAQ
            </span>
            <h2 className="text-4xl font-bold">Frequently asked questions</h2>
          </div>

          <div className="space-y-6">
            {faqs.map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-[28px] bg-[#F8FBF9] border border-[#74B49B]/10 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <h3 className="text-xl font-bold mb-3">{item.q}</h3>
                <p className="text-slate-600 leading-7">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 overflow-hidden bg-[#F0F7F4] reveal-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#74B49B] rounded-[60px] p-12 md:p-24 flex flex-col lg:flex-row items-center relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full bg-white/10 blur-2xl" />

            <div className="lg:w-1/2 text-white space-y-8 z-10">
              <h2 className="text-4xl md:text-6xl font-black leading-tight">
                Healthcare in
                <br /> your pocket.
              </h2>
              <p className="text-xl text-white/80">
                Download the MediSync app to manage appointments and consult with
                doctors on the go.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-white text-[#74B49B] rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all">
                  <Smartphone /> App Store
                </button>
                <button className="px-8 py-4 bg-black/20 border border-white/30 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-black/30 transition-all">
                  <MousePointer2 /> Google Play
                </button>
              </div>
            </div>

            <div className="lg:w-1/2 mt-12 lg:mt-0 relative z-10">
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80"
                alt="Mobile App"
                className="w-72 md:w-96 mx-auto rounded-[3rem] shadow-2xl rotate-6 transition-transform hero-float"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/10 blur-3xl rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="py-24 bg-white scroll-mt-24 reveal-section"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#74B49B] p-12 md:p-20 rounded-[60px] text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]" />
            <h2 className="text-4xl md:text-6xl font-black mb-6 relative z-10">
              Start Your Digital Clinic
            </h2>
            <p className="text-lg text-white/85 max-w-2xl mx-auto mb-8 relative z-10">
              Improve care delivery, reduce admin workload, and create a better
              patient experience with MediSync.
            </p>
            <Link
              href="/register"
              className="inline-flex px-12 py-5 bg-white text-[#74B49B] font-black rounded-full text-lg shadow-2xl hover:scale-105 transition-all relative z-10"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}