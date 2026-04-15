"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Stethoscope,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Navigation,
  Sparkles,
  Filter,
  Building2,
  BadgeCheck,
  ClipboardList,
} from "lucide-react";
import Sel from "@/components/Sel";

const DOCTOR_API = process.env.NEXT_PUBLIC_API_URL;

const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "ENT",
  "Gastroenterology",
  "General Practitioner",
  "General Surgery",
  "Gynecology",
  "Internal Medicine",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Urology",
  "Dentistry",
  "Other",
];

export default function FindDoctorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("");

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoActive, setGeoActive] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "user") fetchDoctors();
  }, [user]);

  const fetchDoctors = async (geo = null, specialization = specFilter) => {
    setFetching(true);
    setError("");

    try {
      let url = `${DOCTOR_API}/doctors?limit=50`;

      if (geo) {
        url = `${DOCTOR_API}/doctors/near?lng=${geo.lng}&lat=${geo.lat}&distance=20000`;
        if (specialization) {
          url += `&specialization=${encodeURIComponent(specialization)}`;
        }
      } else {
        if (specialization) {
          url += `&specialization=${encodeURIComponent(specialization)}`;
        }
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
        fetchDoctors({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
        });
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
    fetchDoctors(null, specFilter);
  };

  const handleSpecChange = (value) => {
    setSpecFilter(value);
    if (geoActive) {
      setGeoActive(false);
      fetchDoctors(null, value);
    } else {
      fetchDoctors(null, value);
    }
  };

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        d.name.toLowerCase().includes(q) ||
        (d.locations || []).some(
          (l) =>
            l.city.toLowerCase().includes(q) ||
            l.hospitalName.toLowerCase().includes(q)
        );

      const matchSpec = !specFilter || d.specialization === specFilter;
      return matchSearch && matchSpec;
    });
  }, [doctors, search, specFilter]);

  const stats = useMemo(() => {
    return {
      total: doctors.length,
      visible: filtered.length,
      specializations: new Set(doctors.map((d) => d.specialization)).size,
    };
  }, [doctors, filtered]);

  if (loading || !user) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-out] pb-12">
      <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-[#74B49B]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_45%,#eef7f4_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-16 -top-10 h-40 w-40 rounded-full bg-[#74B49B]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#BAC94A]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#74B49B]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5C8D7A] shadow-sm backdrop-blur-md">
              <Sparkles size={14} />
              Doctor Discovery Portal
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
              Find Doctors
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Search verified medical professionals, browse hospital locations,
              and continue to schedule booking with the right specialist.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7F1] text-[#2F8F68]">
                  <ClipboardList size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Total Doctors</p>
                <p className="mt-1 text-2xl font-black text-slate-800">{stats.total}</p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F7E8] text-[#7C9440]">
                  <Filter size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Filtered</p>
                <p className="mt-1 text-2xl font-black text-slate-800">{stats.visible}</p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#4F7EA8]">
                  <Stethoscope size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Specialties</p>
                <p className="mt-1 text-2xl font-black text-slate-800">
                  {stats.specializations}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F7F4] text-[#5C8D7A]">
              <Search size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Search Filters</h2>
              <p className="text-xs text-slate-500">Find the right specialist faster</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-[#74B49B] focus:ring-4 focus:ring-[#74B49B]/10"
                placeholder="Search by name, hospital, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Sel
              value={specFilter}
              onChange={(e) => handleSpecChange(e.target.value)}
              className="w-full py-3"
            >
              <option value="">All Specialities</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Sel>

            <button
              className={`w-full rounded-2xl px-4 py-3 text-sm font-bold transition ${
                geoActive
                  ? "border border-emerald-200 bg-[#EAF7F1] text-[#2F8F68] hover:bg-[#DDF2E8]"
                  : "border border-[#6C8CBF]/20 bg-[#EAF3F8] text-[#4F7EA8] hover:bg-[#DDEAF4]"
              }`}
              onClick={geoActive ? handleClearGeo : handleNearMe}
              disabled={geoLoading}
            >
              <span className="flex items-center justify-center gap-2">
                {geoLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : geoActive ? (
                  <>
                    <MapPin size={16} /> Clear Location Filter
                  </>
                ) : (
                  <>
                    <Navigation size={16} /> Find Near Me
                  </>
                )}
              </span>
            </button>
          </div>
        </section>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      {fetching ? (
        <div className="rounded-[28px] border border-slate-200 bg-white py-20 text-center text-slate-500 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={24} className="animate-spin text-[#4F7EA8]" />
            <span className="text-sm">Locating doctors...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <Stethoscope size={34} />
          </div>
          <h3 className="text-lg font-black text-slate-800">No Doctors Found</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            {geoActive
              ? "We could not find any verified doctors near your location. Try clearing your location filter."
              : "No verified doctors match your current search settings."}
          </p>

          {geoActive && (
            <button
              className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              onClick={handleClearGeo}
            >
              Clear Location Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((doc) => (
            <div
              key={doc._id}
              className="group flex flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#74B49B]/30 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#4F7EA8]">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h3 className="line-clamp-1 font-bold text-slate-800 transition-colors group-hover:text-[#4F7EA8]">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#4F7EA8]">
                      {doc.specialization}
                    </p>
                  </div>
                </div>

                {doc.isVerified && (
                  <BadgeCheck size={18} className="shrink-0 text-[#2F8F68]" />
                )}
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#EAF7F1] px-2.5 py-1 text-[10px] font-bold text-[#2F8F68]">
                  {doc.experience} Yr{doc.experience !== 1 && "s"} Exp
                </span>

                {(doc.qualifications || []).slice(0, 2).map((q, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-[#F8FBF9] px-2.5 py-1 text-[10px] font-semibold text-slate-600"
                  >
                    {q}
                  </span>
                ))}
              </div>

              <div className="mb-5 flex-1">
                <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <Building2 size={12} />
                  Practice Locations
                </h4>

                {doc.locations?.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {doc.locations.slice(0, 2).map((loc) => (
                      <li
                        key={loc._id}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <MapPin size={14} className="mt-0.5 shrink-0 text-[#2F8F68]" />
                        <span className="line-clamp-2">
                          <span className="font-semibold">{loc.hospitalName}</span> —{" "}
                          {loc.city}
                        </span>
                      </li>
                    ))}
                    {doc.locations.length > 2 && (
                      <li className="mt-1 text-xs italic text-slate-400">
                        + {doc.locations.length - 2} other location(s)
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-xs italic text-slate-400">No locations added</p>
                )}
              </div>

              <button
                className="mt-auto w-full rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(92,141,122,0.24)] transition hover:-translate-y-0.5"
                onClick={() => router.push(`/dashboard/user/find-doctors/${doc._id}`)}
              >
                <span className="flex items-center justify-between">
                  <span>View Schedule & Book</span>
                  <ChevronRight size={16} />
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}