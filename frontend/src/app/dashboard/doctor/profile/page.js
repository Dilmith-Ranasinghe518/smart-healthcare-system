"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  UserCircle,
  Edit,
  MapPin,
  Building2,
  BadgeCheck,
  Stethoscope,
  Ban,
  Sparkles,
  BriefcaseMedical,
} from "lucide-react";
import DoctorProfileModal from "@/components/DoctorProfileModal";

const DOCTOR_API = process.env.NEXT_PUBLIC_API_URL;

export default function DoctorProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [doctor, setDoctor] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "doctor")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "doctor") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setFetching(true);
    try {
      const profRes = await fetch(`${DOCTOR_API}/doctors/me`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const profData = await profRes.json();
      if (!profRes.ok) throw new Error(profData.message);

      setDoctor(profData.doctor);

      const hospRes = await fetch(`${DOCTOR_API}/hospitals?isActive=all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const hospData = await hospRes.json();
      if (hospRes.ok) setHospitals(hospData.hospitals || []);
    } catch (err) {
      setError(err.message || "Failed to load profile data.");
    } finally {
      setFetching(false);
    }
  };

  const handleSaved = (savedDoc) => {
    setDoctor(savedDoc);
    setModalOpen(false);
  };

  if (loading || !user) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-out] pb-12">
      <div className="mb-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-[#74B49B]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_45%,#eef7f4_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-16 -top-10 h-40 w-40 rounded-full bg-[#74B49B]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#BAC94A]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#74B49B]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5C8D7A] shadow-sm backdrop-blur-md">
              <Sparkles size={14} />
              Professional Doctor Profile
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
              My Profile
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Manage your public doctor identity, specialization, qualifications,
              locations, and patient-facing availability in one place.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7F1] text-[#2F8F68]">
                  <Stethoscope size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Profile Setup</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Keep your professional details up to date.
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F7E8] text-[#7C9440]">
                  <Building2 size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Locations</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Add hospitals and consultation availability.
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#4F7EA8]">
                  <BadgeCheck size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Visibility</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Help patients discover and book your services.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F7F4] text-[#5C8D7A]">
              <BriefcaseMedical size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Profile Status</h2>
              <p className="text-xs text-slate-500">Doctor profile overview</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                User Name
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">{user.name}</p>
            </div>

            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </p>
              <p className="mt-1 text-sm font-bold capitalize text-slate-800">
                {user.role}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Professional Profile
              </p>
              <p className={`mt-1 text-sm font-bold ${doctor ? "text-emerald-600" : "text-amber-600"}`}>
                {doctor ? "Configured" : "Not Yet Configured"}
              </p>
            </div>
          </div>
        </section>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-600">
          {error}
        </div>
      )}

      {fetching ? (
        <div className="rounded-[28px] border border-slate-200 bg-white py-20 text-center text-sm text-slate-500 shadow-sm">
          Verifying profile status...
        </div>
      ) : !doctor ? (
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF3F8] text-[#4F7EA8]">
            <UserCircle size={40} />
          </div>

          <h3 className="text-2xl font-black text-slate-800">
            Profile Not Configured
          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
            Your user account does not have a linked professional doctor profile yet.
            Create one now to appear in patient searches and start receiving appointments.
          </p>

          <button
            className="mt-6 rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-8 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(92,141,122,0.24)] transition hover:-translate-y-0.5"
            onClick={() => setModalOpen(true)}
          >
            Create Professional Profile
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#6C8CBF]/5 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-[28px] border border-[#6C8CBF]/20 bg-[#EAF3F8] text-[#4F7EA8] shadow-inner">
                <Stethoscope size={32} />
              </div>

              <div className="flex-1">
                <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <h3 className="text-2xl font-black text-slate-800">{doctor.name}</h3>

                  {doctor.isVerified && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#EAF7F1] px-3 py-1 text-[11px] font-bold text-[#2F8F68]">
                      <BadgeCheck size={12} />
                      VERIFIED
                    </span>
                  )}
                </div>

                <p className="mb-4 text-sm font-semibold text-[#4F7EA8]">
                  {doctor.specialization}
                </p>

                <div className="mb-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#F8FBF9] px-3 py-1 text-xs font-semibold text-slate-700">
                    {doctor.experience} Yrs Experience
                  </span>

                  {doctor.qualifications?.map((q, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-[#F8FBF9] px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {q}
                    </span>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-[#FCFDFC] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Specialization
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {doctor.specialization}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#FCFDFC] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Experience
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {doctor.experience} years
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#FCFDFC] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Locations
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {doctor.locations?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <button
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => setModalOpen(true)}
              >
                <span className="flex items-center gap-2">
                  <Edit size={16} /> Edit Profile
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
            <h4 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#2F8F68]">
              <Building2 size={16} /> Practice Locations & Availability
            </h4>

            {doctor.locations?.length === 0 ? (
              <div className="rounded-2xl bg-[#F8FBF9] p-6 text-center">
                <Ban size={30} className="mx-auto mb-3 text-slate-400" />
                <p className="text-sm italic text-slate-500">
                  You have not added any hospital locations yet. Patients cannot
                  book appointments with you until you add a location and availability slots.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {doctor.locations.map((loc) => (
                  <div
                    key={loc._id}
                    className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_100%)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <div className="rounded-xl bg-[#EAF7F1] p-2 text-[#2F8F68]">
                        <MapPin size={16} />
                      </div>

                      <div>
                        <h5 className="font-black text-slate-800">{loc.hospitalName}</h5>
                        <p className="text-xs text-slate-500">
                          {loc.address}, {loc.city}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 border border-slate-100">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Weekly Slots ({loc.availability?.length || 0})
                        {loc.consultationFee > 0
                          ? ` · Rs. ${loc.consultationFee.toLocaleString()}`
                          : ""}
                      </p>

                      {loc.availability?.length > 0 ? (
                        <div className="flex max-h-36 flex-col gap-2 overflow-y-auto pr-1">
                          {loc.availability.map((slot) => (
                            <span
                              key={slot._id}
                              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[11px] font-medium shadow-sm ${
                                slot.isAvailable === false
                                  ? "border-slate-200 bg-slate-100 text-slate-400 line-through"
                                  : "border-slate-200 bg-[#FCFDFC] text-slate-700"
                              }`}
                            >
                              <span>
                                {slot.day.substring(0, 3)}: {slot.startTime}-{slot.endTime}
                              </span>
                              <span className="font-normal text-slate-400">
                                Limit: {slot.patientLimit}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs italic text-slate-400">
                          No time slots added.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <DoctorProfileModal
          doctor={doctor}
          hospitals={hospitals}
          doctorUsers={[]}
          isAdmin={false}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
          token={user.token}
          doctorApiUrl={DOCTOR_API}
        />
      )}
    </div>
  );
}