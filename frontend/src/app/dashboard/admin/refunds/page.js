"use client";

import { useEffect, useState } from "react";

export default function RefundsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchData = () => {
    fetch(`${API_URL}/payment`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("API failed");
        }
        return res.json();
      })
      .then((res) => {
        const refundedData = res.filter((item) => item.status === "refunded");
        setData(refundedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">🔄 Refunded Transactions</h1>

      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-slate-500">No refunded transactions found.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 shadow rounded-xl border border-slate-200 dark:border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 dark:bg-white/5 text-left text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Appointment</th>
                <th className="px-4 py-3">Amount Refunded</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>

            <tbody className="text-slate-800 dark:text-slate-200">
              {data.map((item) => (
                <tr key={item._id} className="border-t border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">{item.userId || "-"}</td>
                  <td className="px-4 py-3">{item.appointmentId || "-"}</td>
                  <td className="px-4 py-3 text-red-500 font-medium">Rs. {item.amount / 100}</td>

                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
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
