"use client";

import Link from "next/link";

export default function CancelPage() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ color: "red" }}>❌ Payment Cancelled</h1>
      <p>Your payment was not completed.</p>

      <Link href="/dashboard/user">
        <button style={{ marginTop: "20px", padding: "10px 20px" }}>
          Try Again
        </button>
      </Link>
    </div>
  );
}