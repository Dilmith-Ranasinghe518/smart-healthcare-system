"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";


export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      fetch(`http://localhost:5005/api/payment/success/${sessionId}`, {
        method: "PUT",
        });
    }
  }, [sessionId]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>✅ Payment Successful</h1>
      <p>Your payment has been completed.</p>
    </div>
  );
}