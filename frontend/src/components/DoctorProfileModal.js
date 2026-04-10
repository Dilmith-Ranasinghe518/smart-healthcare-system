"use client";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, Clock, Calendar, Building2 } from "lucide-react";
import Sel from "@/components/Sel";
import toast from "react-hot-toast";

const SPECIALIZATIONS = [
  "Cardiology", "Dermatology", "Endocrinology", "ENT", "Gastroenterology",
  "General Practitioner", "General Surgery", "Gynecology", "Internal Medicine",
  "Neurology", "Oncology", "Ophthalmology", "Orthopedics", "Pediatrics",
  "Psychiatry", "Pulmonology", "Radiology", "Urology", "Dentistry", "Other"
];

export default function DoctorProfileModal({
  doctor = null,
  hospitals = [],
  doctorUsers = [],
  isAdmin = false,
  onClose,
  onSaved,
  token,
  doctorApiUrl,
}) {
  const isEditing = !!doctor;

  /* ── basic form ── */
  const [form, setForm] = useState({
    name: "", specialization: "", experience: "", userId: "",
  });
  const [qualList, setQualList] = useState([""]);

  /* ── locations & availability ── */
  const [locations, setLocations] = useState([]);
  const [activeLocIdx, setActiveLocIdx] = useState(0);
  const [newSlot, setNewSlot] = useState({ day: "Monday", startTime: "09:00", endTime: "10:00", patientLimit: 10, isAvailable: true });
  const [selectedHospId, setSelectedHospId] = useState("");

  // Availability dropdown options — fetched from backend
  const [DAYS, setDays] = useState([]);
  const [TIMES, setTimes] = useState([]);

  useEffect(() => {
    fetch(`${doctorApiUrl}/doctors/options/availability`)
      .then(r => r.json())
      .then(data => {
        setDays(data.days || []);
        setTimes(data.times || []);
      })
      .catch(() => console.warn("Could not load availability options from doctor-service"));
  }, [doctorApiUrl]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ── hydrate on edit ── */
  useEffect(() => {
    if (doctor) {
      setForm({
        name: doctor.name || "",
        specialization: doctor.specialization || "",
        experience: doctor.experience ?? "",
        userId: doctor.userId || "",
      });
      setQualList(doctor.qualifications?.length ? doctor.qualifications : [""]);
      const locs = (doctor.locations || []).map(loc => ({
        _id: loc._id,
        hospitalId: loc.hospitalId,
        hospitalName: loc.hospitalName,
        city: loc.city,
        address: loc.address,
        consultationFee: loc.consultationFee || 0,
        availability: loc.availability || [],
      }));
      setLocations(locs);
      setActiveLocIdx(0);
    }
  }, [doctor]);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  /* ── qualifications ── */
  const updateQual = (i, v) => setQualList(q => q.map((x, idx) => idx === i ? v : x));
  const addQual = () => setQualList(q => [...q, ""]);
  const removeQual = (i) => setQualList(q => q.filter((_, idx) => idx !== i));

  /* ── hospitals ── */
  const addHospital = () => {
    const hosp = hospitals.find(h => h._id === selectedHospId);
    if (!hosp) return;
    const alreadyAdded = locations.some(l => l.hospitalId === hosp._id || l.hospitalId?.toString() === hosp._id);
    if (alreadyAdded) { setError("This hospital is already added."); return; }
    const newLoc = {
      _id: null,
      hospitalId: hosp._id,
      hospitalName: hosp.name,
      city: hosp.city,
      address: hosp.address,
      consultationFee: 0,
      availability: [],
    };
    setLocations(ls => [...ls, newLoc]);
    setActiveLocIdx(locations.length);
    setSelectedHospId("");
    setError("");
  };

  const removeLocation = (idx) => {
    setLocations(ls => ls.filter((_, i) => i !== idx));
    setActiveLocIdx(prev => Math.max(0, prev > idx ? prev - 1 : prev));
  };

  /* ── slots ── */
  const addSlot = () => {
    setLocations(ls => ls.map((loc, i) => {
      if (i !== activeLocIdx) return loc;
      const isDup = loc.availability.some(
        s => s.day === newSlot.day && s.startTime === newSlot.startTime && s.endTime === newSlot.endTime
      );
      if (isDup) { setError("Slot already exists."); return loc; }
      setError("");
      return { ...loc, availability: [...loc.availability, { ...newSlot }] };
    }));
  };

  const removeSlot = (locIdx, slotIdx) => {
    setLocations(ls => ls.map((loc, i) =>
      i === locIdx ? { ...loc, availability: loc.availability.filter((_, si) => si !== slotIdx) } : loc
    ));
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const quals = qualList.filter(q => q.trim());
    if (!quals.length) { setError("Add at least one qualification."); return; }

    setSaving(true);
    try {
      const body = {
        name: form.name,
        specialization: form.specialization,
        qualifications: quals,
        experience: Number(form.experience),
        ...(isAdmin ? { userId: form.userId || null } : {}),
      };

      const url = isEditing ? `${doctorApiUrl}/doctors/${doctor._id}` : `${doctorApiUrl}/doctors`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");

      let currentDocState = data.doctor; // ← was `savedDoctor` (undefined bug)

      // Sync locations + availability for existing or newly created profile
      if (currentDocState && locations.length > 0) {
        for (const loc of locations) {
          // 1. Always PATCH locations to upsert hospital + consultation fee
          const addRes = await fetch(`${doctorApiUrl}/doctors/${currentDocState._id}/locations`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ hospitalId: loc.hospitalId, consultationFee: Number(loc.consultationFee) || 0 })
          });
          const addData = await addRes.json();
          if (!addRes.ok) {
            console.warn("Location sync failed:", addData.message);
            continue;
          }
          if (addData.doctor) currentDocState = addData.doctor;

          // Find the location _id from the latest state
          const targetLocId = currentDocState.locations?.find(l =>
            l.hospitalId?.toString() === loc.hospitalId?.toString()
          )?._id;

          // 2. Only update availability if slots exist and we have a location ID
          if (targetLocId && loc.availability && loc.availability.length > 0) {
            const availRes = await fetch(
              `${doctorApiUrl}/doctors/${currentDocState._id}/locations/${targetLocId}/availability`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ slots: loc.availability }),
              }
            );
            const availData = await availRes.json();
            if (availRes.ok && availData.doctor) {
              currentDocState = availData.doctor;
            }
          }
        }
      }

      toast.success(isEditing ? "Doctor profile updated!" : "Doctor profile created!");
      onSaved(currentDocState);
      onClose();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── available hospitals to add (not already in locations list) ── */
  const availableHospitals = hospitals.filter(
    h => !locations.some(l => l.hospitalId === h._id || l.hospitalId?.toString() === h._id)
  );

  const activeLoc = locations[activeLocIdx];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-8 pb-6 px-4 animate-[fadeIn_0.2s_ease-out] overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {isEditing ? `Edit — ${doctor.name}` : "Create Doctor Profile"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? "Update profile, locations and availability" : "Add a new doctor to the directory"}
            </p>
          </div>
          <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="px-6 py-5 flex flex-col gap-6 overflow-y-auto max-h-[75vh]">

            {error && (
              <div className="text-rose-400 text-sm bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                {error}
              </div>
            )}

            {/* ═══ SECTION 1: Basic Info (2-col) ═══ */}
            <section>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3">Basic Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Full Name *</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder="Dr. John Silva"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Experience (years) *</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    type="number" min="0"
                    value={form.experience}
                    onChange={e => set("experience", e.target.value)}
                    placeholder="5"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Specialization *</label>
                  <Sel value={form.specialization} onChange={e => set("specialization", e.target.value)}>
                    <option value="" disabled>Select specialization...</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Sel>
                </div>
              </div>
            </section>

            {/* ═══ SECTION 2: Qualifications + User Binding (2-col) ═══ */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">

              {/* Left: Qualifications */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3">Qualifications *</p>
                <div className="flex flex-col gap-2">
                  {qualList.map((q, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        value={q}
                        onChange={e => updateQual(i, e.target.value)}
                        placeholder="e.g. MBBS, MD"
                      />
                      {qualList.length > 1 && (
                        <button type="button" className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all flex-shrink-0" onClick={() => removeQual(i)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mt-1 w-fit transition-all" onClick={addQual}>
                    <Plus size={13} /> Add qualification
                  </button>
                </div>
              </div>

              {/* Right: Admin user binding */}
              {isAdmin && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-3">
                    Link User Account <span className="text-slate-400 font-normal normal-case tracking-normal">(admin · optional)</span>
                  </p>
                  <Sel value={form.userId} onChange={e => set("userId", e.target.value)}>
                    <option value="">— Standalone (no account) —</option>
                    {doctorUsers.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </Sel>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Allows this doctor to log in and manage their own profile.
                  </p>
                </div>
              )}
            </section>

            {/* ═══ SECTION 3: Hospital Locations + Availability ═══ */}
            <section>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3">Hospital Locations & Availability</p>

              {/* Add hospital row */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1">
                  <Sel value={selectedHospId} onChange={e => setSelectedHospId(e.target.value)}>
                    <option value="">Select a hospital to add...</option>
                    {availableHospitals.map(h => (
                      <option key={h._id} value={h._id}>{h.name} — {h.city}</option>
                    ))}
                  </Sel>
                </div>
                <button
                  type="button"
                  disabled={!selectedHospId}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-all flex-shrink-0"
                  onClick={addHospital}
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {locations.length === 0 ? (
                <div className="text-xs text-slate-500 italic bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/5 text-center">
                  No hospital added. Use the dropdown above to assign hospitals.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">

                  {/* Location tabs */}
                  <div className="flex border-b border-slate-200 dark:border-white/10 overflow-x-auto bg-slate-50 dark:bg-slate-800/30 flex-shrink-0">
                    {locations.map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveLocIdx(idx)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all border-r border-slate-200 dark:border-white/5 last:border-r-0 ${activeLocIdx === idx
                          ? "bg-white dark:bg-slate-900 text-emerald-500 border-b-2 border-emerald-500"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          }`}
                      >
                        <Building2 size={12} />
                        {loc.hospitalName}
                        <span
                          className="ml-1 text-rose-400 hover:text-rose-500 transition-all"
                          onClick={(e) => { e.stopPropagation(); removeLocation(idx); }}
                          title="Remove location"
                        >
                          <X size={11} />
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Active location availability */}
                  {activeLoc && (
                    <div className="p-4 bg-white dark:bg-slate-900">
                      <p className="text-[11px] text-slate-400 mb-3">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{activeLoc.city}</span>
                        {activeLoc.address && ` · ${activeLoc.address}`}
                      </p>

                      <div className="mb-4 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Consultation Fee (Rs.)</label>
                        <input 
                          type="number" 
                          min="1000"
                          title="Minimum fee is Rs. 1000"
                          required
                          className="w-full max-w-[120px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                          value={activeLoc.consultationFee}
                          onChange={e => {
                            const val = e.target.value;
                            setLocations(ls => ls.map((l, i) => i === activeLocIdx ? { ...l, consultationFee: Number(val) } : l));
                          }}
                        />
                      </div>

                      {/* Existing slots */}
                      <div className="flex flex-col gap-1.5 mb-3 max-h-36 overflow-y-auto pr-1">
                        {activeLoc.availability.length === 0 && (
                          <p className="text-xs text-slate-400 italic">No slots added yet.</p>
                        )}
                        {activeLoc.availability.map((slot, si) => (
                          <div key={si} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/5 text-xs transition-opacity ${slot.isAvailable === false ? 'opacity-50 grayscale' : ''}`}>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <Calendar size={11} className="text-emerald-400" />
                              <span className="font-medium min-w-[60px]">{slot.day}</span>
                              <Clock size={11} className="text-indigo-400" />
                              <span className="min-w-[85px]">{slot.startTime} – {slot.endTime}</span>
                              <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono ml-1">Limit: {slot.patientLimit}</span>
                            </div>
                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-medium text-slate-500">
                                <input 
                                  type="checkbox" 
                                  checked={slot.isAvailable !== false}
                                  onChange={e => {
                                    setLocations(ls => ls.map((loc, i) =>
                                      i === activeLocIdx ? { ...loc, availability: loc.availability.map((s, idx) => idx === si ? { ...s, isAvailable: e.target.checked } : s) } : loc
                                    ));
                                  }}
                                  className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                                />
                                {slot.isAvailable !== false ? 'Active' : 'Paused'}
                              </label>
                              <button type="button" className="text-rose-400 hover:bg-rose-500/10 p-1 rounded transition-all" onClick={() => removeSlot(activeLocIdx, si)}>
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* New slot row */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <div>
                          <label className="text-[10px] text-slate-400 mb-1 block">Day</label>
                          <Sel value={newSlot.day} onChange={e => setNewSlot(s => ({ ...s, day: e.target.value }))}>
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                          </Sel>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 mb-1 block">Start</label>
                          <Sel value={newSlot.startTime} onChange={e => setNewSlot(s => ({ ...s, startTime: e.target.value }))}>
                            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                          </Sel>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 mb-1 block">End</label>
                          <Sel value={newSlot.endTime} onChange={e => setNewSlot(s => ({ ...s, endTime: e.target.value }))}>
                            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                          </Sel>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 mb-1 block">Limit</label>
                          <input 
                            type="number" 
                            min="1" 
                            className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                            value={newSlot.patientLimit} 
                            onChange={e => setNewSlot(s => ({ ...s, patientLimit: Number(e.target.value) }))} 
                          />
                        </div>
                        <button
                          type="button"
                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-xs font-medium transition-all"
                          onClick={addSlot}
                        >
                          <Plus size={12} /> Add Slot
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex gap-3 flex-shrink-0">
            <button type="button" className="btn btn-secondary flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1 py-2.5 text-sm">
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
