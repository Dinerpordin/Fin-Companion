"use client";

import { useEffect } from "react";

export default function ProfilePage() {
  useEffect(() => {
    window.location.replace("https://hishab-nikash-delta.vercel.app/");
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px" }}>
      <div style={{ width: "28px", height: "28px", border: "3px solid var(--color-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
        হিসাব নিকাশ অ্যাপে পুনঃনির্দেশ করা হচ্ছে...
      </p>
    </div>
  );
}
