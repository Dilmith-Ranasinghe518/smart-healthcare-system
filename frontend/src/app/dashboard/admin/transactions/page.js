// // 'use client';
// // // Force re-compile to fix useState reference error

// // import { useState, useEffect } from 'react';
// // import { useAuth } from '@/context/AuthContext';
// // import { useRouter } from 'next/navigation';
// // import { CreditCard, Search, RefreshCw, CheckCircle, Clock, XCircle, ArrowUpRight, DollarSign } from 'lucide-react';

// // export default function TransactionsPage() {
// //   const { user, loading: authLoading } = useAuth();
// //   const router = useRouter();
// //   const [transactions, setTransactions] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [searchTerm, setSearchTerm] = useState('');

// //   // Auth guard
// //   useEffect(() => {
// //     if (!authLoading && (!user || user.role !== 'admin')) {
// //       router.push('/login');
// //     }
// //   }, [user, authLoading, router]);

// //   const fetchTransactions = async () => {
// //     if (!user?.token) return;
// //     setLoading(true);
// //     try {
// //       // Corrected path (removed extra /api) and added Authorization header
// //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/`, {
// //         headers: {
// //           'Authorization': `Bearer ${user.token}`
// //         }
// //       });
// //       const data = await response.json();
// //       if (Array.isArray(data)) {
// //         setTransactions(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
// //       }
// //     } catch (error) {
// //       console.error('Error fetching transactions:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (user?.role === 'admin') {
// //       fetchTransactions();
// //     }
// //   }, [user]);

// //   const getStatusStyle = (status) => {
// //     switch (status) {
// //       case 'paid': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
// //       case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
// //       case 'refunded': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
// //       default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
// //     }
// //   };

// //   const filteredTransactions = transactions.filter(tx => 
// //     tx._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //     tx.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //     tx.status.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

// //   const totalRevenue = transactions
// //     .filter(tx => tx.status === 'paid')
// //     .reduce((sum, tx) => sum + tx.amount, 0);

// //   return (
// //     <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
// //       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //         <div>
// //           <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
// //             <CreditCard className="text-indigo-500" />
// //             Payment Transactions
// //           </h1>
// //           <p className="text-slate-500 dark:text-slate-400">Monitor and manage all financial activities</p>
// //         </div>
// //         <div className="flex items-center gap-2">
// //           <button 
// //             onClick={fetchTransactions}
// //             className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-all border border-slate-200 dark:border-white/10"
// //             title="Refresh"
// //           >
// //             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
// //           </button>
// //         </div>
// //       </div>

// //       {/* Stats Cards */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //         <div className="glass-panel p-6 bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/10">
// //           <div className="flex justify-between items-start">
// //             <div>
// //               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Revenue</p>
// //               <h3 className="text-3xl font-bold text-slate-800 dark:text-white">${totalRevenue.toLocaleString()}</h3>
// //             </div>
// //             <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
// //               <DollarSign size={24} />
// //             </div>
// //           </div>
// //           <p className="text-xs text-emerald-500 font-medium mt-4 flex items-center gap-1">
// //              All processed payments
// //           </p>
// //         </div>

// //         <div className="glass-panel p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10">
// //           <div className="flex justify-between items-start">
// //             <div>
// //               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Transactions</p>
// //               <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{transactions.length}</h3>
// //             </div>
// //             <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
// //               <ArrowUpRight size={24} />
// //             </div>
// //           </div>
// //           <p className="text-xs text-slate-500 mt-4">Lifetime records</p>
// //         </div>

// //         <div className="glass-panel p-6 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/10">
// //           <div className="flex justify-between items-start">
// //             <div>
// //               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Pending Payments</p>
// //               <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
// //                 {transactions.filter(t => t.status === 'pending').length}
// //               </h3>
// //             </div>
// //             <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
// //               <Clock size={24} />
// //             </div>
// //           </div>
// //           <p className="text-xs text-slate-500 mt-4">Awaiting completion</p>
// //         </div>
// //       </div>

// //       {/* Main Content */}
// //       <div className="glass-panel overflow-hidden border-slate-200 dark:border-white/5">
// //         <div className="p-4 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-white/5">
// //           <div className="relative flex-1">
// //             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
// //             <input 
// //               type="text" 
// //               placeholder="Search by ID, User, or Status..."
// //               className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 ring-indigo-500/20 transition-all text-sm"
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //             />
// //           </div>
// //         </div>

