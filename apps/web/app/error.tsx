"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an analytics or reporting system if available
    console.error("[Global Error Boundary]:", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "var(--space-6)",
        textAlign: "center",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          fontSize: "48px",
          color: "var(--color-danger)",
        }}
        aria-hidden="true"
      >
        ⚠️
      </div>
      
      <h2
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-text-primary)",
        }}
      >
        দুঃখিত, কোনো একটি সমস্যা হয়েছে!
      </h2>

      <p
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-secondary)",
          maxWidth: "400px",
          lineHeight: "1.6",
        }}
      >
        সার্ভারের সাথে সংযোগে কোনো জটিলতা বা অভ্যন্তরীণ সমস্যা দেখা দিয়েছে। দয়া করে আবার চেষ্টা করুন।
      </p>

      <button
        onClick={() => reset()}
        className="btn btn--primary"
        style={{
          marginTop: "var(--space-2)",
          padding: "var(--space-2) var(--space-6)",
          fontSize: "var(--font-size-md)",
          justifyContent: "center",
        }}
      >
        পুনরায় চেষ্টা করুন
      </button>
    </div>
  );
}
