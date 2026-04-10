"use client";

import { useEffect, useState } from "react";

export default function TransactionsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =  process.env.NEXT_PUBLIC_API_URL;

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
                  <td className="px-4 py-3">Rs. {item.amount / 100}</td>

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