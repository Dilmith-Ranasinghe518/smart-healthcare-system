'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Heart, Calendar, User, LogOut, Settings, 
  Activity, ShieldCheck, ClipboardList, Users, Menu, X, Video 
} from 'lucide-react';

import Footer from '@/components/Footer';

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    // Close sidebar on page change for mobile
    setIsSidebarOpen(false);
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-400">
        <div className="text-lg">Loading session...</div>
      </div>
    );
  }

  const roleMenus = {
    user: [
      { name: 'Health Vitals', icon: <Heart size={20} />, path: '/dashboard/user' },
      { name: 'Appointments', icon: <Calendar size={20} />, path: '#' },
      { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
    ],
    doctor: [
      { name: 'Overview', icon: <Activity size={20} />, path: '/dashboard/doctor' },
      { name: 'Patients', icon: <Users size={20} />, path: '#' },
      { name: 'Schedule', icon: <Calendar size={20} />, path: '#' },
      { name: 'Meetings', icon: <Video size={20} />, path: '/dashboard/doctor/meetings' },
      { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
    ],
    admin: [
      { name: 'Analytics', icon: <ShieldCheck size={20} />, path: '/dashboard/admin' },
      { name: 'Manage Users', icon: <Users size={20} />, path: '/dashboard/admin/users' },
      { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
    ]
  };

  const menu = roleMenus[user.role] || [];

  return (
    <div className="flex min-h-screen w-screen bg-slate-950 text-white relative">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-[fadeIn_0.2s_ease-out]" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 h-screen z-50 w-64 bg-slate-900 border-r border-white/5 flex flex-col p-6 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:text-indigo-400 transition-all duration-200">
            <Activity size={24} className="text-indigo-400" />
            <span>SmartHealth</span>
          </Link>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1">
          {menu.map((item, idx) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={idx} 
                href={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/5">
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 cursor-pointer" 
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.05),transparent_30%)] flex flex-col">
        {/* Top Navbar Header */}
        <header className="flex items-center justify-between p-4 md:px-10 md:py-5 border-b border-white/5 sticky top-0 bg-slate-950/80 backdrop-blur-md z-30 w-full">
          <Link href="/" className="flex items-center gap-2 font-bold md:hidden hover:text-indigo-400 transition-all duration-200">
            <Activity size={20} className="text-indigo-400" />
            <span>SmartHealth</span>
          </Link>
          
          <div className="hidden md:block">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <Link href="/" className="hover:text-slate-300 transition-all">Home</Link> / <span className="text-slate-200 capitalize">{pathname.split('/').pop() || 'Overview'}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">
                {user.name[0]}
              </div>
              <span className="text-sm font-medium text-slate-200">{user.name}</span>
            </div>
            
            <button className="md:hidden p-2 bg-slate-800 rounded-lg text-slate-100" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10">
          {children}
        </div>
        <Footer />
      </main>

      {/* Logout Confirmation Modal Overlay */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
          <div className="glass-panel w-full max-w-sm p-6 text-center flex flex-col items-center gap-4 bg-slate-900/90 border-white/10 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <LogOut size={22} className="relative left-0.5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Ending Session</h3>
              <p className="text-slate-400 text-sm">Are you sure you want to log out from the dashboard?</p>
            </div>
            
            <div className="flex gap-3 w-full mt-2">
              <button 
                className="btn btn-secondary flex-1 text-xs py-2.5 px-0" 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary flex-1 bg-gradient-to-r from-rose-600 to-rose-500 shadow-[0_4px_14px_0_rgba(244,63,94,0.3)] text-xs py-2.5 px-0" 
                onClick={() => { logout(); router.push('/login'); }}
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
