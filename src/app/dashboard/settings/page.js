"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings, User, Mail, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { API_URL } from "@/utils/api";

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name,
          email,
          ...(password && { password }), // Include password only if typed
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      // Update AuthContext if successful
      login({ ...user, name: data.name, email: data.email });
      setMessage("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-2xl mx-auto">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-1">
          Account Settings
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Update your profile parameters and security presets.</p>
      </header>

      {message && (
        <div className="text-emerald-400 mb-6 flex items-center gap-2 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-sm">
          <CheckCircle size={18} /> {message}
        </div>
      )}

      {error && (
        <div className="text-rose-400 mb-6 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 text-sm">
          {error}
        </div>
      )}

      <div className="glass-panel p-6 md:p-8 flex flex-col gap-6">
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xl font-bold uppercase border border-indigo-500/20">
            {user?.name[0]}
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">{user?.name}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">{user?.role} Account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block font-medium">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-500" />
                <input 
                  type="text" 
                  className="input-field pl-10 mb-0 text-sm" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block font-medium">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
                <input 
                  type="email" 
                  className="input-field pl-10 mb-0 text-sm" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-white/5 pt-5 mt-2">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Lock size={16} className="text-indigo-400" /> Security Preset
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="input-field mb-0 pr-10 text-sm" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    className="input-field mb-0 pr-10 text-sm" 
                    placeholder="••••••••" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Leave blank if you don't intend to change your password.</p>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full md:w-fit md:px-6 py-2.5 mt-2 text-sm justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving Changes..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
