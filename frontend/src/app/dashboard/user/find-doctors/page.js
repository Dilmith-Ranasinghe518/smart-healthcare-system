"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Stethoscope, Star, Clock, AlertCircle, RefreshCw, ChevronRight, Navigation
} from "lucide-react";
import Sel from "@/components/Sel";

const DOCTOR_API = process.env.NEXT_PUBLIC_DOCTOR_API_URL;

const SPECIALIZATIONS = [
  "Cardiology", "Dermatology", "Endocrinology", "ENT", "Gastroenterology",
  "General Practitioner", "General Surgery", "Gynecology", "Internal Medicine",
  "Neurology", "Oncology", "Ophthalmology", "Orthopedics", "Pediatrics",
  "Psychiatry", "Pulmonology", "Radiology", "Urology", "Dentistry", "Other"
];

export default function FindDoctorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("");

  // Geolocation state
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoActive, setGeoActive] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "user") fetchDoctors();
  }, [user]);

  const fetchDoctors = async (geo = null) => {
    setFetching(true);
    setError("");
    try {
      let url = `${DOCTOR_API}/api/doctors?limit=50`;

      if (geo) {
        url = `${DOCTOR_API}/api/doctors/near?lng=${geo.lng}&lat=${geo.lat}&distance=20000`; // 20km search radius
        if (specFilter) url += `&specialization=${encodeURIComponent(specFilter)}`;
      } else {
        if (specFilter) url += `&specialization=${encodeURIComponent(specFilter)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch doctors");

      setDoctors(data.doctors || []);
      setGeoActive(!!geo);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        fetchDoctors({ lng: pos.coords.longitude, lat: pos.coords.latitude });
      },
      (err) => {
        setGeoLoading(false);
        setError("Unable to retrieve your location. Check browser permissions.");
        console.warn(err);
      },
      { timeout: 10000 }
    );
  };

  const handleClearGeo = () => {
    setGeoActive(false);
    fetchDoctors();
  };

  // Client-side text filter (if no geo, we also allow the backend to do some filtering, but client-side is fast)
  const filtered = doctors.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(q) ||
      (d.locations || []).some(l => l.city.toLowerCase().includes(q) || l.hospitalName.toLowerCase().includes(q));

    // If backend already filtered specs, we don't strictly need to do it here, but safe to keep
    const matchSpec = !specFilter || d.specialization === specFilter;

    return matchSearch && matchSpec;
  });

  if (loading || !user) return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-6xl mx-auto">
      {/* ── Header ── */}
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-2">
          Find Doctors
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Search for medical professionals, view availability, and book appointments.
        </p>
      </header>

      {/* ── Error ── */}
      {error && (
        <div className="text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 mb-6 flex items-center gap-2">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      {/* ── Search Toolbar ── */}
      <div className="glass-panel p-4 mb-6 flex flex-col md:flex-row gap-3 items-center">

        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="Search by name, hospital, or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full md:w-56">
          <Sel
            value={specFilter}
            onChange={e => {
              setSpecFilter(e.target.value);
              // if we change spec, we probably want to re-fetch if geo is active or just re-fetch in general
              if (geoActive) handleClearGeo(); // easiest is to reset geo if they change dropdow
            }}
            className="py-3"
          >
            <option value="">All Specialities</option>
            {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </Sel>
        </div>

        <button
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-semibold text-sm transition-all w-full md:w-auto ${geoActive
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
              : "bg-indigo-50 dark:bg-white/5 border-indigo-100 dark:border-white/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-white/10"
            }`}
          onClick={geoActive ? handleClearGeo : handleNearMe}
          disabled={geoLoading}
        >
          {geoLoading ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : geoActive ? (
            <><MapPin size={16} /> Clear Loc</>
          ) : (
            <><Navigation size={16} /> Near Me</>
          )}
        </button>
      </div>

      {/* ── Results Container ── */}
      {fetching ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-indigo-400" />
          <span className="text-sm">Locating doctors...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel py-20 text-center flex flex-col items-center gap-3">
          <Stethoscope size={40} className="text-slate-300 dark:text-slate-700 mb-2" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Doctors Found</h3>
          <p className="text-slate-500 text-sm max-w-sm">
            {geoActive
              ? "We couldn't find any verified doctors near your location. Try clearing your location filter."
              : "No verified doctors match your current search constraints."}
          </p>
          {geoActive && (
            <button className="btn btn-secondary mt-2 text-sm" onClick={handleClearGeo}>
              Clear Location Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(doc => (
            <div key={doc._id} className="glass-panel p-5 flex flex-col group hover:border-indigo-500/30 transition-all duration-300">

              {/* Card Header Component */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 flex-shrink-0">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">
                      {doc.specialization}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badges / Stats */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge badge-doctor text-[10px] px-2 py-0.5 whitespace-nowrap">
                  {doc.experience} Yr{doc.experience !== 1 && 's'} Exp
                </span>
                {(doc.qualifications || []).slice(0, 2).map((q, i) => (
                  <span key={i} className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 whitespace-nowrap border-none">
                    {q}
                  </span>
                ))}
              </div>

              {/* Locations List summary */}
              <div className="flex-1 mb-5">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Practice Locations</h4>
                {doc.locations?.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {doc.locations.slice(0, 2).map(loc => (
                      <li key={loc._id} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <MapPin size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          <span className="font-semibold">{loc.hospitalName}</span> — {loc.city}
                        </span>
                      </li>
                    ))}
                    {doc.locations.length > 2 && (
                      <li className="text-xs text-slate-400 italic mt-1">
                        + {doc.locations.length - 2} other location(s)
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">No locations added</p>
                )}
              </div>

              {/* Action */}
              <button
                className="w-full btn btn-primary flex items-center justify-between py-2.5 px-4 text-sm mt-auto"
                onClick={() => router.push(`/dashboard/user/find-doctors/${doc._id}`)}
              >
                <span>View Schedule & Book</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Details page handles booking modal now */}
    </div>
  );
}
