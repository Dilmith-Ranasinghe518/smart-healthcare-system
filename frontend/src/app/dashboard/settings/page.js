"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  Camera,
  Sparkles,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { API_URL } from "@/utils/api";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) return;

    setIsUploadingImage(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const res = await fetch(`${API_URL}/users/profile/picture`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload image");

      updateUser({ profilePicture: data.profilePicture });
      setMessage("Profile picture updated!");
      setSelectedImage(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

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
          ...(password && { password }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      updateUser({ name: data.name, email: data.email });
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
    <div className="w-full animate-[fadeIn_0.5s_ease-out] pb-12">
      <div className="mb-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-[#74B49B]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_45%,#eef7f4_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-16 -top-10 h-40 w-40 rounded-full bg-[#74B49B]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#BAC94A]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#74B49B]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5C8D7A] shadow-sm backdrop-blur-md">
              <Sparkles size={14} />
              Account Preferences
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
              Account Settings
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Update your profile details, upload a profile picture, and manage your
              account security in one place.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7F1] text-[#2F8F68]">
                  <User size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Profile Info</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Keep your visible account details updated.
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F7E8] text-[#7C9440]">
                  <Camera size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Photo Update</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Upload a fresh profile image for your account.
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#4F7EA8]">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Security</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Change your password and improve access security.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F7F4] text-[#5C8D7A]">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Account Snapshot</h2>
              <p className="text-xs text-slate-500">Current user information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">{user?.name}</p>
            </div>

            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">{user?.email}</p>
            </div>

            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </p>
              <p className="mt-1 text-sm font-bold capitalize text-slate-800">
                {user?.role} account
              </p>
            </div>
          </div>
        </section>
      </div>

      {message && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-600">
          <CheckCircle size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] md:p-8">
        <div className="mb-8 flex flex-col items-center gap-6 border-b border-slate-200 pb-8 md:flex-row">
          <div className="relative h-24 w-24">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-[#EAF3F8] text-3xl font-bold text-[#4F7EA8] transition-all duration-300">
              {imagePreview || user?.profilePicture ? (
                <img
                  src={imagePreview || `${API_URL}${user.profilePicture}`}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.[0] || "?"
              )}
            </div>

            <label className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#5AA7A7] shadow-xl transition-all hover:scale-110 hover:bg-[#4C9999] active:scale-95">
              <Camera size={18} className="text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h4 className="mb-1 text-xl font-black text-slate-800">{user?.name}</h4>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <span className="inline-block rounded-full border border-slate-200 bg-[#F8FBF9] px-3 py-1 text-xs text-slate-500 capitalize">
                {user?.role} Account
              </span>

              {selectedImage && (
                <button
                  onClick={handleUploadImage}
                  disabled={isUploadingImage}
                  className="text-xs font-semibold text-[#4F7EA8] transition-colors hover:text-[#3C6991]"
                >
                  {isUploadingImage ? "Uploading..." : "Click to Save New Photo"}
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm text-slate-800 outline-none transition-all focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm text-slate-800 outline-none transition-all focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Lock size={16} className="text-[#4F7EA8]" />
              Security Preset
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-slate-600">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition-all focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-slate-500 transition-colors hover:text-slate-800"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-slate-600">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition-all focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/10"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-slate-500 transition-colors hover:text-slate-800"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              Leave blank if you do not want to change your password.
            </p>
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(92,141,122,0.24)] transition hover:-translate-y-0.5 md:w-fit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving Changes..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}