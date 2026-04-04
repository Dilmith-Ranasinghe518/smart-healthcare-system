"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Stethoscope, Star, Clock, AlertCircle, RefreshCw, ChevronRight, Navigation, Zap
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const DOCTOR_API = process.env.NEXT_PUBLIC_API_URL;

const SPECIALIZATIONS = [
  "Cardiology", "Dermatology", "Endocrinology", "ENT", "Gastroenterology",
  "General Practitioner", "General Surgery", "Gynecology", "Internal Medicine",
  "Neurology", "Oncology", "Ophthalmology", "Orthopedics", "Pediatrics",
  "Psychiatry", "Pulmonology", "Radiology", "Urology", "Dentistry", "Other"
];

export default function FindDoctorsPublicPage() {
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
    fetchDoctors();
  }, []);

  const fetchDoctors = async (geo = null) => {
    setFetching(true);
    setError("");
    try {
      let url = `${DOCTOR_API}/doctors?limit=50`;

      if (geo) {
        url = `${DOCTOR_API}/doctors/near?lng=${geo.lng}&lat=${geo.lat}&distance=20000`; // 20km search radius
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

  const filtered = doctors.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(q) ||
      (d.locations || []).some(l => l.city.toLowerCase().includes(q) || l.hospitalName.toLowerCase().includes(q));

    const matchSpec = !specFilter || d.specialization === specFilter;

    return matchSearch && matchSpec;
  });

  return (
    <div className="min-h-screen bg-[#F8FBF9] dark:bg-[#16221F] text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-500">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* ── Hero Header ── */}
        <header className="mb-12 text-center max-w-3xl mx-auto animate-[fadeIn_0.5s_ease-out]">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#74B49B]/15 text-[#74B49B] text-sm font-bold border border-[#74B49B]/30 mb-4">
            <Zap size={16} /> Fast Booking
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-4 leading-tight">
            Find Your <span className="text-[#74B49B]">Specialist</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Search top-rated medical professionals near you. Check availability and easily book your appointment online.
          </p>
        </header>

        {/* ── Error ── */}
        {error && (
          <div className="text-rose-500 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 mb-8 max-w-4xl mx-auto flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" /> <span>{error}</span>
          </div>
        )}

        {/* ── Search Toolbar ── */}
        <div className="bg-white dark:bg-[#1C2925] p-5 rounded-[28px] shadow-lg border border-[#74B49B]/10 mb-10 flex flex-col md:flex-row gap-4 items-center max-w-4xl mx-auto">
          
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-[#F8FBF9] dark:bg-[#16221F] text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-[#74B49B] focus:ring-2 focus:ring-[#74B49B]/20 transition-all font-medium placeholder:font-normal"
              placeholder="Search by name, hospital, or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full md:w-64">
            <div className="relative">
              <select
                value={specFilter}
                onChange={e => {
                  setSpecFilter(e.target.value);
                  if (geoActive) handleClearGeo(); 
                }}
                className="w-full pl-4 pr-10 py-3.5 bg-[#F8FBF9] dark:bg-[#16221F] border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#74B49B] focus:ring-2 focus:ring-[#74B49B]/20 appearance-none cursor-pointer"
              >
                <option value="">All Specialities</option>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronRight size={16} className="text-slate-400 rotate-90" />
              </div>
            </div>
          </div>

          <button
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md w-full md:w-auto ${
              geoActive
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                : "bg-[#74B49B] hover:bg-[#5C8D7A] text-white shadow-[#74B49B]/20"
            }`}
            onClick={geoActive ? handleClearGeo : handleNearMe}
            disabled={geoLoading}
          >
            {geoLoading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : geoActive ? (
              <><MapPin size={18} /> Clear</>
            ) : (
              <><Navigation size={18} /> Near Me</>
            )}
          </button>
        </div>

        {/* ── Results Container ── */}
        {fetching ? (
          <div className="py-24 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-4">
            <div className="p-4 bg-[#74B49B]/10 rounded-full animate-bounce">
              <RefreshCw size={28} className="animate-spin text-[#74B49B]" />
            </div>
            <span className="font-semibold text-lg">Locating doctors...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#1E2E2A] py-24 text-center rounded-[40px] border border-[#74B49B]/10 shadow-sm flex flex-col items-center gap-4 max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-[#F0F7F4] dark:bg-[#16221F] rounded-full flex items-center justify-center mb-2">
              <Stethoscope size={36} className="text-[#BAC94A]" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">No Doctors Found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-md">
              {geoActive
                ? "We couldn't find any verified doctors near your location. Try clearing your location filter."
                : "No verified doctors match your current search constraints."}
            </p>
            {geoActive && (
              <button 
                className="mt-4 px-6 py-3 bg-[#74B49B]/10 hover:bg-[#74B49B]/20 text-[#74B49B] font-bold rounded-xl transition-all" 
                onClick={handleClearGeo}
              >
                Clear Location Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(doc => (
              <div 
                key={doc._id} 
                className="bg-white dark:bg-[#1C2925] p-6 rounded-[32px] border border-[#74B49B]/10 hover:border-[#74B49B]/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden"
              >
                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#74B49B]/5 rounded-full blur-2xl group-hover:bg-[#74B49B]/10 transition-colors" />

                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#F0F7F4] dark:bg-[#20302C] flex items-center justify-center text-[#74B49B] flex-shrink-0 shadow-inner">
                     {doc.profilePicture 
                      ? <img src={doc.profilePicture} alt={doc.name} className="w-full h-full object-cover rounded-2xl" />
                      : <Stethoscope size={28} />
                     }
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white line-clamp-1 group-hover:text-[#74B49B] transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-[#74B49B] font-bold mt-0.5">
                      {doc.specialization}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-[#BAC94A]/15 text-[#8EAC50] px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                    {doc.experience} Yr{doc.experience !== 1 && 's'} Exp
                  </span>
                  {(doc.qualifications || []).slice(0, 2).map((q, i) => (
                    <span key={i} className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {q}
                    </span>
                  ))}
                </div>

                <div className="flex-1 mb-8">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-[#6C8CBF] mb-3 flex items-center gap-1.5">
                    <MapPin size={14} /> Practice Locations
                  </h4>
                  {doc.locations?.length > 0 ? (
                    <ul className="flex flex-col gap-3">
                      {doc.locations.slice(0, 2).map(loc => (
                        <li key={loc._id} className="flex items-start gap-2.5 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#6C8CBF] mt-1.5 shrink-0" />
                          <span className="text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-slate-800 dark:text-white">{loc.hospitalName}</span> <br/>
                            <span className="text-xs text-slate-500">{loc.city}</span>
                          </span>
                        </li>
                      ))}
                      {doc.locations.length > 2 && (
                        <li className="text-xs text-[#74B49B] font-bold mt-1 pl-4">
                          + {doc.locations.length - 2} other location(s)
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No locations added</p>
                  )}
                </div>

                <button
                  className="w-full bg-[#F8FBF9] dark:bg-[#20302C] hover:bg-[#74B49B] text-[#74B49B] hover:text-white border border-[#74B49B]/20 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all mt-auto group-hover:border-transparent"
                  onClick={() => router.push(`/doctors/${doc._id}`)}
                >
                  <span>View Profile & Book</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
