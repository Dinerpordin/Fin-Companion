"use client";

import { useState } from "react";
import AudioAssist from "../components/AudioAssist";

const INSURANCE_TYPES = [
  { key: "health",    icon: "ðŸ¥", label: "à¦¸à§à¦¬à¦¾à¦¸à§à¦¥à§à¦¯ à¦¬à§€à¦®à¦¾"  },
  { key: "life",      icon: "ðŸ’€", label: "à¦œà§€à¦¬à¦¨ à¦¬à§€à¦®à¦¾"     },
  { key: "crop",      icon: "ðŸŒ¾", label: "à¦«à¦¸à¦² à¦¬à§€à¦®à¦¾"      },
  { key: "property",  icon: "ðŸ ", label: "à¦¸à¦®à§à¦ªà¦¦ à¦¬à§€à¦®à¦¾"    },
];

const EXPLAINER_SLIDES = [
  { icon: "ðŸ’°", title: "à¦†à¦ªà¦¨à¦¿ à¦ªà§à¦°à¦¤à¦¿ à¦®à¦¾à¦¸à§‡ à¦›à§‹à¦Ÿ à¦à¦•à¦Ÿà¦¿ à¦Ÿà¦¾à¦•à¦¾ à¦œà¦®à¦¾à¦¨", body: "à¦¬à§€à¦®à¦¾ à¦•à§‹à¦®à§à¦ªà¦¾à¦¨à¦¿à¦•à§‡ à¦¦à§‡à¦¨ â€” à¦à¦•à§‡ à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦¬à¦²à§‡à¥¤", audio: "à¦¬à§€à¦®à¦¾à¦¯à¦¼ à¦†à¦ªà¦¨à¦¿ à¦ªà§à¦°à¦¤à¦¿ à¦®à¦¾à¦¸à§‡ à¦›à§‹à¦Ÿ à¦à¦•à¦Ÿà¦¿ à¦Ÿà¦¾à¦•à¦¾ à¦¦à§‡à¦¨à¥¤ à¦à¦•à§‡ à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦¬à¦²à§‡à¥¤" },
  { icon: "ðŸ¥", title: "à¦¹à¦ à¦¾à§Ž à¦¬à¦¿à¦ªà¦¦ à¦¹à¦²à§‡ (à¦…à¦¸à§à¦¸à§à¦¥à¦¤à¦¾, à¦®à§ƒà¦¤à§à¦¯à§, à¦†à¦—à§à¦¨)", body: "à¦¬à§€à¦®à¦¾ à¦•à§‹à¦®à§à¦ªà¦¾à¦¨à¦¿ à¦à¦•à¦Ÿà¦¿ à¦¬à¦¡à¦¼ à¦Ÿà¦¾à¦•à¦¾ à¦¦à§‡à¦¯à¦¼ â€” à¦¯à¦¾à¦¤à§‡ à¦†à¦ªà¦¨à¦¾à¦•à§‡ à¦œà¦®à¦¿ à¦¬à¦¿à¦•à§à¦°à¦¿ à¦•à¦°à¦¤à§‡ à¦¨à¦¾ à¦¹à¦¯à¦¼à¥¤", audio: "à¦¬à¦¿à¦ªà¦¦ à¦¹à¦²à§‡ à¦¬à§€à¦®à¦¾ à¦•à§‹à¦®à§à¦ªà¦¾à¦¨à¦¿ à¦à¦•à¦Ÿà¦¿ à¦¬à¦¡à¦¼ à¦Ÿà¦¾à¦•à¦¾ à¦¦à§‡à¦¯à¦¼à¥¤ à¦¯à¦¾à¦¤à§‡ à¦†à¦ªà¦¨à¦¾à¦•à§‡ à¦¸à¦®à§à¦ªà¦¦ à¦¬à¦¿à¦•à§à¦°à¦¿ à¦•à¦°à¦¤à§‡ à¦¨à¦¾ à¦¹à¦¯à¦¼à¥¤" },
  { icon: "âœ…", title: "à¦¬à§€à¦®à¦¾ à¦•à§€ à¦¨à¦¯à¦¼?", body: "à¦¬à§€à¦®à¦¾ à¦²à¦¾à¦­à¦œà¦¨à¦• à¦¬à¦¿à¦¨à¦¿à¦¯à¦¼à§‹à¦— à¦¨à¦¯à¦¼à¥¤ à¦à¦Ÿà¦¿ à¦à§à¦à¦•à¦¿ à¦¥à§‡à¦•à§‡ à¦¸à§à¦°à¦•à§à¦·à¦¾ à¦®à¦¾à¦¤à§à¦°à¥¤", audio: "à¦¬à§€à¦®à¦¾ à¦¬à¦¿à¦¨à¦¿à¦¯à¦¼à§‹à¦— à¦¨à¦¯à¦¼à¥¤ à¦à¦Ÿà¦¿ à¦¬à¦¿à¦ªà¦¦à§‡à¦° à¦¸à¦®à¦¯à¦¼ à¦¸à§à¦°à¦•à§à¦·à¦¾ à¦¦à§‡à¦¯à¦¼à¥¤" },
];

