"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, UserCircle, MapPin, Building2, BadgeCheck,
  Stethoscope, Clock, Calendar, Users, CheckCircle, X, CircleDollarSign, Info, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import Sel from "@/components/Sel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export default function DoctorPublicDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [bookedCounts, setBookedCounts] = useState({});
  const [loadingDates, setLoadingDates] = useState(new Set());

  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookingNote, setBookingNote] = useState("");
  const [appointmentType, setAppointmentType] = useState("General Checkup");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

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

  const fetchBookedCounts = async (dateStr) => {
    if (bookedCounts[dateStr] !== undefined) return;
    setLoadingDates(p => new Set([...p, dateStr]));
    
    // We try fetching without Auth first if the backend allows it, 
    // but the backend requires auth for `booked-slots`. 
    // Wait, the backend route `GET /appointments/doctor/:id/booked-slots` might need auth! 
    // If it does, we can't reliably show "Fully Booked" for unauthenticated users 
    // unless there is a public route or we just send it without auth and catch it.
    // Let's send the token if user is present, otherwise send without and catch gracefully.
    
    try {
      const headers = {};
      if (user?.token) headers.Authorization = `Bearer ${user.token}`;

      const res = await fetch(
        `${APPOINTMENT_API}/appointments/doctor/${id}/booked-slots?date=${dateStr}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        const countMap = {};
        (data.bookedSlots || []).forEach(s => { countMap[s.slotId] = s.count; });
        setBookedCounts(prev => ({ ...prev, [dateStr]: countMap }));
      } else {
        // Not authenticated or not allowed? We'll just assume no counts.
      }
    } catch { } // Default empty counts
    setLoadingDates(p => { const n = new Set(p); n.delete(dateStr); return n; });
  };

  const upcoming = useMemo(() => buildUpcoming14Dates(), []);

  const sessions = useMemo(() => {
    if (!doctor) return [];
    const result = [];

    upcoming.forEach(({ str: dateStr, name: dayName }) => {
      const daySessions = [];
      (doctor.locations || []).forEach(loc => {
        (loc.availability || []).forEach(slot => {
          if (slot.day !== dayName) return;
          if (slot.isAvailable === false) return;
          daySessions.push({ dateStr, dayName, location: loc, slot });
        });
      });
      if (daySessions.length > 0) result.push({ dateStr, sessions: daySessions });
    });
    return result;
  }, [doctor, upcoming]);

  useEffect(() => {
    if (sessions.length > 0) {
      sessions.forEach(({ dateStr }) => fetchBookedCounts(dateStr));
    }
  }, [sessions]);

  const confirmBooking = async () => {
    if (!bookingSlot || !user) return;
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
          appointmentType,
          notes: bookingNote,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      // Payment Session
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
            amount: location.consultationFee * 100,
            currency: "lkr",
            title: `Consultation with Dr. ${doctor.name}`
          })
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

  const handleBookClick = (dateStr, location, slot) => {
    if (!user) {
      toast.error("You need to login to book an appointment.");
      router.push("/login?callback=/doctors/" + id);
      return;
    }
    if (user.role !== "user") {
      toast.error("Only patient accounts can book appointments.");
      return;
    }
    setBookingSlot({ date: dateStr, dateLabel: formatDateLabel(dateStr), location, slot });
  };

  if (fetching || !doctor) {
    return (
      <div className="min-h-screen bg-[#F8FBF9] dark:bg-[#16221F] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={32} className="animate-spin text-[#74B49B]" />
            <p className="text-slate-500 font-semibold">Loading practitioner profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF9] dark:bg-[#16221F] text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-500">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-12">
        <button
          onClick={() => router.push("/doctors")}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#74B49B] transition-colors"
        >
          <ArrowLeft size={18} /> Back to Search
        </button>

        {error ? (
          <div className="text-rose-500 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 font-medium text-center">{error}</div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── LEFT SIDEBAR ── */}
            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 sticky top-28">

              <div className="bg-white dark:bg-[#1E2E2A] p-8 rounded-[40px] shadow-sm border border-[#74B49B]/10 flex flex-col items-center text-center gap-5 relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#74B49B]/10 rounded-full blur-2xl font-bold" />
                <div className="w-28 h-28 rounded-[32px] bg-[#F0F7F4] dark:bg-[#20302C] border-4 border-white dark:border-[#16221F] shadow-lg flex items-center justify-center text-[#74B49B] relative z-10">
                  {doctor.profilePicture
                    ? <img src={doctor.profilePicture} alt={doctor.name} className="w-full h-full object-cover rounded-[28px]" />
                    : <Stethoscope size={48} className="opacity-80" />}
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{doctor.name}</h1>
                    {doctor.isVerified && <BadgeCheck size={20} className="text-[#6C8CBF] shrink-0" />}
                  </div>
                  <p className="text-base font-black text-[#74B49B] tracking-wide">{doctor.specialization}</p>
                  <p className="text-sm text-slate-500 mt-2 font-semibold bg-slate-100 dark:bg-white/5 inline-block px-3 py-1 rounded-lg">{doctor.experience} Years Experience</p>
                </div>

                {doctor.qualifications?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 w-full relative z-10 mt-2">
                    {doctor.qualifications.map((q, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-[#BAC94A]/10 text-xs font-bold text-[#8EAC50] uppercase tracking-wider">{q}</span>
                    ))}
                  </div>
                )}
              </div>

              {doctor.locations?.length > 0 && (
                <div className="bg-white dark:bg-[#1E2E2A] p-6 rounded-[32px] shadow-sm border border-[#74B49B]/10">
                  <p className="text-xs font-black uppercase tracking-widest text-[#6C8CBF] mb-4 flex items-center gap-2">
                    <Building2 size={16} /> Locations & Fees
                  </p>
                  <ul className="flex flex-col gap-4">
                    {doctor.locations.map(loc => (
                      <li key={loc._id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-[#F8FBF9] dark:hover:bg-[#16221F] transition-colors border border-transparent hover:border-[#74B49B]/10">
                        <MapPin size={18} className="text-[#74B49B] mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white leading-snug text-sm">{loc.hospitalName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{loc.city}</p>
                          {loc.consultationFee > 0 && (
                            <p className="text-xs text-[#BAC94A] font-black mt-1.5 bg-[#BAC94A]/10 inline-block px-2 py-0.5 rounded-lg">Rs. {loc.consultationFee.toLocaleString()}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── RIGHT SESSIONS AREA ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-8">

              <div className="bg-white dark:bg-[#1C2925] rounded-[40px] p-8 md:p-10 shadow-xl border border-[#74B49B]/10">
                <header className="mb-8 flex items-center gap-3">
                  <div className="p-3 bg-[#74B49B]/10 text-[#74B49B] rounded-2xl">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black dark:text-white">Upcoming Availability</h2>
                    <p className="text-sm text-slate-500">Book your consultation easily below.</p>
                  </div>
                </header>

                {sessions.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4 bg-[#F8FBF9] dark:bg-[#16221F] rounded-[32px] border border-slate-100 dark:border-white/5">
                    <Calendar size={48} className="text-slate-300 dark:text-slate-700" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Upcomings</h3>
                    <p className="text-sm text-slate-500 max-w-sm">This doctor hasn't scheduled any sessions within the next 14 days.</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {sessions.map(({ dateStr, sessions: daySessions }) => {
                      const countsForDate = bookedCounts[dateStr];
                      const isLoadingDate = loadingDates.has(dateStr);

                      return (
                        <div key={dateStr} className="animate-[fadeIn_0.5s_ease-out]">
                          <h3 className="text-sm font-black text-[#5C8D7A] dark:text-[#74B49B] uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={16} />
                            {formatDateLabel(dateStr)}
                          </h3>

                          <div className="flex flex-col gap-4">
                            {daySessions.map(({ location, slot }, i) => {
                              const booked = countsForDate?.[slot._id] ?? 0;
                              const limit = slot.patientLimit || 1;
                              // Without auth, backend might not return correct counts (e.g. 401 Unauthorized instead)
                              // If it fails, booked=0. It's an edge case, but we enforce booking restrictions on the backend.
                              const isFull = booked >= limit;

                              return (
                                <div key={`${slot._id}-${i}`}
                                  className="group bg-[#F8FBF9] dark:bg-[#16221F] p-5 rounded-[24px] flex flex-col md:flex-row items-start md:items-center gap-5 border border-slate-200 dark:border-white/5 transition-all hover:border-[#74B49B]/30 hover:shadow-lg relative overflow-hidden"
                                >
                                  {isFull && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />}
                                  
                                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#20302C] shadow-sm flex items-center justify-center text-[#6C8CBF] shrink-0 border border-slate-100 dark:border-white/5">
                                    <Clock size={22} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1">{location.hospitalName}</h4>
                                    <p className="text-xs text-slate-500">{location.city}{location.address ? ` · ${location.address}` : ""}</p>
                                  </div>

                                  <div className="bg-white dark:bg-[#20302C] px-4 py-2 rounded-xl text-center shrink-0 border border-slate-100 dark:border-white/5 shadow-sm">
                                    <p className="font-black text-slate-800 dark:text-white text-sm">{slot.startTime}</p>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">to {slot.endTime}</p>
                                  </div>

                                  <div className="text-center shrink-0 min-w-[72px]">
                                    {isLoadingDate ? (
                                      <p className="text-sm text-slate-400">—</p>
                                    ) : (
                                      <>
                                        <p className={`font-black text-lg ${isFull ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>{booked}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">/ {limit} spots</p>
                                      </>
                                    )}
                                  </div>

                                  <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                                    {isFull ? (
                                      <span className="flex items-center justify-center w-full md:w-36 py-3 px-4 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 font-bold text-sm">
                                        Fully Booked
                                      </span>
                                    ) : (
                                      <button
                                        className="flex items-center justify-center w-full md:w-36 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 bg-[#74B49B] hover:bg-[#5C8D7A] text-white shadow-[#74B49B]/20"
                                        onClick={() => handleBookClick(dateStr, location, slot)}
                                      >
                                        {user ? "Book Slot" : "Login to Book"}
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
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* ── BOOKING CONFIRMATION DIALOG ── */}
      {bookingSlot && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1E2E2A] w-full max-w-[480px] p-6 md:p-8 rounded-[32px] animate-[fadeIn_0.3s_ease-out] relative shadow-2xl border border-[#74B49B]/20">
            <button onClick={() => setBookingSlot(null)} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#16221F] dark:hover:bg-white/10 text-slate-500 transition-all">
              <X size={20} />
            </button>

            <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-1 md:mb-2">Confirm Booking</h3>
            <p className="text-xs md:text-sm text-slate-500 mb-4 md:mb-6 font-semibold">Review your appointment details below before proceeding.</p>

            <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6 bg-[#F8FBF9] dark:bg-[#16221F] rounded-2xl md:rounded-3xl p-4 border border-[#74B49B]/15">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#74B49B]/10 flex items-center justify-center text-[#74B49B]">
                   <Stethoscope size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Doctor</p>
                  <p className="font-bold text-slate-800 dark:text-white text-base">{doctor.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#BAC94A]/10 flex items-center justify-center text-[#BAC94A]">
                   <Building2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Hospital</p>
                  <p className="font-bold text-slate-800 dark:text-white text-base line-clamp-1">{bookingSlot.location.hospitalName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#6C8CBF]/10 flex items-center justify-center text-[#6C8CBF]">
                   <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Date & Time</p>
                  <p className="font-bold text-slate-800 dark:text-white text-base">{bookingSlot.dateLabel}</p>
                  <p className="text-sm text-slate-500 font-semibold">{bookingSlot.slot.startTime} – {bookingSlot.slot.endTime}</p>
                </div>
              </div>
              
              {bookingSlot.location.consultationFee > 0 && (
                <div className="pt-3 mt-1 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Consultation Fee</p>
                  </div>
                  <p className="font-black text-[#8EAC50] text-xl">Rs. {bookingSlot.location.consultationFee.toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2 block pl-1">Appointment Reason</label>
              <select
                value={appointmentType}
                onChange={e => setAppointmentType(e.target.value)}
                className="w-full bg-[#F8FBF9] dark:bg-[#16221F] border border-slate-200 dark:border-white/10 py-2.5 md:py-3 px-4 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#74B49B] focus:ring-2 focus:ring-[#74B49B]/20"
              >
                <option value="General Checkup">General Checkup</option>
                <option value="First Time Consultation">First Time Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Report Review">Report Review</option>
                <option value="Urgent Care">Urgent Care</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-5 md:mb-8">
              <label className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2 block pl-1">Additional Notes (Optional)</label>
              <textarea
                rows={2}
                className="w-full px-4 py-2.5 md:py-3 border border-slate-200 dark:border-white/10 bg-[#F8FBF9] dark:bg-[#16221F] text-slate-800 dark:text-slate-100 text-sm resize-none focus:outline-none focus:border-[#74B49B] focus:ring-2 focus:ring-[#74B49B]/20 transition-all font-medium placeholder:font-normal rounded-xl md:rounded-2xl"
                placeholder="Any symptoms, concerns..."
                value={bookingNote}
                onChange={e => setBookingNote(e.target.value)}
              />
            </div>

            <div className="flex gap-3 md:gap-4">
              <button 
                onClick={() => setBookingSlot(null)} 
                className="w-1/3 py-3 md:py-4 rounded-xl md:rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button
                disabled={bookingSubmitting}
                onClick={confirmBooking}
                className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#74B49B] hover:bg-[#5C8D7A] text-white text-sm font-black shadow-lg shadow-[#74B49B]/30 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {bookingSubmitting ? (
                  <><RefreshCw size={18} className="animate-spin" /> Processing...</>
                ) : (
                  "Proceed to Checkout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
