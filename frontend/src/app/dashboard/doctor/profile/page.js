"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { UserCircle, Edit, MapPin, Building2, BadgeCheck, Stethoscope, Clock, Ban } from "lucide-react";
import DoctorProfileModal from "@/components/DoctorProfileModal";
import toast from "react-hot-toast";

const DOCTOR_API = process.env.NEXT_PUBLIC_DOCTOR_API_URL || "http://localhost:5007";

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
      // Fetch my profile
      const profRes = await fetch(`${DOCTOR_API}/api/doctors/me`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const profData = await profRes.json();
      if (!profRes.ok) throw new Error(profData.message);
      
      setDoctor(profData.doctor); // null if not created yet

      // Fetch all hospitals for the modal dropdown
      const hospRes = await fetch(`${DOCTOR_API}/api/hospitals?isActive=all`, {
        headers: { Authorization: `Bearer ${user.token}` }
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

  if (loading || !user) return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-4xl mx-auto">
      
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-slate-400 mb-2">
            My Profile
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage your public doctor profile, contact details, and hospital availability.
          </p>
        </div>
      </header>

      {error && (
        <div className="text-rose-500 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 mb-6 font-medium">
          {error}
        </div>
      )}

      {fetching ? (
        <div className="py-20 text-center text-slate-500 text-sm">Verifying profile status...</div>
      ) : !doctor ? (
        /* Profile Not Created State */
        <div className="glass-panel py-20 px-6 text-center flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2">
            <UserCircle size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Profile Not Configured</h3>
          <p className="text-slate-500 text-sm max-w-md">
            Your user account doesn't have a linked professional doctor profile yet. 
            Create one now to appear in patient searches and start receiving appointments.
          </p>
          <button className="btn btn-primary mt-4 px-8" onClick={() => setModalOpen(true)}>
            Create Professional Profile
          </button>
        </div>
      ) : (
        /* Profile View State */
        <div className="flex flex-col gap-6">
          
          <div className="glass-panel p-8 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -mr-10 -mt-20 pointer-events-none rounded-full" />
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border-2 border-indigo-500/20 flex flex-col items-center justify-center text-indigo-500 flex-shrink-0 shadow-inner">
                <Stethoscope size={32} />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{doctor.name}</h3>
                  {doctor.isVerified && (
                    <span className="badge badge-doctor px-2.5 py-1 text-[10px] mx-auto sm:mx-0 flex items-center gap-1">
                      <BadgeCheck size={12} /> VERIFIED
                    </span>
                  )}
                </div>
                <p className="text-indigo-500 dark:text-indigo-400 font-semibold mb-3">{doctor.specialization}</p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                  <span className="badge bg-slate-100 dark:bg-white/5 border-none text-slate-600 dark:text-slate-300 px-3 py-1">
                    {doctor.experience} Yrs Experience
                  </span>
                  {doctor.qualifications?.map((q, i) => (
                    <span key={i} className="badge bg-slate-100 dark:bg-white/5 border-none text-slate-600 dark:text-slate-300 px-3 py-1">
                      {q}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                className="btn btn-secondary flex items-center gap-2 self-center sm:self-start flex-shrink-0"
                onClick={() => setModalOpen(true)}
              >
                <Edit size={16} /> Edit Profile
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8">
            <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2">
              <Building2 size={16} /> Practice Locations & Availability
            </h4>

            {doctor.locations?.length === 0 ? (
              <p className="text-slate-500 text-sm italic bg-slate-50 dark:bg-white/5 p-4 rounded-xl text-center">
                You haven't added any hospital locations yet. Patients cannot book appointments with you until you add a location and availability slots.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctor.locations.map(loc => (
                  <div key={loc._id} className="border border-slate-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 dark:text-slate-100">{loc.hospitalName}</h5>
                        <p className="text-xs text-slate-500">{loc.address}, {loc.city}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Weekly Slots ({loc.availability?.length || 0}){loc.consultationFee > 0 ? ` · Rs. ${loc.consultationFee.toLocaleString()}` : ''}</p>
                      {loc.availability?.length > 0 ? (
                        <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                          {loc.availability.map(slot => (
                            <span key={slot._id} className={`text-[10px] font-medium px-2 py-1 border rounded shadow-sm whitespace-nowrap flex items-center justify-between gap-2 ${
                              slot.isAvailable === false
                                ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-400 line-through'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                            }`}>
                              <span>{slot.day.substring(0,3)}: {slot.startTime}-{slot.endTime}</span>
                              <span className="text-slate-400 font-normal">Limit: {slot.patientLimit}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No time slots added.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reused Doctor Profile Modal in either Create or Edit Mode */}
      {modalOpen && (
        <DoctorProfileModal
          doctor={doctor}           // pass null for create, obj for edit
          hospitals={hospitals}     // needed for adding locations
          doctorUsers={[]}          // not needed, isAdmin=false will hide user binding selector
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
