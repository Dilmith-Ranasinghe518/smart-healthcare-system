'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import {
  Heart, Calendar, User, LogOut, Settings,
  Activity, ShieldCheck, ClipboardList, Users, Menu, X, Video,
  ChevronLeft, ChevronRight, Building2, Search, CreditCard, Undo,
  Zap, CalendarPlus, SearchIcon, Scan, FileText, UserCircle, BarChart3, Plus
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

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  // Prevent scrolling when quick actions are open
  useEffect(() => {
    if (isQuickActionsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isQuickActionsOpen]);

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

  const quickActions = {
    user: [
      { name: 'Book Appointment', icon: <CalendarPlus size={20} />, path: '/dashboard/user/find-doctors', color: 'bg-emerald-50 text-emerald-600' },
      { name: 'Find Doctors', icon: <SearchIcon size={20} />, path: '/dashboard/user/find-doctors', color: 'bg-blue-50 text-blue-600' },
      { name: 'Scan Prescription', icon: <Scan size={20} />, path: '/dashboard/user/prescription', color: 'bg-purple-50 text-purple-600' },
      { name: 'Medical Records', icon: <FileText size={20} />, path: '/dashboard/user', color: 'bg-amber-50 text-amber-600' },
    ],
    doctor: [
      { name: 'Start Meeting', icon: <Video size={20} />, path: '/dashboard/doctor/meetings', color: 'bg-emerald-50 text-emerald-600' },
      { name: 'Patient Lookup', icon: <Users size={20} />, path: '/dashboard/doctor/patients', color: 'bg-blue-50 text-blue-600' },
      { name: 'Today\'s Schedule', icon: <Calendar size={20} />, path: '/dashboard/doctor/appointments', color: 'bg-purple-50 text-purple-600' },
      { name: 'View Profile', icon: <UserCircle size={20} />, path: '/dashboard/doctor/profile', color: 'bg-amber-50 text-amber-600' },
    ]
  };

  const menu = roleMenus[user.role] || [];
  const actions = quickActions[user.role] || [];

  return (
    <div className="flex h-screen w-screen bg-[#F6FAF8] text-slate-900 relative transition-colors duration-300 overflow-hidden">

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

            {/* Mobile Quick Action Trigger */}
            {(user.role === 'user' || user.role === 'doctor') && (
              <button
                onClick={() => setIsQuickActionsOpen(true)}
                className="md:hidden p-2 bg-[#EEF7F1] text-[#2F8F68] rounded-xl active:scale-95 transition-all shadow-sm"
              >
                <Zap size={22} fill="currentColor" className="opacity-80" />
              </button>
            )}
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

      {/* Mobile Quick Actions Side Drawer */}
      {isQuickActionsOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] md:hidden"
          onClick={() => setIsQuickActionsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white z-[120] md:hidden transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.1)] ${
          isQuickActionsOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
           <div>
              <h3 className="font-black text-slate-800">Quick Actions</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.role} workspace</p>
           </div>
           <button
             onClick={() => setIsQuickActionsOpen(false)}
             className="p-2 bg-slate-50 text-slate-400 rounded-full"
           >
             <X size={20} />
           </button>
        </div>

        <div className="flex-1 p-6 space-y-3">
          {actions.map((action, idx) => (
             <Link
               key={idx}
               href={action.path}
               onClick={() => setIsQuickActionsOpen(false)}
               className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FBF9] hover:bg-[#EEF7F1] border border-[#ECF4F0] transition-all group"
             >
                <div className={`p-2.5 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                   {action.icon}
                </div>
                <span className="font-bold text-slate-700 text-sm">{action.name}</span>
             </Link>
          ))}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 italic">
           <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-black opacity-40">Powered by MediSync AI</p>
        </div>
      </div>
    </div>
  );
}