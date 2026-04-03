"use client";
import { useState, useEffect, useMemo } from "react";
import { X, Calendar, MapPin, Clock, Info } from "lucide-react";

// The appointment service port is 5070 based on docker-compose.yml
const APPOINTMENT_API = process.env.NEXT_PUBLIC_APPOINTMENT_API_URL;

// Helper: slice a master time range (e.g. 14:00 - 17:00) into 30 minute chunks
const generateSubSlots = (masterSlot) => {
  const chunks = [];
  const [sH, sM] = masterSlot.startTime.split(':').map(Number);
  const [eH, eM] = masterSlot.endTime.split(':').map(Number);

  let currentMinutes = sH * 60 + sM;
  const endMinutes = eH * 60 + eM;

  while (currentMinutes + 30 <= endMinutes) {
    const hh = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
    const mm = (currentMinutes % 60).toString().padStart(2, '0');

    const nextMinutes = currentMinutes + 30;
    const nextHh = Math.floor(nextMinutes / 60).toString().padStart(2, '0');
    const nextMm = (nextMinutes % 60).toString().padStart(2, '0');

    chunks.push({
      _id: masterSlot._id, // Keep master slot ID for DB reference
      sliceStartTime: `${hh}:${mm}`,
      sliceEndTime: `${nextHh}:${nextMm}`,
    });

    currentMinutes += 30;
  }
  return chunks;
};