const PRODUCTS: Record<string, { name: string; provider: string; premium: string; covers: string; claim: string; idra: string; audio: string }[]> = {
  health: [
    {
      name: "à¦¸à§à¦¬à¦¾à¦¸à§à¦¥à§à¦¯ à¦¸à§à¦°à¦•à§à¦·à¦¾ à¦¬à§€à¦®à¦¾",
      provider: "Delta Life Insurance",
      premium: "à¦®à¦¾à¦¸à§‡ à§³à§§à§«à§¦-à§³à§«à§¦à§¦",
      covers: "à¦¹à¦¾à¦¸à¦ªà¦¾à¦¤à¦¾à¦²à§‡ à¦­à¦°à§à¦¤à¦¿ à¦–à¦°à¦š à¦ªà¦°à§à¦¯à¦¨à§à¦¤ à§³à§«à§¦,à§¦à§¦à§¦",
      claim: "à¦¹à¦¾à¦¸à¦ªà¦¾à¦¤à¦¾à¦²à§‡à¦° à¦¬à¦¿à¦² à¦“ à¦­à¦°à§à¦¤à¦¿à¦° à¦•à¦¾à¦—à¦œ à¦¦à¦¿à¦¯à¦¼à§‡ à¦¦à¦¾à¦¬à¦¿ à¦•à¦°à§à¦¨",
      idra: "IDRA à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤",
      audio: "à¦¡à§‡à¦²à§à¦Ÿà¦¾ à¦²à¦¾à¦‡à¦«à§‡à¦° à¦¸à§à¦¬à¦¾à¦¸à§à¦¥à§à¦¯ à¦¸à§à¦°à¦•à§à¦·à¦¾ à¦¬à§€à¦®à¦¾ à¦®à¦¾à¦¸à§‡ à§§à§«à§¦ à¦¥à§‡à¦•à§‡ à§«à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾à¦¯à¦¼ à§«à§¦ à¦¹à¦¾à¦œà¦¾à¦° à¦Ÿà¦¾à¦•à¦¾ à¦ªà¦°à§à¦¯à¦¨à§à¦¤ à¦¹à¦¾à¦¸à¦ªà¦¾à¦¤à¦¾à¦²à§‡à¦° à¦–à¦°à¦š à¦¦à§‡à¦¯à¦¼à¥¤",
    },
    {
      name: "à¦—à§à¦°à¦¾à¦®à§€à¦£ à¦¸à§à¦¬à¦¾à¦¸à§à¦¥à§à¦¯ à¦¬à§€à¦®à¦¾",
      provider: "Green Delta Insurance",
      premium: "à¦®à¦¾à¦¸à§‡ à§³à§§à§¦à§¦-à§³à§©à§¦à§¦",
      covers: "à¦¬à¦¾à¦¹à§à¦¯à¦¿à¦• à¦“ à¦…à¦­à§à¦¯à¦¨à§à¦¤à¦°à§€à¦£ à¦šà¦¿à¦•à¦¿à§Žà¦¸à¦¾ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾",
      claim: "à¦ªà§à¦°à§‡à¦¸à¦•à§à¦°à¦¿à¦ªà¦¶à¦¨ à¦“ à¦¬à¦¿à¦²à¦¸à¦¹ à¦¨à¦¿à¦•à¦Ÿà¦¸à§à¦¥ à¦¶à¦¾à¦–à¦¾à¦¯à¦¼ à¦¦à¦¾à¦¬à¦¿ à¦•à¦°à§à¦¨",
      idra: "IDRA à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤",
      audio: "à¦—à§à¦°à¦¿à¦¨ à¦¡à§‡à¦²à§à¦Ÿà¦¾à¦° à¦—à§à¦°à¦¾à¦®à§€à¦£ à¦¸à§à¦¬à¦¾à¦¸à§à¦¥à§à¦¯ à¦¬à§€à¦®à¦¾ à¦®à¦¾à¦¸à§‡ à§§à§¦à§¦ à¦¥à§‡à¦•à§‡ à§©à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾à¦¯à¦¼ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾ à¦¯à¦¾à¦¯à¦¼à¥¤",
    },
  ],
  life: [
    {
      name: "à¦œà§€à¦¬à¦¨ à¦¬à§€à¦®à¦¾ (à¦¸à¦¾à¦§à¦¾à¦°à¦£)",
      provider: "National Life Insurance",
      premium: "à¦®à¦¾à¦¸à§‡ à§³à§¨à§¦à§¦-à§³à§®à§¦à§¦",
      covers: "à¦®à§ƒà¦¤à§à¦¯à§à¦¤à§‡ à¦ªà¦°à¦¿à¦¬à¦¾à¦°à¦•à§‡ à§³à§§-à§³à§« à¦²à¦•à§à¦·",
      claim: "à¦®à§ƒà¦¤à§à¦¯à§ à¦¸à¦¨à¦¦, NID à¦“ à¦¨à¦®à¦¿à¦¨à¦¿à¦° à¦•à¦¾à¦—à¦œ à¦¦à¦¿à¦¯à¦¼à§‡ à¦¦à¦¾à¦¬à¦¿ à¦•à¦°à§à¦¨",
      idra: "IDRA à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤",
      audio: "à¦¨à§à¦¯à¦¾à¦¶à¦¨à¦¾à¦² à¦²à¦¾à¦‡à¦«à§‡à¦° à¦œà§€à¦¬à¦¨ à¦¬à§€à¦®à¦¾ à¦®à¦¾à¦¸à§‡ à§¨à§¦à§¦ à¦¥à§‡à¦•à§‡ à§®à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾à¦¯à¦¼ à¦®à§ƒà¦¤à§à¦¯à§à¦¤à§‡ à¦ªà¦°à¦¿à¦¬à¦¾à¦°à¦•à§‡ à§§ à¦¥à§‡à¦•à§‡ à§« à¦²à¦•à§à¦· à¦Ÿà¦¾à¦•à¦¾ à¦¦à§‡à¦¯à¦¼à¥¤",
    },
    {
      name: "à¦®à¦¾à¦‡à¦•à§à¦°à§‹ à¦²à¦¾à¦‡à¦« à¦ªà§à¦²à§à¦¯à¦¾à¦¨",
      provider: "Pragati Life Insurance",
      premium: "à¦®à¦¾à¦¸à§‡ à§³à§«à§¦-à§³à§§à§«à§¦",
      covers: "à¦®à§ƒà¦¤à§à¦¯à§à¦¤à§‡ à¦ªà¦°à¦¿à¦¬à¦¾à¦°à¦•à§‡ à§³à§©à§¦,à§¦à§¦à§¦",
      claim: "à¦®à§ƒà¦¤à§à¦¯à§ à¦¸à¦¨à¦¦à¦¸à¦¹ à¦¨à¦¿à¦•à¦Ÿà¦¸à§à¦¥ à¦¶à¦¾à¦–à¦¾à¦¯à¦¼ à¦¦à¦¾à¦¬à¦¿ à¦•à¦°à§à¦¨",
      idra: "IDRA à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤",
      audio: "à¦ªà§à¦°à¦—à¦¤à¦¿ à¦²à¦¾à¦‡à¦«à§‡à¦° à¦®à¦¾à¦‡à¦•à§à¦°à§‹ à¦ªà§à¦²à§à¦¯à¦¾à¦¨ à¦®à¦¾à¦¸à§‡ à¦®à¦¾à¦¤à§à¦° à§«à§¦ à¦¥à§‡à¦•à§‡ à§§à§«à§¦ à¦Ÿà¦¾à¦•à¦¾à¦¯à¦¼ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾ à¦¯à¦¾à¦¯à¦¼à¥¤",
    },
  ],
  crop: [
    {
      name: "à¦«à¦¸à¦² à¦¬à§€à¦®à¦¾",
      provider: "Sadharan Bima Corporation (SBC)",
      premium: "à¦«à¦¸à¦²à§‡à¦° à¦®à§‚à¦²à§à¦¯à§‡à¦° ~à§¨-à§©%",
      covers: "à¦¬à¦¨à§à¦¯à¦¾, à¦–à¦°à¦¾ à¦¬à¦¾ à¦ªà§‹à¦•à¦¾à¦¯à¦¼ à¦«à¦¸à¦² à¦¨à¦·à§à¦Ÿ à¦¹à¦²à§‡ à¦•à§à¦·à¦¤à¦¿à¦ªà§‚à¦°à¦£",
      claim: "à¦‰à¦ªà¦œà§‡à¦²à¦¾ à¦•à§ƒà¦·à¦¿ à¦…à¦«à¦¿à¦¸à§‡à¦° à¦ªà§à¦°à¦¤à§à¦¯à¦¯à¦¼à¦¨à¦¸à¦¹ à¦¦à¦¾à¦¬à¦¿ à¦•à¦°à§à¦¨",
      idra: "IDRA à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤",
      audio: "à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦¬à§€à¦®à¦¾ à¦•à¦°à§à¦ªà§‹à¦°à§‡à¦¶à¦¨à§‡à¦° à¦«à¦¸à¦² à¦¬à§€à¦®à¦¾ à¦¬à¦¨à§à¦¯à¦¾ à¦¬à¦¾ à¦–à¦°à¦¾à¦¯à¦¼ à¦«à¦¸à¦² à¦¨à¦·à§à¦Ÿ à¦¹à¦²à§‡ à¦•à§à¦·à¦¤à¦¿à¦ªà§‚à¦°à¦£ à¦¦à§‡à¦¯à¦¼à¥¤",
    },
  ],
  property: [
    {
      name: "à¦—à§ƒà¦¹à¦¸à§à¦¥à¦¾à¦²à¦¿ à¦¸à¦®à§à¦ªà¦¦ à¦¬à§€à¦®à¦¾",
      provider: "Rupali General Insurance",
      premium: "à¦¬à¦¾à¦°à§à¦·à¦¿à¦• à§³à§©à§¦à§¦-à§³à§§,à§¦à§¦à§¦",
      covers: "à¦†à¦—à§à¦¨, à¦šà§à¦°à¦¿ à¦¬à¦¾ à¦¦à§à¦°à§à¦˜à¦Ÿà¦¨à¦¾à¦¯à¦¼ à¦¸à¦®à§à¦ªà¦¦ à¦•à§à¦·à¦¤à¦¿",
      claim: "à¦ªà§à¦²à¦¿à¦¶ à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ à¦“ à¦•à§à¦·à¦¤à¦¿à¦° à¦›à¦¬à¦¿à¦¸à¦¹ à¦¦à¦¾à¦¬à¦¿ à¦•à¦°à§à¦¨",
      idra: "IDRA à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤",
      audio: "à¦°à§‚à¦ªà¦¾à¦²à§€ à¦œà§‡à¦¨à¦¾à¦°à§‡à¦² à¦¬à§€à¦®à¦¾à¦° à¦—à§ƒà¦¹à¦¸à§à¦¥à¦¾à¦²à¦¿ à¦¬à§€à¦®à¦¾ à¦†à¦—à§à¦¨ à¦¬à¦¾ à¦šà§à¦°à¦¿à¦¤à§‡ à¦¸à¦®à§à¦ªà¦¦ à¦•à§à¦·à¦¤à¦¿à¦° à¦¬à¦¿à¦ªà¦°à§€à¦¤à§‡ à¦¸à§à¦°à¦•à§à¦·à¦¾ à¦¦à§‡à¦¯à¦¼à¥¤",
    },
  ],
};

