"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, UserCircle, MapPin, Building2, BadgeCheck,
  Stethoscope, Clock, Calendar, Users, CheckCircle, X, CircleDollarSign, Info
} from "lucide-react";
import toast from "react-hot-toast";
import Sel from "@/components/Sel";
import BookAppointmentModal from "@/components/BookAppointmentModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const DOCTOR_API = API_BASE;
const APPOINTMENT_API = API_BASE;

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
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
      name: DAYS[d.getDay()]
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

  // Booked slot counts: { [date]: { [slotId]: count } }
  const [bookedCounts, setBookedCounts] = useState({});
  const [loadingDates, setLoadingDates] = useState(new Set());

  // Booking confirmation dialog
  const [bookingSlot, setBookingSlot] = useState(null); // { date, dateLabel, slot, location }
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
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTaxSetting(data);
      }
    } catch (err) {}
  };

  const fetchBookedCounts = async (dateStr) => {
    if (bookedCounts[dateStr] !== undefined) return; // already loaded
    setLoadingDates(p => new Set([...p, dateStr]));
    try {
      const res = await fetch(
        `${APPOINTMENT_API}/appointments/doctor/${id}/booked-slots?date=${dateStr}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        const countMap = {};
        (data.bookedSlots || []).forEach(s => { countMap[s.slotId] = s.count; });
        setBookedCounts(prev => ({ ...prev, [dateStr]: countMap }));
      }
    } catch { }
    setLoadingDates(p => { const n = new Set(p); n.delete(dateStr); return n; });
  };

  // Build sessions — each date's available slots per location
  const upcoming = useMemo(() => buildUpcoming14Dates(), []);

  const sessions = useMemo(() => {
    if (!doctor) return [];
    const result = [];

    upcoming.forEach(({ str: dateStr, name: dayName }) => {
      const daySessions = [];
      (doctor.locations || []).forEach(loc => {
        (loc.availability || []).forEach(slot => {
          if (slot.day !== dayName) return;
          if (slot.isAvailable === false) return; // doctor paused this slot
          daySessions.push({ dateStr, dayName, location: loc, slot });
        });
      });
      if (daySessions.length > 0) result.push({ dateStr, sessions: daySessions });
    });
    return result;
  }, [doctor, upcoming]);

  // Pre-fetch booked counts for all session dates
  useEffect(() => {
    if (user && sessions.length > 0) {
      sessions.forEach(({ dateStr }) => fetchBookedCounts(dateStr));
    }
  }, [sessions]);

  // Confirm booking
  const confirmBooking = async (apptType, note) => {
    if (!bookingSlot) return;
    setBookingSubmitting(true);

    const { date, location, slot } = bookingSlot;
    try {
      const res = await fetch(`${APPOINTMENT_API}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          doctorId: doctor._id,
          locationId: location._id,
          slotId: slot._id,
          date,
          appointmentType: apptType || appointmentType,
          notes: note || bookingNote,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      // SECOND STEP: Create Payment Session
      try {
        const paymentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({
            userId: user.id || user._id,
            appointmentId: data.appointment._id,
            amount: Math.round(location.consultationFee * (1 + taxSetting.percentage / 100)) * 100, // Stripe expects cents, with tax
            currency: "lkr", // Or usd from loc
            title: `Consultation with Dr. ${doctor.name}`
          })
        });

        const paymentData = await paymentRes.json();
        if (paymentRes.ok && paymentData.url) {
          toast.success("Appointment created! Redirecting to payment...");
          window.location.href = paymentData.url; // Redirect to Stripe
          return;
        } else {
          throw new Error(paymentData.message || "Failed to initiate payment");
        }
      } catch (payErr) {
        toast.error("Appointment created but payment failed to start: " + payErr.message);
        // We still created an appointment, but payment failed.
        // Redirecting to find-doctors for now.
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
    <div className="animate-[fadeIn_0.4s_ease-out] w-full max-w-6xl mx-auto pb-12">

      {/* Back */}
      <button
        onClick={() => router.push("/dashboard/user/find-doctors")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-500 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Directory
      </button>

      {error ? (
        <div className="text-rose-500 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 font-medium text-center">{error}</div>
      ) : fetching || !doctor ? (
        <div className="py-20 text-center text-slate-400">Loading professional details...</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">

            {/* Profile card */}
            <div className="glass-panel p-6 flex flex-col items-center text-center gap-4">
              <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border-4 border-indigo-500/20 flex items-center justify-center text-indigo-500">
                {doctor.profilePicture
                  ? <img src={doctor.profilePicture} alt={doctor.name} className="w-full h-full object-cover rounded-[20px]" />
                  : <Stethoscope size={40} className="opacity-80" />}
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h1 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">{doctor.name}</h1>
                  {doctor.isVerified && <BadgeCheck size={18} className="text-indigo-500 shrink-0" />}
                </div>
                <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400">{doctor.specialization}</p>
                <p className="text-xs text-slate-500 mt-1">{doctor.experience} Years Experience</p>
              </div>

              {doctor.qualifications?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 w-full">
                  {doctor.qualifications.map((q, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-[11px] font-medium text-slate-600 dark:text-slate-300">{q}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Hospitals */}
            {doctor.locations?.length > 0 && (
              <div className="glass-panel p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                  <Building2 size={12} /> Available Hospitals
                </p>
                <ul className="flex flex-col gap-2">
                  {doctor.locations.map(loc => (
                    <li key={loc._id} className="flex items-start gap-2 text-sm">
                      <MapPin size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200 leading-tight">{loc.hospitalName}</p>
                        <p className="text-[11px] text-slate-500">{loc.city}</p>
                        {loc.consultationFee > 0 && (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Rs. {loc.consultationFee.toLocaleString()}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── RIGHT SESSIONS AREA ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {sessions.length === 0 ? (
              <div className="glass-panel py-16 text-center flex flex-col items-center gap-3">
                <Calendar size={40} className="text-slate-300 dark:text-slate-700" />
                <h3 className="text-base font-bold text-slate-600 dark:text-slate-300">No Upcoming Sessions</h3>
                <p className="text-sm text-slate-500 max-w-sm">This doctor doesn't have any available sessions in the next 14 days.</p>
              </div>
            ) : sessions.map(({ dateStr, sessions: daySessions }) => {
              const countsForDate = bookedCounts[dateStr];
              const isLoadingDate = loadingDates.has(dateStr);

              return (
                <div key={dateStr}>
                  {/* Date Header */}
                  <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-400" />
                    {formatDateLabel(dateStr)}
                  </h2>

                  <div className="flex flex-col gap-3">
                    {daySessions.map(({ location, slot }, i) => {
                      const booked = countsForDate?.[slot._id] ?? 0;
                      const limit = slot.patientLimit || 1;
                      const isFull = booked >= limit;
                      const hasNoSessions = !slot.isAvailable;

                      return (
                        <div key={`${slot._id}-${i}`}
                          className="glass-panel p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-l-4 transition-all hover:border-indigo-400"
                          style={{ borderLeftColor: isFull ? '#f43f5e' : '#6366f1' }}
                        >
                          {/* Hospital icon */}
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                            <Building2 size={20} />
                          </div>

                          {/* Session Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{location.hospitalName}</h4>
                            <p className="text-[11px] text-slate-500">{location.city}{location.address ? ` · ${location.address}` : ""}</p>
                            <p className="text-[11px] text-indigo-500 dark:text-indigo-400 font-semibold mt-0.5">{doctor.specialization}</p>
                          </div>

                          {/* Time */}
                          <div className="text-center shrink-0">
                            <p className="font-bold text-slateigo-700 dark:text-slate-200 text-sm">{slot.startTime}</p>
                            <p className="text-[10px] text-slate-400">to {slot.endTime}</p>
                          </div>

                          {/* Patients */}
                          <div className="text-center shrink-0 min-w-[64px]">
                            {isLoadingDate ? (
                              <p className="text-xs text-slate-400">—</p>
                            ) : (
                              <>
                                <p className={`font-bold text-base ${isFull ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>{booked}</p>
                                <p className="text-[10px] text-slate-400">/ {limit} patients</p>
                              </>
                            )}
                          </div>

                          {/* Fee */}
                          <div className="shrink-0 min-w-[120px] text-left">
                            {location.consultationFee > 0 ? (
                              <>
                                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">Rs. {location.consultationFee.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400">Channelling Fee</p>
                              </>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">Fee not set</p>
                            )}
                          </div>

                          {/* Action */}
                          <div className="shrink-0 w-full sm:w-auto">
                            {isFull ? (
                              <span className="block w-full sm:w-28 text-center py-2.5 px-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold cursor-not-allowed">
                                Fully Booked
                              </span>
                            ) : (
                              <button
                                className="w-full sm:w-28 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                                onClick={() => setBookingSlot({ date: dateStr, dateLabel: formatDateLabel(dateStr), location, slot })}
                              >
                                Available
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ── BOOKING CONFIRMATION DIALOG ── */}
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