export default function BookAppointmentModal({ doctor, onClose, token }) {
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [date, setDate] = useState("");

  // Array of dynamically sliced 30min chunks for the selected Date
  const [daySlots, setDaySlots] = useState([]);

  // Array of { slotId, startTime } objects that are already booked
  const [bookedSlots, setBookedSlots] = useState([]);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState("");

  const [checking, setChecking] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Default location to the first one available
  useEffect(() => {
    if (doctor?.locations?.length > 0) {
      setSelectedLocationId(doctor.locations[0]._id);
    }
  }, [doctor]);

  // Compute the upcoming 14 days that match the doctor's availability for the selected location
  const availableUpcomingDates = useMemo(() => {
    if (!selectedLocationId || !doctor?.locations) return [];

    const loc = doctor.locations.find(l => l._id === selectedLocationId);
    if (!loc || !loc.availability || loc.availability.length === 0) return [];

    // Unique days the doctor works at this location
    const validDays = [...new Set(loc.availability.map(s => s.day))];

    const dates = [];
    const today = new Date();

    // Look ahead next 14 days
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);

      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      if (validDays.includes(dayName)) {
        // Correctly format YYYY-MM-DD
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayNum = String(d.getDate()).padStart(2, '0');

        dates.push({
          dateStr: `${y}-${m}-${dayNum}`,
          displayDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          dayName
        });
      }
    }
    return dates;
  }, [doctor, selectedLocationId]);

  // Auto-select the first available date if none selected and dates exist
  useEffect(() => {
    if (availableUpcomingDates.length > 0 && !date) {
      setDate(availableUpcomingDates[0].dateStr);
    } else if (availableUpcomingDates.length === 0) {
      setDate("");
    }
  }, [availableUpcomingDates, date]);

  // When date changes, compute the sub-slots and fetch bookings
  useEffect(() => {
    if (!date || !selectedLocationId) {
      setDaySlots([]);
      setBookedSlots([]);
      setSelectedSlot(null);
      return;
    }

    const loc = doctor.locations.find(l => l._id === selectedLocationId);
    if (!loc) return;

    const dateObj = availableUpcomingDates.find(d => d.dateStr === date);
    if (!dateObj) return;

    // Filter master slots for this specific day of the week
    const masterSlotsForDay = loc.availability.filter(slot => slot.day === dateObj.dayName);

    // Slice each master slot into 30 min chunks
    let allChunks = [];
    masterSlotsForDay.forEach(ms => {
      const chunks = generateSubSlots(ms);
      allChunks = [...allChunks, ...chunks];
    });

    // Sort chronologically
    allChunks.sort((a, b) => a.sliceStartTime.localeCompare(b.sliceStartTime));

    // If today is selected, filter out past times
    const isToday = date === new Date().toISOString().split('T')[0];
    if (isToday) {
      const now = new Date();
      const currentHhMm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      allChunks = allChunks.filter(c => c.sliceStartTime >= currentHhMm);
    }

    setDaySlots(allChunks);
    setSelectedSlot(null);

    if (allChunks.length > 0) {
      fetchBookedSlots(date);
    } else {
      setBookedSlots([]);
    }
  }, [date, selectedLocationId, availableUpcomingDates, doctor]);

  const fetchBookedSlots = async (selectedDate) => {
    setChecking(true);
    setError("");
    try {
      const res = await fetch(`${APPOINTMENT_API}/api/appointments/doctor/${doctor._id}/booked-slots?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setBookedSlots(data.bookedSlots || []);
    } catch (err) {
      console.warn("Error fetching booked slots:", err);
      setError("Failed to verify slot availability reliably. You can attempt booking.");
    } finally {
      setChecking(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !date || !selectedLocationId) return;

    setBooking(true);
    setError("");
    try {
      const res = await fetch(`${APPOINTMENT_API}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: doctor._id,
          locationId: selectedLocationId,
          slotId: selectedSlot._id,      // Master slot ID
          startTime: selectedSlot.sliceStartTime, // Dynamic slice
          endTime: selectedSlot.sliceEndTime,
          date,
          notes: notes.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to book appointment");

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Book Appointment</h3>
            <p className="text-sm text-slate-500 mt-0.5">with <span className="font-semibold">{doctor.name}</span></p>
          </div>
          <button
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-500"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto w-full">
          {success ? (
            <div className="text-center py-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Calendar size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Booking Confirmed!</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Your appointment request for {date} at {selectedSlot.sliceStartTime} has been submitted and is currently <strong>PENDING</strong> doctor approval.
              </p>
              <button className="btn btn-primary px-8" onClick={onClose}>
                Done
              </button>
            </div>
          ) : (
            <form id="booking-form" className="flex flex-col gap-6" onSubmit={handleBook}>

              {/* Error Alert */}
              {error && (
                <div className="text-rose-500 text-sm bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                  {error}
                </div>
              )}

              {/* 1. Pick Location */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">1. Select Location</label>
                <div className="flex flex-col gap-2">
                  {doctor.locations?.map(loc => (
                    <label
                      key={loc._id}
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${selectedLocationId === loc._id
                          ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10"
                          : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="location"
                          value={loc._id}
                          checked={selectedLocationId === loc._id}
                          onChange={(e) => {
                            setSelectedLocationId(e.target.value);
                            setDate(""); // reset date when loc changes
                          }}
                          className="w-4 h-4 text-indigo-500 border-slate-300 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <MapPin size={14} className="text-indigo-400" />
                            {loc.hospitalName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 ml-5">{loc.address}, {loc.city}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. Pick Date from Upcoming 14 Days */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>2. Upcoming Availability (Next 14 Days)</span>
                </label>

                {availableUpcomingDates.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
                    <p className="text-sm text-slate-500 italic flex items-center justify-center gap-2">
                      <Info size={16} className="text-amber-500" /> No upcoming availability.
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
                    {availableUpcomingDates.map(d => (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => setDate(d.dateStr)}
                        className={`flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl border transition-all snap-start ${date === d.dateStr
                            ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-300"
                          }`}
                      >
                        <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${date === d.dateStr ? "text-indigo-100" : "text-slate-400"}`}>
                          {d.dayName.substring(0, 3)}
                        </span>
                        <span className="text-sm font-semibold">{d.displayDate}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Pick 30-Min Slice Slot */}
              {date && availableUpcomingDates.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>3. Select Time</span>
                    {checking && <span className="text-[10px] text-indigo-400 flex items-center gap-1 animate-pulse"><Clock size={10} /> Checking bookings...</span>}
                  </label>

                  {daySlots.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl text-center border border-slate-200 dark:border-white/5">
                      <p className="text-sm text-slate-500 italic">No slots available for the selected date.</p>
                      <p className="text-xs text-slate-400 mt-1">Please try selecting a different date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                      {daySlots.map((chunk, idx) => {
                        const isBooked = bookedSlots.some(b => b.slotId === chunk._id && b.startTime === chunk.sliceStartTime);
                        const isSelected = selectedSlot?.sliceStartTime === chunk.sliceStartTime && selectedSlot?._id === chunk._id;

                        return (
                          <button
                            key={`${chunk._id}-${idx}`}
                            type="button"
                            disabled={isBooked || checking}
                            onClick={() => setSelectedSlot(chunk)}
                            className={`px-2 py-2.5 rounded-lg border text-xs font-medium transition-all ${isBooked
                                ? "opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed line-through"
                                : isSelected
                                  ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-300"
                              }`}
                          >
                            {chunk.sliceStartTime}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Notes (Optional) */}
              {selectedSlot && (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">4. Patient Notes (Optional)</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                    rows={2}
                    placeholder="Briefly describe your symptoms or reason for visit..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              )}

            </form>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
            <button
              type="button"
              className="btn btn-secondary flex-1 py-3 text-sm"
              onClick={onClose}
              disabled={booking}
            >
              Cancel
            </button>
            <button
              form="booking-form"
              type="submit"
              className="btn btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2"
              disabled={!selectedSlot || !date || booking || checking}
            >
              {booking ? "Confirming..." : "Confirm Booking"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
