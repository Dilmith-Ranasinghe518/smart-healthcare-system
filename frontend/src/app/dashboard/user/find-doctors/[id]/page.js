"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Building2,
  BadgeCheck,
  Stethoscope,
  Calendar,
  Users,
  CircleDollarSign,
  Sparkles,
  BriefcaseMedical,
} from "lucide-react";
import toast from "react-hot-toast";
import BookAppointmentModal from "@/components/BookAppointmentModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const DOCTOR_API = API_BASE;
const APPOINTMENT_API = API_BASE;

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildUpcoming14Dates() {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    dates.push({
      str: `${y}-${m}-${day}`,
      name: DAYS[d.getDay()],
    });
  }

  return dates;
}

export default function DoctorDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [taxSetting, setTaxSetting] = useState({ percentage: 5 });

  const [bookedCounts, setBookedCounts] = useState({});
  const [loadingDates, setLoadingDates] = useState(new Set());

  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookingNote, setBookingNote] = useState("");
  const [appointmentType, setAppointmentType] = useState("General Checkup");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && id) {
      fetchData();
      fetchTaxSetting();
    }
  }, [user, id]);

  const fetchData = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${DOCTOR_API}/doctors/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load doctor");
      setDoctor(data.doctor);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const fetchTaxSetting = async () => {
    try {
      const res = await fetch(`${API_BASE}/payment/tax-setting`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTaxSetting(data);
      }
    } catch {}
  };

  const fetchBookedCounts = async (dateStr) => {
    if (bookedCounts[dateStr] !== undefined) return;

    setLoadingDates((p) => new Set([...p, dateStr]));

    try {
      const res = await fetch(
        `${APPOINTMENT_API}/appointments/doctor/${id}/booked-slots?date=${dateStr}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const data = await res.json();
      if (res.ok) {
        const countMap = {};
        (data.bookedSlots || []).forEach((s) => {
          countMap[s.slotId] = s.count;
        });
        setBookedCounts((prev) => ({ ...prev, [dateStr]: countMap }));
      }
    } catch {}

    setLoadingDates((p) => {
      const n = new Set(p);
      n.delete(dateStr);
      return n;
    });
  };

  const upcoming = useMemo(() => buildUpcoming14Dates(), []);

  const sessions = useMemo(() => {
    if (!doctor) return [];
    const result = [];

    upcoming.forEach(({ str: dateStr, name: dayName }) => {
      const daySessions = [];

      (doctor.locations || []).forEach((loc) => {
        (loc.availability || []).forEach((slot) => {
          if (slot.day !== dayName) return;
          if (slot.isAvailable === false) return;
          daySessions.push({ dateStr, dayName, location: loc, slot });
        });
      });

      if (daySessions.length > 0) {
        result.push({ dateStr, sessions: daySessions });
      }
    });

    return result;
  }, [doctor, upcoming]);

  useEffect(() => {
    if (user && sessions.length > 0) {
      sessions.forEach(({ dateStr }) => fetchBookedCounts(dateStr));
    }
  }, [sessions]);

  const confirmBooking = async (apptType, note) => {
    if (!bookingSlot) return;
    setBookingSubmitting(true);

    const { date, location, slot } = bookingSlot;

    try {
      const res = await fetch(`${APPOINTMENT_API}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          doctorId: doctor._id,
          locationId: location._id,
          slotId: slot._id,
          date,
          appointmentType: apptType || appointmentType,
          notes: note || bookingNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      try {
        const paymentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            userId: user.id || user._id,
            appointmentId: data.appointment._id,
            amount: location.consultationFee * 100,
            currency: "lkr",
            title: `Consultation with Dr. ${doctor.name}`,
          }),
        });

        const paymentData = await paymentRes.json();

        if (paymentRes.ok && paymentData.url) {
          toast.success("Appointment created! Redirecting to payment...");
          window.location.href = paymentData.url;
          return;
        } else {
          throw new Error(paymentData.message || "Failed to initiate payment");
        }
      } catch (payErr) {
        toast.error("Appointment created but payment failed to start: " + payErr.message);
        setTimeout(() => router.push("/dashboard/user/find-doctors"), 2000);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="w-full animate-[fadeIn_0.4s_ease-out] pb-12">
      <button
        onClick={() => router.push("/dashboard/user/find-doctors")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#4F7EA8]"
      >
        <ArrowLeft size={16} /> Back to Directory
      </button>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-medium text-rose-600">
          {error}
        </div>
      ) : fetching || !doctor ? (
        <div className="rounded-[28px] border border-slate-200 bg-white py-20 text-center text-slate-400 shadow-sm">
          Loading professional details...
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-80">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#74B49B]/20 bg-[#F8FBF9] px-4 py-2 text-xs font-semibold text-[#5C8D7A]">
                <Sparkles size={14} />
                Doctor Overview
              </div>

              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border-4 border-[#6C8CBF]/20 bg-[#EAF3F8] text-[#4F7EA8]">
                  {doctor.profilePicture ? (
                    <img
                      src={doctor.profilePicture}
                      alt={doctor.name}
                      className="h-full w-full rounded-[20px] object-cover"
                    />
                  ) : (
                    <Stethoscope size={40} className="opacity-80" />
                  )}
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-center gap-2">
                    <h1 className="text-lg font-extrabold leading-tight text-slate-800">
                      {doctor.name}
                    </h1>
                    {doctor.isVerified && (
                      <BadgeCheck size={18} className="shrink-0 text-[#2F8F68]" />
                    )}
                  </div>

                  <p className="text-sm font-semibold text-[#4F7EA8]">
                    {doctor.specialization}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {doctor.experience} Years Experience
                  </p>
                </div>

                {doctor.qualifications?.length > 0 && (
                  <div className="flex w-full flex-wrap justify-center gap-1.5">
                    {doctor.qualifications.map((q, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-[#F8FBF9] px-2.5 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {doctor.locations?.length > 0 && (
              <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <Building2 size={12} />
                  Available Hospitals
                </p>

                <ul className="flex flex-col gap-3">
                  {doctor.locations.map((loc) => (
                    <li key={loc._id} className="flex items-start gap-2 text-sm">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-[#2F8F68]" />
                      <div>
                        <p className="font-semibold leading-tight text-slate-700">
                          {loc.hospitalName}
                        </p>
                        <p className="text-[11px] text-slate-500">{loc.city}</p>
                        {loc.consultationFee > 0 && (
                          <p className="mt-0.5 text-[11px] font-semibold text-[#2F8F68]">
                            Rs. {loc.consultationFee.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="rounded-[32px] border border-[#74B49B]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_45%,#eef7f4_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#74B49B]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5C8D7A] shadow-sm">
                <BriefcaseMedical size={14} />
                Schedule & Booking
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">
                Available Sessions
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                Review upcoming consultation slots, compare hospital locations,
                and continue with secure appointment booking and payment.
              </p>
            </div>

            {sessions.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-white py-16 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                  <Calendar size={34} />
                </div>
                <h3 className="text-base font-black text-slate-700">No Upcoming Sessions</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  This doctor does not have any available sessions in the next 14 days.
                </p>
              </div>
            ) : (
              sessions.map(({ dateStr, sessions: daySessions }) => {
                const countsForDate = bookedCounts[dateStr];
                const isLoadingDate = loadingDates.has(dateStr);

                return (
                  <div key={dateStr}>
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-700">
                      <Calendar size={16} className="text-[#4F7EA8]" />
                      {formatDateLabel(dateStr)}
                    </h2>

                    <div className="flex flex-col gap-3">
                      {daySessions.map(({ location, slot }, i) => {
                        const booked = countsForDate?.[slot._id] ?? 0;
                        const limit = slot.patientLimit || 1;
                        const isFull = booked >= limit;

                        return (
                          <div
                            key={`${slot._id}-${i}`}
                            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#74B49B]/30 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
                          >
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                              <div className="flex items-start gap-3 xl:w-[28%]">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#4F7EA8]">
                                  <Building2 size={20} />
                                </div>

                                <div>
                                  <h4 className="text-sm font-bold leading-tight text-slate-800">
                                    {location.hospitalName}
                                  </h4>
                                  <p className="mt-1 text-[11px] text-slate-500">
                                    {location.city}
                                    {location.address ? ` · ${location.address}` : ""}
                                  </p>
                                  <p className="mt-1 text-[11px] font-semibold text-[#4F7EA8]">
                                    {doctor.specialization}
                                  </p>
                                </div>
                              </div>

                              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                                <div className="rounded-2xl bg-[#F8FBF9] p-3">
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                    Time
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {slot.startTime}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    to {slot.endTime}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-[#F8FBF9] p-3">
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                    Patients
                                  </p>
                                  {isLoadingDate ? (
                                    <p className="mt-1 text-sm text-slate-400">—</p>
                                  ) : (
                                    <>
                                      <p
                                        className={`mt-1 text-sm font-bold ${
                                          isFull ? "text-rose-600" : "text-slate-800"
                                        }`}
                                      >
                                        {booked} / {limit}
                                      </p>
                                      <p className="text-[11px] text-slate-500">Current load</p>
                                    </>
                                  )}
                                </div>

                                <div className="rounded-2xl bg-[#F8FBF9] p-3">
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                    Fee
                                  </p>
                                  {location.consultationFee > 0 ? (
                                    <>
                                      <p className="mt-1 text-sm font-bold text-[#2F8F68]">
                                        Rs. {location.consultationFee.toLocaleString()}
                                      </p>
                                      <p className="text-[11px] text-slate-500">Consultation</p>
                                    </>
                                  ) : (
                                    <p className="mt-1 text-[11px] italic text-slate-400">
                                      Fee not set
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center">
                                  {isFull ? (
                                    <span className="block w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-xs font-bold text-rose-600">
                                      Fully Booked
                                    </span>
                                  ) : (
                                    <button
                                      className="w-full rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-4 py-3 text-xs font-bold text-white shadow-[0_14px_30px_rgba(92,141,122,0.24)] transition hover:-translate-y-0.5"
                                      onClick={() =>
                                        setBookingSlot({
                                          date: dateStr,
                                          dateLabel: formatDateLabel(dateStr),
                                          location,
                                          slot,
                                        })
                                      }
                                    >
                                      Available
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <BookAppointmentModal
        isOpen={!!bookingSlot}
        onClose={() => setBookingSlot(null)}
        doctor={doctor}
        bookingSlot={bookingSlot}
        taxSetting={taxSetting}
        onConfirm={confirmBooking}
        isSubmitting={bookingSubmitting}
      />
    </div>
  );
}