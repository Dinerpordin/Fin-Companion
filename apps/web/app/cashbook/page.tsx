"use client";

import { useState } from "react";

export default function CashbookPage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div style={{ width: "100%", height: "calc(100dvh - var(--nav-height))", position: "relative", overflow: "hidden" }}>
      {isLoading && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-surface)",
          zIndex: 10,
          gap: "12px"
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            border: "3px solid var(--color-primary)",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }} />
          <span style={{ fontSize: "14px", color: "var(--color-text-secondary)", fontWeight: 500 }}>
            হিসাব নিকাশ ক্যাশবুক মডিউল লোড হচ্ছে...
          </span>
        </div>
      )}
      <iframe
        src="https://hishab-nikash-delta.vercel.app/"
        title="হিসাব নিকাশ ক্যাশবুক মডিউল"
        onLoad={() => setIsLoading(false)}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block"
        }}
        allow="geolocation; microphone; camera"
      />
    </div>
  );
}