export default function InsurancePage() {
  const [slide,       setSlide]       = useState(0);
  const [activeType,  setActiveType]  = useState("");
  const [verifyName,  setVerifyName]  = useState("");
  const [verifyResult, setVerifyResult] = useState<"registered" | "unknown" | null>(null);

  // Simplified verification â€” a short list of known registered companies
  const REGISTERED = ["delta life", "green delta", "national life", "pragati life", "rupali", "sadharan bima", "sbc", "popular life", "meghna life", "allianz", "sunlife", "bsrs"];

  const handleVerify = () => {
    const lower = verifyName.toLowerCase().trim();
    const found = REGISTERED.some(r => lower.includes(r) || r.includes(lower));
    setVerifyResult(found ? "registered" : "unknown");
  };

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">ðŸŒ± à¦¬à§€à¦®à¦¾ à¦¸à¦šà§‡à¦¤à¦¨à¦¤à¦¾</h1>
        <p className="section-subtitle">à¦¬à§€à¦®à¦¾ à¦¬à§à¦à§à¦¨, à¦¸à¦ à¦¿à¦• à¦ªà¦£à§à¦¯ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨, à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾ à¦à¦¡à¦¼à¦¾à¦¨</p>
      </div>

      <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Section 1 â€” What is insurance */}
        <section aria-labelledby="explainer-title">
          <h2 id="explainer-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "12px" }}>
            ðŸ’¡ à¦¬à§€à¦®à¦¾ à¦•à§€? (à¦¸à¦¹à¦œ à¦­à¦¾à¦·à¦¾à¦¯à¦¼)
          </h2>
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "36px" }}>{EXPLAINER_SLIDES[slide].icon}</span>
              <AudioAssist text={EXPLAINER_SLIDES[slide].audio} label="à¦¶à§à¦¨à§à¦¨" />
            </div>
            <p style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>{EXPLAINER_SLIDES[slide].title}</p>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{EXPLAINER_SLIDES[slide].body}</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button
                onClick={() => setSlide(Math.max(0, slide - 1))}
                disabled={slide === 0}
                className="btn btn--outline"
                style={{ flex: 1, justifyContent: "center", fontSize: "13px" }}
              >â† à¦†à¦—à§‡</button>
              <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
                {EXPLAINER_SLIDES.map((_, i) => (
                  <span key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: i === slide ? "var(--color-primary)" : "var(--color-border)" }} />
                ))}
              </div>
              <button
                onClick={() => setSlide(Math.min(EXPLAINER_SLIDES.length - 1, slide + 1))}
                disabled={slide === EXPLAINER_SLIDES.length - 1}
                className="btn btn--outline"
                style={{ flex: 1, justifyContent: "center", fontSize: "13px" }}
              >à¦ªà¦°à§‡ â†’</button>
            </div>
          </div>
        </section>

        {/* Section 2 â€” Products by type */}
        <section aria-labelledby="products-title">
          <h2 id="products-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "12px" }}>
            ðŸ“‹ à¦•à§‹à¦¨ à¦¬à§€à¦®à¦¾ à¦†à¦ªà¦¨à¦¾à¦° à¦•à¦¾à¦œà§‡ à¦²à¦¾à¦—à¦¬à§‡?
          </h2>
          <div className="category-grid" role="group" aria-label="à¦¬à§€à¦®à¦¾à¦° à¦§à¦°à¦¨" style={{ marginBottom: "16px" }}>
            {INSURANCE_TYPES.map(t => (
              <button
                key={t.key}
                className={`category-tile${activeType === t.key ? " active" : ""}`}
                aria-pressed={activeType === t.key}
                onClick={() => setActiveType(activeType === t.key ? "" : t.key)}
              >
                <span className="category-tile__icon">{t.icon}</span>
                <span className="category-tile__label">{t.label}</span>
              </button>
            ))}
          </div>

          {activeType && PRODUCTS[activeType] && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {PRODUCTS[activeType].map((prod, i) => (
                <div key={i} className="card" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: "700", fontSize: "15px", marginBottom: "2px" }}>{prod.name}</p>
                      <p style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: "600", marginBottom: "8px" }}>{prod.provider} Â· {prod.idra}</p>
                      <p style={{ fontSize: "16px", fontWeight: "800", color: "var(--color-primary)", marginBottom: "4px" }}>{prod.premium}</p>
                      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>âœ… à¦•à¦­à¦¾à¦° à¦•à¦°à§‡: {prod.covers}</p>
                      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>ðŸ“‹ à¦¦à¦¾à¦¬à¦¿ à¦•à¦°à¦¤à§‡: {prod.claim}</p>
                    </div>
                    <AudioAssist text={prod.audio} size="sm" />
                  </div>
                </div>
              ))}
              <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>à¦¤à¦¥à§à¦¯ à¦¸à¦°à§à¦¬à¦¶à§‡à¦· à¦¯à¦¾à¦šà¦¾à¦‡: à¦œà§à¦²à¦¾à¦‡ à§¨à§¦à§¨à§¬à¥¤ à¦¸à¦ à¦¿à¦• à¦ªà§à¦°à¦¿à¦®à¦¿à¦¯à¦¼à¦¾à¦® à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨ à¦¥à§‡à¦•à§‡ à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤ à¦•à¦°à§à¦¨à¥¤</p>
            </div>
          )}
        </section>

        {/* Section 3 â€” Verify company */}
        <section aria-labelledby="verify-title">
          <h2 id="verify-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "4px" }}>
            ðŸ” à¦à¦‡ à¦¬à§€à¦®à¦¾ à¦•à§‹à¦®à§à¦ªà¦¾à¦¨à¦¿ à¦•à¦¿ à¦¬à§ˆà¦§?
          </h2>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
            à¦•à§‹à¦®à§à¦ªà¦¾à¦¨à¦¿à¦° à¦¨à¦¾à¦® à¦²à¦¿à¦–à§à¦¨ â€” IDRA à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤ à¦•à¦¿à¦¨à¦¾ à¦¦à§‡à¦–à§à¦¨
          </p>
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="input-field"
                placeholder="à¦•à§‹à¦®à§à¦ªà¦¾à¦¨à¦¿à¦° à¦¨à¦¾à¦® à¦²à¦¿à¦–à§à¦¨"
                value={verifyName}
                onChange={e => { setVerifyName(e.target.value); setVerifyResult(null); }}
                style={{ flex: 1, fontSize: "16px" }}
              />
              <button className="btn btn--primary" onClick={handleVerify} style={{ justifyContent: "center", padding: "0 16px" }}>à¦–à§à¦à¦œà§à¦¨</button>
            </div>
            {verifyResult === "registered" && (
              <div style={{ marginTop: "12px", padding: "12px", borderRadius: "8px", background: "var(--color-success-light, #e6f4ea)" }}>
                <p style={{ fontWeight: "700" }}>âœ… à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤ à¦¬à¦²à§‡ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾ à¦—à§‡à¦›à§‡</p>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>à¦¤à¦¬à§à¦“ à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤ à¦¶à¦°à§à¦¤ à¦ªà¦¡à¦¼à§à¦¨ à¦à¦¬à¦‚ IDRA.gov.bd à¦¥à§‡à¦•à§‡ à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤ à¦•à¦°à§à¦¨à¥¤</p>
              </div>
            )}
            {verifyResult === "unknown" && (
              <div style={{ marginTop: "12px", padding: "12px", borderRadius: "8px", background: "var(--color-error-light, #fce8e6)" }}>
                <p style={{ fontWeight: "700" }}>âš ï¸ à¦¨à¦¾à¦® à¦–à§à¦à¦œà§‡ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾ à¦¯à¦¾à¦¯à¦¼à¦¨à¦¿</p>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>IDRA.gov.bd à¦¬à¦¾ à§¦à§¯à§¬à§¬à§¬à§­à§®à§¬à§¯à§®à§¬ à¦¤à§‡ à¦«à§‹à¦¨ à¦•à¦°à§‡ à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤ à¦•à¦°à§à¦¨à¥¤</p>
              </div>
            )}
          </div>
        </section>

        <div className="disclaimer" role="note">
          à¦ªà¦£à§à¦¯à§‡à¦° à¦¤à¦¥à§à¦¯ à¦ªà¦°à¦¿à¦¬à¦°à§à¦¤à¦¨ à¦¹à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¥¤ à¦¬à§€à¦®à¦¾ à¦•à§‡à¦¨à¦¾à¦° à¦†à¦—à§‡ à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨à§‡à¦° à¦¸à¦¾à¦¥à§‡ à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦— à¦•à¦°à§à¦¨à¥¤ à¦à¦Ÿà¦¿ à¦¤à¦¥à§à¦¯ à¦®à¦¾à¦¤à§à¦°, à¦¬à§€à¦®à¦¾ à¦ªà¦°à¦¾à¦®à¦°à§à¦¶ à¦¨à¦¯à¦¼à¥¤
        </div>
      </div>
    </>
  );
}
