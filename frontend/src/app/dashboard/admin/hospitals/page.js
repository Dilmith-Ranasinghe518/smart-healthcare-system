"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Building2, Plus, Edit, ToggleLeft, ToggleRight,
  Search, RefreshCw, MapPin, X
} from "lucide-react";
import Sel from "@/components/Sel";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";

const DOCTOR_API = process.env.NEXT_PUBLIC_DOCTOR_API_URL || "http://localhost:5007";

/* ── labelled input ── */
function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
        {label}{required && " *"}
      </label>
      {children}
    </div>
  );
}

const INPUT = "w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all";

const EMPTY_FORM = { name: "", city: "", address: "", lng: "", lat: "" };

export default function ManageHospitalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [hospitals, setHospitals]   = useState([]);
  const [search, setSearch]         = useState("");
  const [showFilter, setShowFilter] = useState("all"); // all | active | inactive
  const [fetching, setFetching]     = useState(true);
  const [error, setError]           = useState("");
  const [modalHospital, setModalHospital] = useState(undefined); // undefined=closed null=create obj=edit
  const [actionLoading, setActionLoading] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ── Auth guard ── */
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") fetchHospitals();
  }, [user]);

  /* ── fetch ── */
  const fetchHospitals = async () => {
    setFetching(true);
    setError("");
    try {
      const res = await fetch(`${DOCTOR_API}/api/hospitals?isActive=all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setHospitals(data.hospitals || []);
    } catch (err) {
      setError(err.message || "Failed to load hospitals.");
    } finally {
      setFetching(false);
    }
  };

  /* ── toggle active status ── */
  const handleToggle = async (hosp) => {
    setActionLoading(hosp._id + "_t");
    try {
      const res = await fetch(`${DOCTOR_API}/api/hospitals/${hosp._id}/toggle-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setHospitals(hs => hs.map(h => h._id === hosp._id ? data.hospital : h));
      toast.success(data.hospital.isActive ? "Hospital activated" : "Hospital deactivated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  /* ── after save ── */
  const handleSaved = (saved) => {
    setHospitals(hs => {
      const exists = hs.some(h => h._id === saved._id);
      return exists ? hs.map(h => h._id === saved._id ? saved : h) : [saved, ...hs];
    });
    setModalHospital(undefined);
  };

  /* ── filter ── */
  const filtered = hospitals.filter(h => {
    const q = search.toLowerCase();
    const matchSearch =
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      (h.address || "").toLowerCase().includes(q);
    const matchStatus =
      showFilter === "all" ? true :
      showFilter === "active" ? h.isActive :
      !h.isActive;
    return matchSearch && matchStatus;
  });

  const totalActive   = hospitals.filter(h => h.isActive).length;
  const totalInactive = hospitals.filter(h => !h.isActive).length;
  const cities        = [...new Set(hospitals.map(h => h.city).filter(Boolean))];

  // Calculate Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, showFilter]);

  if (loading || !user) return (
    <div className="flex items-center justify-center h-64 text-slate-500 text-sm">Loading...</div>
  );

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full">

      {/* ── Header ── */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-1">
            Hospital Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Add hospital branches, manage locations and control service availability.
          </p>
        </div>
        <button
          className="btn btn-primary text-sm py-2.5 px-5 flex items-center gap-2 self-start sm:self-auto"
          onClick={() => setModalHospital(null)}
        >
          <Plus size={16} /> Add Hospital
        </button>
      </header>

      {/* ── Error ── */}
      {error && (
        <div className="text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 mb-6 flex items-start justify-between gap-3">
          <span>{error}</span>
          <button className="text-rose-400 text-xs underline flex-shrink-0" onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total",    value: hospitals.length,  color: "text-indigo-400",  action: () => setShowFilter("all") },
          { label: "Active",   value: totalActive,       color: "text-emerald-400", action: () => setShowFilter("active") },
          { label: "Inactive", value: totalInactive,     color: "text-amber-400",   action: () => setShowFilter("inactive") },
        ].map(s => (
          <button
            key={s.label}
            onClick={s.action}
            className={`glass-panel p-4 text-left transition-all hover:ring-2 ring-offset-0 ${
              showFilter === s.label.toLowerCase() ? "ring-2 ring-indigo-500/50" : ""
            }`}
          >
            <div className={`flex items-center gap-2 ${s.color}`}>
              <Building2 size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</span>
            </div>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">{s.value}</span>
          </button>
        ))}
      </div>

      {/* ── Table panel ── */}
      <div className="glass-panel p-6 flex flex-col gap-5 overflow-x-auto">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
            <Building2 size={20} /> Directory ({filtered.length})
          </h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                className={`${INPUT} pl-8 py-2`}
                placeholder="Name, city or address..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="w-32">
              <Sel value={showFilter} onChange={e => setShowFilter(e.target.value)} className="py-2">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Sel>
            </div>
            <button
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-indigo-400 transition-all flex-shrink-0"
              onClick={fetchHospitals}
              title="Refresh"
            >
              <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Table */}
        {fetching ? (
          <div className="py-16 text-center text-slate-500 text-sm">Loading hospitals...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            {search ? "No hospitals match your search." : "No hospitals added yet. Click 'Add Hospital' to get started."}
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">Hospital</th>
                <th className="pb-3 font-semibold">City</th>
                <th className="pb-3 font-semibold">Coordinates</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(hosp => {
                const coords = hosp.location?.coordinates;
                return (
                  <tr key={hosp._id} className="border-b border-slate-200 dark:border-white/5 last:border-none text-sm hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">

                    <td className="py-4 pr-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{hosp.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{hosp.address || "—"}</p>
                    </td>

                    <td className="py-4 pr-4">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <MapPin size={12} className="text-indigo-400 flex-shrink-0" />
                        {hosp.city}
                      </span>
                    </td>

                    <td className="py-4 pr-4 text-xs text-slate-500 font-mono">
                      {coords ? `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}` : <span className="italic">Not set</span>}
                    </td>

                    <td className="py-4 pr-4">
                      <span className={`badge text-[10px] px-2 py-0.5 ${hosp.isActive ? "badge-doctor" : "badge-user"}`}>
                        {hosp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle active */}
                        <button
                          title={hosp.isActive ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded-lg transition-all ${hosp.isActive
                            ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"}`}
                          onClick={() => handleToggle(hosp)}
                          disabled={actionLoading === hosp._id + "_t"}
                        >
                          {hosp.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        {/* Edit */}
                        <button
                          title="Edit hospital"
                          className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-all"
                          onClick={() => setModalHospital(hosp)}
                        >
                          <Edit size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {/* ── Create / Edit Modal ── */}
      {modalHospital !== undefined && (
        <HospitalModal
          hospital={modalHospital}
          cities={cities}
          onClose={() => setModalHospital(undefined)}
          onSaved={handleSaved}
          token={user.token}
          apiUrl={DOCTOR_API}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Hospital Create / Edit Modal
════════════════════════════════════════════════════════════ */
function HospitalModal({ hospital, cities, onClose, onSaved, token, apiUrl }) {
  const isEditing = !!hospital;
  const [form, setForm] = useState({
    name:    hospital?.name    || "",
    city:    hospital?.city    || "",
    address: hospital?.address || "",
    lng:     hospital?.location?.coordinates?.[0] ?? "",
    lat:     hospital?.location?.coordinates?.[1] ?? "",
    isActive: hospital?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const body = {
      name:    form.name.trim(),
      city:    form.city.trim(),
      address: form.address.trim(),
      isActive: form.isActive,
    };

    const lng = parseFloat(form.lng);
    const lat = parseFloat(form.lat);
    if (form.lng !== "" && form.lat !== "") {
      if (isNaN(lng) || isNaN(lat)) { setError("Coordinates must be valid numbers."); return; }
      if (lng < -180 || lng > 180)  { setError("Longitude must be between -180 and 180."); return; }
      if (lat < -90  || lat > 90)   { setError("Latitude must be between -90 and 90."); return; }
      body.coordinates = [lng, lat];
    }

    setSaving(true);
    try {
      const url    = isEditing ? `${apiUrl}/api/hospitals/${hospital._id}` : `${apiUrl}/api/hospitals`;
      const method = isEditing ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      toast.success(isEditing ? "Hospital updated successfully!" : "Hospital created successfully!");
      onSaved(data.hospital);
      onClose();
    } catch (err) {
      toast.error(err.message);
      // Keep local error for the modal too
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {isEditing ? `Edit — ${hospital.name}` : "Add Hospital"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? "Update hospital details" : "Register a new hospital or branch"}
            </p>
          </div>
          <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {error && (
            <div className="text-rose-400 text-sm bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {error}
            </div>
          )}

          {/* Name */}
          <Field label="Hospital Name" required>
            <input className={INPUT} value={form.name} onChange={e => set("name", e.target.value)}
              placeholder="e.g. Apollo Hospital" required />
          </Field>

          {/* City + Address — 2 col */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" required>
              <input className={INPUT} value={form.city} onChange={e => set("city", e.target.value)}
                placeholder="Colombo" required list="city-list" />
              <datalist id="city-list">
                {cities.map(c => <option key={c} value={c} />)}
              </datalist>
            </Field>
            <Field label="Address" required>
              <input className={INPUT} value={form.address} onChange={e => set("address", e.target.value)}
                placeholder="123 Main St" required />
            </Field>
          </div>

          {/* Coordinates — 2 col */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">
              GPS Coordinates <span className="text-slate-400 font-normal normal-case tracking-normal">(optional — used for geospatial search)</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Longitude (lng)">
                <input className={INPUT} type="number" step="any" value={form.lng}
                  onChange={e => set("lng", e.target.value)} placeholder="-180 to 180" />
              </Field>
              <Field label="Latitude (lat)">
                <input className={INPUT} type="number" step="any" value={form.lat}
                  onChange={e => set("lat", e.target.value)} placeholder="-90 to 90" />
              </Field>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Service Status</p>
              <p className="text-xs text-slate-500 mt-0.5">Inactive hospitals won't appear in doctor search</p>
            </div>
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                form.isActive
                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-slate-200 dark:bg-white/10 text-slate-500 hover:bg-slate-300 dark:hover:bg-white/15"
              }`}
            >
              {form.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {form.isActive ? "Active" : "Inactive"}
            </button>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn btn-secondary flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1 py-2.5 text-sm">
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Hospital"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
