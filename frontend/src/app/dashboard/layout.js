'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import {
  Heart, Calendar, User, LogOut, Settings,
  Activity, ShieldCheck, ClipboardList, Users, Menu, X, Video,
  ChevronLeft, ChevronRight, Building2, Search, CreditCard, Undo
} from 'lucide-react';

import { API_URL } from '@/utils/api';
import Footer from '@/components/Footer';

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    setIsSidebarOpen(false);
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5FBF7] text-slate-600">
        <div className="text-lg">Loading session...</div>
      </div>
    );
  }

  const roleMenus = {
    user: [
      { name: 'Health Vitals', icon: <Heart size={20} />, path: '/dashboard/user' },
      { name: 'Find Doctors', icon: <Search size={20} />, path: '/dashboard/user/find-doctors' },
      { name: 'Appointments', icon: <Calendar size={20} />, path: '/dashboard/user/appointments' },
      { name: 'Telemedicine', icon: <Video size={20} />, path: '/dashboard/user/meetings' },
      { name: 'Prescription Scan', icon: <ClipboardList size={20} />, path: '/dashboard/user/prescription' },
      { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
    ],
    doctor: [
      { name: 'Overview', icon: <Activity size={20} />, path: '/dashboard/doctor' },
      { name: 'Doctor Profile', icon: <User size={20} />, path: '/dashboard/doctor/profile' },
      { name: 'Patients', icon: <Users size={20} />, path: '/dashboard/doctor/patients' },
      { name: 'Appointments', icon: <Calendar size={20} />, path: '/dashboard/doctor/appointments' },
      { name: 'Meetings', icon: <Video size={20} />, path: '/dashboard/doctor/meetings' },
      { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
    ],
    admin: [
      { name: 'Analytics', icon: <ShieldCheck size={20} />, path: '/dashboard/admin' },
      { name: 'Transactions', icon: <CreditCard size={20} />, path: '/dashboard/admin/transactions' },
      { name: 'Refunds', icon: <Undo size={20} />, path: '/dashboard/admin/refunds' },
      { name: 'Manage Appointments', icon: <Calendar size={20} />, path: '/dashboard/admin/appointments' },
      { name: 'Manage Doctors', icon: <User size={20} />, path: '/dashboard/admin/doctors' },
      { name: 'Manage Hospitals', icon: <Building2 size={20} />, path: '/dashboard/admin/hospitals' },
      { name: 'Manage Users', icon: <Users size={20} />, path: '/dashboard/admin/users' },
      { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
    ]
  };

  const menu = roleMenus[user.role] || [];

  return (
    <div className="flex min-h-screen w-screen bg-[#F6FAF8] text-slate-900 relative transition-colors duration-300">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/35 backdrop-blur-sm z-40 md:hidden animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`hidden md:flex fixed md:sticky top-0 h-screen z-50 bg-[#EEF7F1] border-r border-[#D7EBDD] flex-col transition-all duration-300 ease-in-out shadow-[8px_0_30px_rgba(116,180,155,0.08)] ${
          isCollapsed ? 'w-20 p-4' : 'w-64 p-6'
        }`}
      >
        <div className="flex items-center justify-between pb-6 border-b border-[#D7EBDD] mb-6">
          <Link
            href="/"
            className={`flex items-center transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className={`${isCollapsed ? 'w-10 h-10' : 'h-12 w-auto'} overflow-hidden`}>
              <img
                src="/logo.png"
                alt="MediSync"
                className={`h-full w-auto object-contain ${isCollapsed ? 'object-left' : ''}`}
              />
            </div>
          </Link>

          <button
            className="md:hidden text-[#5C8D7A] hover:text-[#2F8F68]"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          {menu.map((item, idx) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={idx}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#DDF2E8] text-[#2F8F68] border border-[#BFE3CC] shadow-sm'
                    : 'text-[#5F6F68] hover:bg-[#E4F3EA] hover:text-[#2F8F68]'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
                title={isCollapsed ? item.name : ""}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!isCollapsed && (
                  <span className="animate-[fadeIn_0.2s_ease-out]">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-[#D7EBDD] flex flex-col gap-2">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[#5F6F68] hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
            onClick={() => setShowLogoutConfirm(true)}
            title={isCollapsed ? "Logout" : ""}
          >
            <div className="flex-shrink-0"><LogOut size={20} /></div>
            {!isCollapsed && <span className="animate-[fadeIn_0.2s_ease-out]">Logout</span>}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center p-2 rounded-2xl bg-[#DDF2E8] hover:bg-[#CFE9DB] mt-1 text-[#5C8D7A] hover:text-[#2F8F68] transition-all duration-200"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col bg-[#F6FAF8]">
        <header className="flex items-center justify-between p-3 md:px-10 md:py-5 border-b border-[#E3EEE7] sticky top-0 bg-white/85 backdrop-blur-md z-30 w-full">
          <Link href="/" className="flex items-center">
            <div className="h-10 md:h-16 w-auto overflow-hidden">
              <img src="/logo.png" alt="MediSync" className="h-full w-auto object-contain" />
            </div>
          </Link>

          <div className="hidden md:block">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <Link href="/" className="hover:text-slate-700 transition-all">Home</Link> /{' '}
              <span className="text-slate-800 capitalize">
                {pathname.split('/').pop() || 'Overview'}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentTime && (
              <div className="hidden md:flex items-center gap-2 bg-[#F3F8F5] px-3 py-1.5 rounded-xl border border-[#DDE8E1] text-slate-600 font-semibold text-xs transition-all duration-300">
                <span className="opacity-80">
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-400 opacity-60"></span>
                <span className="tabular-nums text-[#4F7EA8]">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            )}

            <div className="hidden md:flex items-center gap-2 bg-[#F3F8F5] px-3 py-1.5 rounded-xl border border-[#DDE8E1]">
              <div className="w-8 h-8 rounded-full bg-[#EAF3F8] flex items-center justify-center text-[#4F7EA8] font-bold text-xs uppercase overflow-hidden border border-[#DDE8E1]">
                {user?.profilePicture ? (
                  <img src={`${API_URL}${user.profilePicture}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name[0]
                )}
              </div>
              <span className="text-sm font-medium text-slate-800">{user.name}</span>
            </div>

            <button
              className="md:hidden p-2 bg-[#EAF7F1] rounded-lg text-[#2F8F68]"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-10 pb-24 md:pb-10">
          {children}
        </div>

        <Footer />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] grid grid-cols-5 border-t border-[#D7EBDD] bg-white/95 pb-safe pt-1 backdrop-blur-md md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        {menu.slice(0, 5).map((item, idx) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={idx}
              href={item.path}
              className={`flex flex-col items-center justify-center py-2 transition-colors ${
                isActive ? 'text-[#2F8F68]' : 'text-[#5F6F68]'
              }`}
            >
              <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
                {item.icon}
              </div>
              <span className={`mt-1 text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.name.split(' ')[0]}
              </span>
              {isActive && (
                <div className="absolute top-0 h-0.5 w-8 rounded-full bg-[#2F8F68]" />
              )}
            </Link>
          );
        })}
      </nav>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-sm p-6 text-center flex flex-col items-center gap-4 bg-white border border-slate-200 rounded-[28px] shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <LogOut size={22} className="relative left-0.5" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Ending Session</h3>
              <p className="text-slate-500 text-sm">
                Are you sure you want to log out from the dashboard?
              </p>
            </div>

            <div className="flex gap-3 w-full mt-2">
              <button
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="flex-1 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 px-4 py-3 text-xs font-semibold text-white shadow-lg hover:-translate-y-0.5 transition"
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}