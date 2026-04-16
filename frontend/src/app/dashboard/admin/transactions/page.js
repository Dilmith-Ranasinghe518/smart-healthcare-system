"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";

export default function TransactionsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [transactionToRefund, setTransactionToRefund] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);

  const API_URL =  process.env.NEXT_PUBLIC_API_URL;

  const fetchData = () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefund = (transaction) => {
    setTransactionToRefund(transaction);
    setShowRefundConfirm(true);
  };

  const confirmRefund = async () => {
    if (!transactionToRefund) return;
    
    setRefundLoading(true);
    try {
      const res = await fetch(`${API_URL}/payment/refund/${transactionToRefund._id}`, {
        method: "PUT",
      });
      if (res.ok) {
        setShowRefundConfirm(false);
        setTransactionToRefund(null);
        fetchData();
      } else {
        alert("Refund failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing refund");
    } finally {
      setRefundLoading(false);
    }
  };

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
                <th className="px-4 py-3">Action</th>
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
                          : item.status === "Doctor Cancelled"
                          ? "bg-red-100 text-red-700"
                          : item.status === "refunded"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    {item.status === "Doctor Cancelled" ? (
                      <button
                        onClick={() => handleRefund(item)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs shadow"
                      >
                        Refund
                      </button>
                    ) : item.status === "refunded" ? (
                      <span className="text-gray-500 text-xs font-medium">Refunded</span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={showRefundConfirm}
        onClose={() => {
          setShowRefundConfirm(false);
          setTransactionToRefund(null);
        }}
        onConfirm={confirmRefund}
        title="Confirm Refund"
        message={`Are you sure you want to refund Rs. ${transactionToRefund?.amount / 100} to this user? This action will update the transaction status to refunded.`}
        confirmText="Confirm Refund"
        isDestructive={true}
        isLoading={refundLoading}
      />
    </div>
  );
}