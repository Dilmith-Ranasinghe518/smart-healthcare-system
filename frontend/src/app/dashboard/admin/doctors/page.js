"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
    UserCheck, UserX, Stethoscope, Trash2, Edit, Plus,
    Search, RefreshCw, BadgeCheck, ShieldOff, Building2
} from "lucide-react";
import DoctorProfileModal from "@/components/DoctorProfileModal";
import Sel from "@/components/Sel";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";

const DOCTOR_API = process.env.NEXT_PUBLIC_DOCTOR_API_URL;
const USER_API = process.env.NEXT_PUBLIC_API_URL;

export default function ManageDoctorsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [doctors, setDoctors] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [doctorUsers, setDoctorUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [specFilter, setSpecFilter] = useState("");
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [modalDoctor, setModalDoctor] = useState(undefined); // undefined=closed, null=create, obj=edit
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        if (!loading && (!user || user.role !== "admin")) router.push("/login");
    }, [user, loading, router]);

    useEffect(() => {
        if (user?.role === "admin") fetchAll();
    }, [user]);

    const fetchAll = async () => {
        setFetching(true);
        setError("");
        try {
            await Promise.all([fetchDoctors(), fetchHospitals(), fetchDoctorUsers()]);
        } catch (err) {
            setError(err.message || "Failed to load data.");
        } finally {
            setFetching(false);
        }
    };

    const fetchDoctors = async () => {
        const res = await fetch(`${DOCTOR_API}/api/doctors/admin/all`, {
            headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setDoctors(data.doctors || []);
    };

    const fetchHospitals = async () => {
        const res = await fetch(`${DOCTOR_API}/api/hospitals`);
        const data = await res.json();
        setHospitals(data.hospitals || []);
    };

    const fetchDoctorUsers = async () => {
        try {
            const res = await fetch(`${USER_API}/users`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            if (!res.ok) return;
            const data = await res.json();
            const allUsers = Array.isArray(data) ? data : data.users || [];
            // Only doctor-role accounts
            const doctorRoleUsers = allUsers.filter(u => u.role === "doctor");
            // Fetch all existing doctor profiles to know which userIds are already taken
            const profRes = await fetch(`${DOCTOR_API}/api/doctors/admin/all`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const profData = await profRes.json();
            const linkedUserIds = new Set((profData.doctors || []).map(d => d.userId).filter(Boolean).map(String));
            // Only show doctor-role users that are NOT yet linked to any profile
            setDoctorUsers(doctorRoleUsers.filter(u => !linkedUserIds.has(String(u._id))));
        } catch { }
    };

    const handleVerify = async (doc) => {
        setActionLoading(doc._id + "_v");
        try {
            const res = await fetch(`${DOCTOR_API}/api/doctors/${doc._id}/verify`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ isVerified: !doc.isVerified }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setDoctors(ds => ds.map(d => d._id === doc._id ? data.doctor : d));
            toast.success(data.doctor.isVerified ? "Profile verified successfully" : "Profile verification removed");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        setActionLoading(id + "_d");
        try {
            const res = await fetch(`${DOCTOR_API}/api/doctors/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` },
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
            setDoctors(ds => ds.filter(d => d._id !== id));
            setConfirmDelete(null);
            toast.success("Profile deleted successfully");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSaved = (saved) => {
        setDoctors(ds => {
            const exists = ds.some(d => d._id === saved._id);
            return exists ? ds.map(d => d._id === saved._id ? saved : d) : [saved, ...ds];
        });
        setModalDoctor(undefined);
    };

    const filtered = doctors.filter(d => {
        const q = search.toLowerCase();
        return (
            (d.name.toLowerCase().includes(q) || (d.specialization || "").toLowerCase().includes(q)) &&
            (!specFilter || d.specialization === specFilter)
        );
    });

    // Calculate Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, specFilter]);

    const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))].sort();

    if (loading || !user) {
        return <div className="flex items-center justify-center h-64 text-slate-500 text-sm">Loading session...</div>;
    }

    return (
        <div className="animate-[fadeIn_0.5s_ease-out] w-full">

            {/* ── Page Header ── */}
            <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-1">
                        Doctor Management
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Manage doctor profiles, verify credentials, and configure availability.
                    </p>
                </div>
                <button
                    className="btn btn-primary text-sm py-2.5 px-5 flex items-center gap-2 self-start sm:self-auto"
                    onClick={() => setModalDoctor(null)}
                >
                    <Plus size={16} /> Add Doctor
                </button>
            </header>

            {/* ── Error Banner ── */}
            {error && (
                <div className="text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 mb-6 flex items-start justify-between gap-3">
                    <span>{error}</span>
                    <button className="text-rose-400 text-xs underline flex-shrink-0" onClick={() => setError("")}>Dismiss</button>
                </div>
            )}

            {/* ── Stats Bar ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total", value: doctors.length, icon: <Stethoscope size={18} />, color: "text-indigo-400" },
                    { label: "Verified", value: doctors.filter(d => d.isVerified).length, icon: <UserCheck size={18} />, color: "text-emerald-400" },
                    { label: "Pending", value: doctors.filter(d => !d.isVerified).length, icon: <UserX size={18} />, color: "text-amber-400" },
                    { label: "Hospitals", value: hospitals.length, icon: <Building2 size={18} />, color: "text-sky-400" },
                ].map(stat => (
                    <div key={stat.label} className="glass-panel p-4 flex flex-col gap-1">
                        <div className={`flex items-center gap-2 ${stat.color}`}>
                            {stat.icon}
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</span>
                        </div>
                        <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* ── Directory Table ── */}
            <div className="glass-panel p-6 flex flex-col gap-5 overflow-x-auto w-full">

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
                        <Stethoscope size={20} /> Doctor Directory ({filtered.length})
                    </h3>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-56">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                className="input-field mb-0 pl-8 py-2 text-sm"
                                placeholder="Name or specialty..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <Sel
                            value={specFilter}
                            onChange={e => setSpecFilter(e.target.value)}
                            className="py-2 w-auto"
                        >
                            <option value="">All Specializations</option>
                            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                        </Sel>
                        <button
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-indigo-400 transition-all flex-shrink-0"
                            onClick={fetchAll}
                            title="Refresh"
                        >
                            <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                {fetching ? (
                    <div className="py-16 text-center text-slate-500 text-sm">Loading doctors...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-sm">
                        {search || specFilter ? "No doctors match your filters." : "No doctors added yet. Click 'Add Doctor' to get started."}
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <th className="pb-3 font-semibold">Doctor</th>
                                <th className="pb-3 font-semibold">Specialization</th>
                                <th className="pb-3 font-semibold">Exp.</th>
                                <th className="pb-3 font-semibold">Locations</th>
                                <th className="pb-3 font-semibold">Status</th>
                                <th className="pb-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map(doc => (
                                <tr key={doc._id} className="border-b border-slate-200 dark:border-white/5 last:border-none text-sm hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">

                                    <td className="py-4 pr-4">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="font-semibold text-slate-800 dark:text-slate-100">{doc.name}</p>
                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{doc.doctorId || doc._id.slice(-6)}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 max-w-[180px] truncate">
                                            {(doc.qualifications || []).join(", ") || "—"}
                                        </p>
                                    </td>

                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-300">{doc.specialization || "—"}</td>

                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-300">
                                        {doc.experience != null ? `${doc.experience} yr${doc.experience !== 1 ? "s" : ""}` : "—"}
                                    </td>

                                    <td className="py-4 pr-4">
                                        {doc.locations?.length ? (
                                            <div className="flex flex-col gap-0.5">
                                                {doc.locations.slice(0, 2).map(loc => (
                                                    <span key={loc._id} className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Building2 size={11} className="text-sky-400 flex-shrink-0" />
                                                        {loc.hospitalName}
                                                    </span>
                                                ))}
                                                {doc.locations.length > 2 && (
                                                    <span className="text-[10px] text-slate-400">+{doc.locations.length - 2} more</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">None</span>
                                        )}
                                    </td>

                                    <td className="py-4 pr-4">
                                        <span className={`badge ${doc.isVerified ? "badge-doctor" : "badge-user"} text-[10px] px-2 py-0.5`}>
                                            {doc.isVerified ? "Verified" : "Pending"}
                                        </span>
                                    </td>

                                    <td className="py-4">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                title={doc.isVerified ? "Revoke verification" : "Verify doctor"}
                                                className={`p-1.5 rounded-lg transition-all ${doc.isVerified
                                                    ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                                    : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"}`}
                                                onClick={() => handleVerify(doc)}
                                                disabled={actionLoading === doc._id + "_v"}
                                            >
                                                {doc.isVerified ? <ShieldOff size={15} /> : <BadgeCheck size={15} />}
                                            </button>
                                            <button
                                                title="Edit profile"
                                                className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-all"
                                                onClick={() => setModalDoctor(doc)}
                                            >
                                                <Edit size={15} />
                                            </button>
                                            <button
                                                title="Delete profile"
                                                className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-all"
                                                onClick={() => setConfirmDelete(doc)}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!fetching && filtered.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* ── Delete Confirm Modal ── */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
                    <div className="glass-panel w-full max-w-sm p-6 text-center flex flex-col items-center gap-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <Trash2 size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Delete Doctor Profile</h3>
                            <p className="text-slate-500 text-sm">
                                Permanently delete <span className="font-semibold text-slate-700 dark:text-slate-200">{confirmDelete.name}</span>?
                                This cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3 w-full mt-2">
                            <button className="btn btn-secondary flex-1 text-sm py-2.5 px-0" onClick={() => setConfirmDelete(null)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary flex-1 bg-gradient-to-r from-rose-600 to-rose-500 shadow-[0_4px_14px_0_rgba(244,63,94,0.3)] text-sm py-2.5 px-0"
                                onClick={() => handleDelete(confirmDelete._id)}
                                disabled={actionLoading === confirmDelete._id + "_d"}
                            >
                                {actionLoading === confirmDelete._id + "_d" ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create / Edit Modal ── */}
            {modalDoctor !== undefined && (
                <DoctorProfileModal
                    doctor={modalDoctor}
                    hospitals={hospitals}
                    doctorUsers={doctorUsers}
                    isAdmin={true}
                    onClose={() => setModalDoctor(undefined)}
                    onSaved={handleSaved}
                    token={user.token}
                    doctorApiUrl={DOCTOR_API}
                />
            )}
        </div>
    );
}
