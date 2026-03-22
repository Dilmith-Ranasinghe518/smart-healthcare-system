"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Users, ShieldCheck, Edit, Trash2, X } from "lucide-react";
import { API_URL } from "@/utils/api";

export default function ManageUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchUsers();
    }
  }, [user, loading, router]);

  const fetchUsers = () => {
    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Users fetch failed");
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => {
        console.error("users fetch error", err);
        setError("Could not load users list.");
      });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/users/${editingUser._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}` 
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u._id === updated._id ? { ...u, ...updated } : u));
        setEditingUser(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) return <div className="flex items-center justify-center p-10 h-full text-slate-600 dark:text-slate-400">Loading users...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-1">
          User Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">View, update, and manage system access nodes.</p>
      </header>

      {error && (
        <div className="text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 mb-6 w-full">
          {error}
        </div>
      )}

      {/* User Management Table Section */}
      <div className="glass-panel p-6 flex flex-col gap-4 overflow-x-auto w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
            <Users size={20} /> Active Directory ({users.length})
          </h3>
        </div>
        
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 text-sm">
              <th className="pb-3 font-semibold">Name</th>
              <th className="pb-3 font-semibold">Email</th>
              <th className="pb-3 font-semibold">Role</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-slate-200 dark:border-white/5 last:border-none text-sm hover:bg-white/2 transition-all">
                <td className="py-4 font-medium text-slate-800 dark:text-slate-200">
                  {u.name} {u._id === user._id && <span className="text-xs text-slate-500">(You)</span>}
                </td>
                <td className="py-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                <td className="py-4">
                  <span className={`badge ${
                    u.role === 'admin' ? 'badge-admin' : u.role === 'doctor' ? 'badge-doctor' : 'badge-user'
                  } text-[10px] px-2 py-0.5`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4 text-right flex justify-end gap-2">
                  <button 
                    className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 mr-1"
                    onClick={() => setEditingUser(u)}
                  >
                    <Edit size={16} />
                  </button>
                  {u._id !== user._id && (
                    <button 
                      className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20"
                      onClick={() => handleDelete(u._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
          <div className="glass-panel w-full max-w-md p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl relative flex flex-col gap-4">
            <button className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white" onClick={() => setEditingUser(null)}>
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Edit User Profile</h3>
            
            <form onSubmit={handleUpdate} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  className="input-field mb-0" 
                  value={editingUser.name} 
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} 
                  required 
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Email</label>
                <input 
                  type="email" 
                  className="input-field mb-0" 
                  value={editingUser.email} 
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} 
                  required 
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Role</label>
                <select 
                  className="input-field mb-0 appearance-none cursor-pointer" 
                  value={editingUser.role} 
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  disabled={editingUser._id === user._id}
                >
                  <option value="user" className="bg-slate-900">Patient (User)</option>
                  <option value="doctor" className="bg-slate-900">Doctor</option>
                  <option value="admin" className="bg-slate-900">Administrator</option>
                </select>
                {editingUser._id === user._id && <p className="text-xs text-slate-500 mt-1">You cannot change your own role.</p>}
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" className="btn btn-secondary flex-1 py-2 text-sm" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1 py-2 text-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
