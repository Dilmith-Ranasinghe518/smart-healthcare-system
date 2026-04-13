"use client";

import Link from "next/link";
import { Activity, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="mt-auto border-t border-[#96D7C6]/40 dark:border-white/10 bg-white dark:bg-slate-950 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center mb-6">
              <div className="h-16 w-auto overflow-hidden">
                <img src="/logo.png" alt="MediSync Logo" className="h-full w-auto object-contain" />
              </div>
            </div>

            <p className="text-sm leading-7 text-slate-600 dark:text-slate-400 max-w-sm">
              MediSync helps patients, doctors, and administrators work together
              in one secure and easy healthcare platform.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Quick Links
            </h4>
            <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400">
              <Link href="#home" className="hover:text-[#5AA7A7]">Home</Link>
              <Link href="#services" className="hover:text-[#BAC94A]">Services</Link>
              <Link href="#features" className="hover:text-[#6C8CBF]">Features</Link>
              <Link href="#roles" className="hover:text-[#E2D36B]">Roles</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Services
            </h4>
            <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400">
              <p>Online Appointments</p>
              <p>Symptom Checker</p>
              <p>Doctor Consultations</p>
              <p>Medical Records</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Contact
            </h4>
            <div className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#5AA7A7]" />
                <span>support@medisync.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#BAC94A]" />
                <span>+94 77 123 4567</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#6C8CBF] mt-1" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#96D7C6]/40 dark:border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} MediSync. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Built with care for modern healthcare experiences.
          </p>
        </div>
      </div>
    </footer>
  );
}