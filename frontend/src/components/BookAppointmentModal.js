"use client";
import { useState } from "react";
import { X, Calendar, Building2, Stethoscope, CircleDollarSign } from "lucide-react";

export default function BookAppointmentModal({ 
  isOpen, 
  onClose, 
  doctor, 
  bookingSlot, 
  taxSetting, 
  onConfirm, 
  isSubmitting 
}) {
  const [appointmentType, setAppointmentType] = useState("General Checkup");
  const [bookingNote, setBookingNote] = useState("");

  if (!isOpen || !bookingSlot) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-4xl p-6 lg:p-8 animate-[fadeIn_0.3s_ease-out] relative bg-white dark:bg-[#1E2E2A] rounded-3xl border border-[#74B49B]/10">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-all z-10">
          <X size={18} />
        </button>

        <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Confirm Appointment</h3>
        <p className="text-sm text-slate-500 mb-6">Review the details below before proceeding to payment.</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Left Column: Details */}
          <div className="md:col-span-3 flex flex-col gap-4 bg-[#F8FBF9] dark:bg-[#16221F] rounded-2xl p-5 border border-[#74B49B]/15 shadow-sm">
            <div className="flex items-start gap-3">
              <Stethoscope size={18} className="text-indigo-400 mt-1 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Doctor</p>
                <p className="font-semibold text-slate-800 dark:text-white text-base">{doctor.name}</p>
                <p className="text-sm text-[#74B49B]">{doctor.specialization}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 size={18} className="text-[#BAC94A] mt-1 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Hospital</p>
                <p className="font-semibold text-slate-800 dark:text-white text-base">{bookingSlot.location.hospitalName}</p>
                <p className="text-sm text-slate-500">{bookingSlot.location.city}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-[#6C8CBF] mt-1 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Date & Time</p>
                <p className="font-semibold text-slate-800 dark:text-white text-base">{bookingSlot.dateLabel}</p>
                <p className="text-sm text-slate-500">{bookingSlot.slot.startTime} – {bookingSlot.slot.endTime}</p>
              </div>
            </div>
            {bookingSlot.location.consultationFee > 0 && (
              <div className="flex items-start gap-3 h-full mt-2 lg:mt-0">
                <CircleDollarSign size={18} className="text-[#BAC94A] mt-1 shrink-0" />
                <div className="w-full flex flex-col h-full">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-2">Payment Summary</p>
                  
                  {/* Breakdown */}
                  <div className="flex flex-col gap-2 w-full bg-white dark:bg-[#20302C] border border-slate-100 dark:border-white/5 p-4 rounded-xl mb-auto text-sm text-slate-600 dark:text-slate-400 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span>Consultation Fee</span>
                      <span>Rs. {bookingSlot.location.consultationFee.toLocaleString()}</span>
                    </div>
                    {taxSetting?.percentage > 0 && (
                      <div className="flex justify-between items-center">
                        <span>Tax & Fees ({taxSetting.percentage}%)</span>
                        <span>Rs. {(bookingSlot.location.consultationFee * (taxSetting.percentage / 100)).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-100 dark:border-white/5 font-black text-slate-800 dark:text-white text-lg">
                      <span>Total Checkout</span>
                      <span className="text-[#8EAC50]">
                        Rs. {Math.round(bookingSlot.location.consultationFee * (1 + (taxSetting?.percentage || 0) / 100)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {taxSetting?.percentage > 0 && <p className="text-[11px] text-amber-500/80 italic mt-3">Taxes and service fees apply as per latest hospital regulations.</p>}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Inputs */}
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="mb-5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Appointment Type</label>
                <select
                  value={appointmentType}
                  onChange={e => setAppointmentType(e.target.value)}
                  className="w-full bg-[#F8FBF9] dark:bg-[#16221F] border border-slate-200 dark:border-white/10 py-3.5 px-4 text-sm rounded-xl focus:outline-none focus:border-[#74B49B] focus:ring-2 focus:ring-[#74B49B]/20 transition-all font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="General Checkup">General Checkup</option>
                  <option value="First Time Consultation">First Time Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Report Review">Report Review</option>
                  <option value="Urgent Care">Urgent Care</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Notes (optional)</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-[#F8FBF9] dark:bg-[#16221F] text-slate-800 dark:text-slate-100 text-sm resize-none focus:outline-none focus:border-[#74B49B] focus:ring-2 focus:ring-[#74B49B]/20 transition-all font-medium placeholder:font-normal"
                  placeholder="Any symptoms, concerns..."
                  value={bookingNote}
                  onChange={e => setBookingNote(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              <button
                disabled={isSubmitting}
                onClick={() => onConfirm(appointmentType, bookingNote)}
                className="w-full py-3.5 rounded-xl bg-[#74B49B] hover:bg-[#5C8D7A] text-white text-base font-bold shadow-lg shadow-[#74B49B]/20 transition-all active:scale-95 disabled:opacity-50 flex justify-center"
              >
                {isSubmitting ? "Processing..." : "Confirm & Pay"}
              </button>
              <button onClick={onClose} className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                Cancel
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
