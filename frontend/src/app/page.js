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
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const heroImages = [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1631217816660-ad353559882b?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1920&q=80",
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

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

  const steps = [
    {
      icon: <Users size={22} className="text-[#74B49B]" />,
      title: "Register & Login",
      text: "Patients, doctors, and admins securely access their dedicated areas.",
    },
    {
      icon: <ClipboardList size={22} className="text-[#BAC94A]" />,
      title: "Manage Healthcare Tasks",
      text: "Book appointments, handle reports, prescriptions, and patient records easily.",
    },
    {
      icon: <Hospital size={22} className="text-[#6C8CBF]" />,
      title: "Deliver Better Care",
      text: "Use connected workflows to improve care quality and staff productivity.",
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

  return (
    <div className="min-h-screen bg-[#F8FBF9] dark:bg-[#16221F] text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-500 scroll-smooth">
      <Navbar />

      {/* HERO */}
      <section id="home" className="relative h-[90vh] min-h-[600px] w-full overflow-hidden scroll-mt-24">
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                currentImage === idx ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
              style={{
                backgroundImage: `url('${img}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent dark:from-[#16221F]/90 dark:via-[#16221F]/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#74B49B]/20 text-[#A7D7C5] text-sm font-bold border border-[#74B49B]/30 backdrop-blur-md">
              <Sparkles size={16} /> AI-Powered Health Management
            </span>

            <h1 className="text-5xl md:text-8xl font-black text-white leading-tight">
              Care Beyond <br /> <span className="text-[#74B49B]">Boundaries.</span>
            </h1>

            <p className="text-xl text-slate-200 max-w-xl leading-relaxed font-medium">
              Transforming healthcare delivery with an intuitive, light-green interface
              designed for doctors and built for patients.
            </p>

            <div className="flex flex-wrap gap-5 pt-4">
              <Link
                href="/register"
                className="px-8 py-4 rounded-full bg-[#74B49B] hover:bg-[#5C8D7A] text-white font-bold shadow-2xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
              >
                Join Now <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          <div className="absolute bottom-10 right-10 flex gap-4">
            <button
              onClick={() =>
                setCurrentImage((prev) => (prev - 1 + heroImages.length) % heroImages.length)
              }
              className="p-3 rounded-full border border-white/30 text-white hover:bg-[#74B49B] transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setCurrentImage((prev) => (prev + 1) % heroImages.length)}
              className="p-3 rounded-full border border-white/30 text-white hover:bg-[#74B49B] transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="relative z-20 -mt-16 max-w-6xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Active Doctors", val: "450+", icon: <Users /> },
            { label: "Patient Success", val: "98%", icon: <Activity /> },
            { label: "Secure Data", val: "256-bit", icon: <ShieldCheck /> },
            { label: "Global Clinics", val: "120+", icon: <HeartPulse /> },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1E2E2A] p-6 rounded-3xl shadow-xl border border-[#74B49B]/10 flex items-center gap-4"
            >
              <div className="p-3 bg-[#74B49B]/10 rounded-2xl text-[#74B49B]">{stat.icon}</div>
              <div>
                <p className="text-2xl font-black dark:text-white">{stat.val}</p>
                <p className="text-sm text-slate-500 font-bold">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 bg-white dark:bg-[#1C2925] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold dark:text-white">Healthcare Services</h2>
              <p className="text-[#74B49B] font-semibold mt-2">Core services designed for smarter care.</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-slate-500 hover:text-[#74B49B] font-bold transition-colors">
              Explore More <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {services.map((item, i) => (
              <div
                key={i}
                className="p-10 rounded-[36px] bg-[#F8FBF9] dark:bg-[#16221F] border border-slate-100 dark:border-white/5"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-6`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-7">{item.text}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-end mb-8">
              <h3 className="text-3xl font-bold dark:text-white">Browse by Specialists</h3>
              <Link href="/doctors" className="hidden md:flex items-center gap-2 text-slate-500 hover:text-[#74B49B] font-bold transition-colors">
                View All Doctors <ChevronRight size={20} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {specialists.map((spec, i) => (
                <div
                  key={i}
                  className="p-8 rounded-[32px] bg-[#F8FBF9] dark:bg-[#16221F] border border-transparent hover:border-[#74B49B]/30 text-center transition-all cursor-pointer group"
                >
                  <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">{spec.icon}</div>
                  <h4 className="font-bold dark:text-white">{spec.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{spec.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-[#F0F7F4] dark:bg-[#16221F] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white dark:bg-[#1E2E2A] rounded-[60px] p-8 md:p-16 shadow-2xl border border-[#74B49B]/20 flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <div className="w-12 h-12 bg-[#74B49B] rounded-2xl flex items-center justify-center text-white">
                <Zap size={24} />
              </div>

              <h2 className="text-4xl md:text-5xl font-black dark:text-white leading-tight">
                One Dashboard. <br />
                <span className="text-[#74B49B]">Unlimited Control.</span>
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-400">
                Monitor patient vitals, manage digital prescriptions, and chat with
                your medical team in real-time.
              </p>

              <ul className="space-y-4">
                {[
                  "Real-time bed availability",
                  "AI-assisted diagnosis",
                  "Secure vault",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={20} className="text-[#74B49B]" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80"
                alt="UI"
                className="rounded-3xl shadow-2xl border-4 border-[#74B49B]/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {features.map((item, i) => (
              <div
                key={i}
                className="p-10 rounded-[36px] bg-white dark:bg-[#1E2E2A] border border-[#74B49B]/10 shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#F8FBF9] dark:bg-[#20302C] shadow-sm flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-7">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-24 bg-white dark:bg-[#1C2925] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex px-4 py-2 rounded-full bg-[#6C8CBF]/15 text-[#6C8CBF] text-sm font-bold mb-4">
              User Roles
            </span>
            <h2 className="text-4xl font-bold dark:text-white">Built for every healthcare role</h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
              MediSync supports patients, doctors, and administrators with focused tools for each workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((item, i) => (
              <div
                key={i}
                className="p-10 rounded-[36px] bg-[#F8FBF9] dark:bg-[#16221F] border border-slate-100 dark:border-white/5"
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#20302C] shadow-sm flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-7">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-[#F0F7F4] dark:bg-[#16221F]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold dark:text-white mb-16">Trusted by Professionals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-10 rounded-[40px] bg-white dark:bg-[#1E2E2A] border border-slate-100 dark:border-white/5"
              >
                <div className="flex gap-1 mb-6 text-[#BAC94A]">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-300 italic mb-8">
                  "The transition was effortless. The light green UI helps keep our staff calm."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#74B49B]/30" />
                  <div>
                    <h5 className="font-bold dark:text-white">Dr. Smith</h5>
                    <p className="text-xs text-[#74B49B]">Head of Surgery</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white dark:bg-[#1C2925]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6C8CBF]/15 text-[#6C8CBF] text-sm font-bold mb-4">
              <HelpCircle size={16} />
              FAQ
            </span>
            <h2 className="text-4xl font-bold dark:text-white">Frequently asked questions</h2>
          </div>

          <div className="space-y-6">
            {faqs.map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-[28px] bg-[#F8FBF9] dark:bg-[#16221F] border border-[#74B49B]/10 shadow-sm"
              >
                <h3 className="text-xl font-bold dark:text-white mb-3">{item.q}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-7">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE APP */}
      <section className="py-24 overflow-hidden bg-[#F0F7F4] dark:bg-[#16221F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#74B49B] dark:bg-[#5C8D7A] rounded-[60px] p-12 md:p-24 flex flex-col lg:flex-row items-center relative">
            <div className="lg:w-1/2 text-white space-y-8 z-10">
              <h2 className="text-4xl md:text-6xl font-black leading-tight">
                Healthcare in <br /> your pocket.
              </h2>
              <p className="text-xl text-white/80">
                Download the MediSync app to manage appointments and consult with doctors on the go.
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

            <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80"
                alt="Mobile App"
                className="w-72 md:w-96 mx-auto rounded-[3rem] shadow-2xl rotate-6 transition-transform"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/10 blur-3xl rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section id="contact" className="py-24 bg-white dark:bg-[#1C2925] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#74B49B] dark:bg-[#5C8D7A] p-12 md:p-20 rounded-[60px] text-center text-white relative overflow-hidden">
            <h2 className="text-4xl md:text-6xl font-black mb-6">Start Your Digital Clinic</h2>
            <p className="text-lg text-white/85 max-w-2xl mx-auto mb-8">
              Improve care delivery, reduce admin workload, and create a better patient experience with MediSync.
            </p>
            <Link
              href="/register"
              className="inline-flex px-12 py-5 bg-white text-[#74B49B] font-black rounded-full text-lg shadow-2xl"
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