// //         <div className="overflow-x-auto">
// //           <table className="w-full text-left border-collapse">
// //             <thead>
// //               <tr className="bg-slate-50/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
// //                 <th className="p-4 font-semibold">Date</th>
// //                 <th className="p-4 font-semibold">Transaction Details</th>
// //                 <th className="p-4 font-semibold">User ID</th>
// //                 <th className="p-4 font-semibold">Amount</th>
// //                 <th className="p-4 font-semibold text-center">Status</th>
// //               </tr>
// //             </thead>
// //             <tbody className="divide-y divide-slate-200 dark:divide-white/5">
// //               {loading ? (
// //                 <tr>
// //                    <td colSpan="5" className="p-20 text-center">
// //                      <div className="flex flex-col items-center gap-3">
// //                        <RefreshCw className="animate-spin text-indigo-500" size={32} />
// //                        <p className="text-slate-500 font-medium">Synchronizing records...</p>
// //                      </div>
// //                    </td>
// //                 </tr>
// //               ) : filteredTransactions.length === 0 ? (
// //                 <tr>
// //                    <td colSpan="5" className="p-20 text-center">
// //                      <div className="flex flex-col items-center gap-3 opacity-50">
// //                        <Search size={48} className="text-slate-300" />
// //                        <p className="text-slate-500 font-medium">No records found matching your search</p>
// //                      </div>
// //                    </td>
// //                 </tr>
// //               ) : filteredTransactions.map((tx) => (
// //                 <tr key={tx._id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-all group cursor-default">
// //                   <td className="p-4">
// //                     <div className="flex flex-col">
// //                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
// //                         {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
// //                       </span>
// //                       <span className="text-xs text-slate-500">
// //                         {new Date(tx.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
// //                       </span>
// //                     </div>
// //                   </td>
// //                   <td className="p-4">
// //                     <div className="flex flex-col gap-1">
// //                       <span className="text-xs font-mono text-slate-500 dark:text-slate-600 truncate max-w-[200px]">ID: {tx._id}</span>
// //                       {tx.stripeSessionId && (
// //                         <span className="text-[10px] text-indigo-400/70 truncate max-w-[200px]">Stripe: {tx.stripeSessionId}</span>
// //                       )}
// //                     </div>
// //                   </td>
// //                   <td className="p-4">
// //                     <div className="flex items-center gap-2">
// //                       <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-white/10 group-hover:border-indigo-400 transition-colors">
// //                         UID
// //                       </div>
// //                       <span className="text-xs font-medium text-slate-600 dark:text-slate-400 font-mono truncate max-w-[120px]">{tx.userId}</span>
// //                     </div>
// //                   </td>
// //                   <td className="p-4">
// //                     <div className="text-sm font-bold text-slate-800 dark:text-white">
// //                       ${tx.amount.toLocaleString()}
// //                     </div>
// //                   </td>
// //                   <td className="p-4 text-center">
// //                     <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${getStatusStyle(tx.status)}`}>
// //                       {tx.status === 'paid' && <CheckCircle size={12} />}
// //                       {tx.status === 'pending' && <Clock size={12} />}
// //                       {tx.status === 'refunded' && <XCircle size={12} />}
// //                       {tx.status}
// //                     </span>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// "use client";

// import { useEffect, useState } from "react";

// export default function TransactionsPage() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

//   useEffect(() => {
//     fetch(`${API_URL}/payment`)
//       .then((res) => res.json())
//       .then((res) => {
//         setData(res);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error(err);
//         setLoading(false);
//       });
//   }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">💳 Transactions</h1>

//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <div className="overflow-x-auto bg-white shadow rounded-xl">
//           <table className="min-w-full text-sm">
//             <thead className="bg-gray-100 text-left">
//               <tr>
//                 <th className="px-4 py-3">User</th>
//                 <th className="px-4 py-3">Appointment</th>
//                 <th className="px-4 py-3">Amount</th>
//                 <th className="px-4 py-3">Status</th>
//                 <th className="px-4 py-3">Date</th>
//               </tr>
//             </thead>

//             <tbody>
//               {data.map((item) => (
//                 <tr key={item._id} className="border-t">
//                   <td className="px-4 py-3">{item.userId || "-"}</td>
//                   <td className="px-4 py-3">{item.appointmentId || "-"}</td>
//                   <td className="px-4 py-3">Rs. {item.amount}</td>

//                   <td className="px-4 py-3">
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                         item.status === "paid"
//                           ? "bg-green-100 text-green-700"
//                           : "bg-yellow-100 text-yellow-700"
//                       }`}
//                     >
//                       {item.status}
//                     </span>
//                   </td>

//                   <td className="px-4 py-3">
//                     {new Date(item.createdAt).toLocaleString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

export default function TransactionsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =  "http://localhost:5005/api";

  // useEffect(() => {
  //   fetch(`${API_URL}/payment`)
  //     .then((res) => res.json())
  //     .then((res) => {
  //       setData(res);
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       setLoading(false);
  //     });
  // }, []);

  useEffect(() => {
  fetch(`${API_URL}/payment`)
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        console.error("❌ API ERROR:", text);
        throw new Error("API failed");
      }
      return res.json();
    })
    .then((res) => {
      console.log("✅ DATA:", res);
      setData(res);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setLoading(false);
    });
}, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">💳 Transactions</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Appointment</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-3">{item.userId || "-"}</td>
                  <td className="px-4 py-3">{item.appointmentId || "-"}</td>
                  <td className="px-4 py-3">Rs. {item.amount}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}