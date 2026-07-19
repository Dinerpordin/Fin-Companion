"use client";

import { useState } from "react";
import Link from "next/link";
import AudioAssist from "../components/AudioAssist";

const EVENT_TYPES = [
  { key: "wedding",   icon: "ðŸ’", label: "à¦¬à¦¿à¦¯à¦¼à§‡",           hint: "à¦®à§‹à¦Ÿ à¦…à¦¨à§à¦·à§à¦ à¦¾à¦¨à§‡à¦° à¦–à¦°à¦š" },
  { key: "dowry",     icon: "ðŸ’°", label: "à¦¯à§Œà¦¤à§à¦• / à¦‰à¦ªà¦¹à¦¾à¦°",  hint: "à¦¬à¦°à¦ªà¦•à§à¦·à§‡à¦° à¦¦à¦¾à¦¬à¦¿ à¦¬à¦¾ à¦ªà¦°à¦¿à¦¬à¦¾à¦°à§‡à¦° à¦‰à¦ªà¦¹à¦¾à¦°" },
  { key: "eid",       icon: "ðŸŒ™", label: "à¦ˆà¦¦ à¦‰à§Žà¦¸à¦¬",        hint: "à¦•à§‡à¦¨à¦¾à¦•à¦¾à¦Ÿà¦¾, à¦–à¦¾à¦¬à¦¾à¦°, à¦¸à§‡à¦²à¦¾à¦®à¦¿" },
  { key: "funeral",   icon: "ðŸ•Œ", label: "à¦œà¦¾à¦¨à¦¾à¦œà¦¾ / à¦•à§à¦²à¦–à¦¾à¦¨à¦¿",hint: "à¦¹à¦ à¦¾à§Ž à¦–à¦°à¦š" },
  { key: "hajj",      icon: "ðŸ•‹", label: "à¦¹à¦œà§à¦œ / à¦“à¦®à¦°à¦¾",     hint: "à¦¯à¦¾à¦¤à§à¦°à¦¾à¦° à¦®à§‹à¦Ÿ à¦–à¦°à¦š" },
  { key: "education", icon: "ðŸ“š", label: "à¦ªà¦¡à¦¼à¦¾à¦¶à§‹à¦¨à¦¾à¦° à¦–à¦°à¦š",   hint: "à¦­à¦°à§à¦¤à¦¿, à¦¬à§‡à¦¤à¦¨, à¦¬à¦‡" },
  { key: "other",     icon: "ðŸ“¦", label: "à¦…à¦¨à§à¦¯ à¦‰à¦ªà¦²à¦•à§à¦·",     hint: "à¦¨à¦¿à¦œà§‡ à¦²à¦¿à¦–à§à¦¨" },
];

// Suggested cost ranges per event type (in BDT)
const EVENT_SUGGESTIONS: Record<string, number[]> = {
  wedding:   [30000, 75000, 150000, 300000],
  dowry:     [50000, 100000, 200000, 500000],
  eid:       [5000, 10000, 20000, 40000],
  funeral:   [10000, 25000, 50000],
  hajj:      [300000, 500000, 700000],
  education: [10000, 30000, 60000, 120000],
  other:     [10000, 25000, 50000, 100000],
};

const MONTH_PRESETS = [1, 3, 6, 12, 18, 24];

function formatBDT(n: number) {
  if (n >= 100000) return `à§³${(n / 100000).toFixed(1)} à¦²à¦•à§à¦·`;
  if (n >= 1000)   return `à§³${(n).toLocaleString("bn-BD")}`;
  return `à§³${n}`;
}

// Rough average rate: 15% flat (informal/MFI) for borrowing cost estimate
const INFORMAL_RATE = 0.15;

export default function EventsPlannerPage() {
  const [step,       setStep]       = useState(1);
  const [eventType,  setEventType]  = useState("");
  const [cost,       setCost]       = useState<number | null>(null);
  const [customCost, setCustomCost] = useState("");
  const [savings,    setSavings]    = useState<number>(0);
  const [months,     setMonths]     = useState<number | null>(null);
  const [customMo,   setCustomMo]   = useState("");

  const finalCost    = cost ?? (customCost ? parseFloat(customCost) : null);
  const finalMonths  = months ?? (customMo ? parseInt(customMo, 10) : null);
  const gap          = finalCost ? Math.max(0, finalCost - savings) : null;
  const monthlySave  = gap && finalMonths ? Math.ceil(gap / finalMonths)  : null;
  const dailySave    = monthlySave ? Math.ceil(monthlySave / 30) : null;
  // Borrowing cost estimate (simple flat interest for 1 year)
  const borrowCost   = gap ? Math.round(gap * (1 + INFORMAL_RATE)) : null;

  const suggestions  = eventType ? (EVENT_SUGGESTIONS[eventType] ?? EVENT_SUGGESTIONS.other) : [];
  const eventLabel   = EVENT_TYPES.find(e => e.key === eventType)?.label ?? "";

  const resultText = monthlySave
    ? `à¦†à¦ªà¦¨à¦¾à¦° ${eventLabel} à¦à¦° à¦œà¦¨à§à¦¯ à¦ªà§à¦°à¦¯à¦¼à§‹à¦œà¦¨ ${formatBDT(gap!)}à¥¤ à¦ªà§à¦°à¦¤à¦¿ à¦®à¦¾à¦¸à§‡ ${formatBDT(monthlySave)} à¦¸à¦žà§à¦šà¦¯à¦¼ à¦•à¦°à¦²à§‡ ${finalMonths} à¦®à¦¾à¦¸à§‡ à¦ªà§Œà¦à¦›à¦¾à¦¬à§‡à¦¨à¥¤`
    : "";

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">ðŸ’ à¦‰à§Žà¦¸à¦¬ à¦ªà¦°à¦¿à¦•à¦²à§à¦ªà¦¨à¦¾</h1>
        <p className="section-subtitle">à¦¬à¦¿à¦¯à¦¼à§‡, à¦ˆà¦¦ à¦¬à¦¾ à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦‰à¦ªà¦²à¦•à§à¦·à§‡à¦° à¦–à¦°à¦š à¦ªà¦°à¦¿à¦•à¦²à§à¦ªà¦¨à¦¾ à¦•à¦°à§à¦¨</p>
      </div>

      <div className="p-4">
        {/* Step 1 â€” Event type */}
        {step === 1 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>à¦•à§€ à¦‰à¦ªà¦²à¦•à§à¦·à§‡?</h2>
              <AudioAssist text="à¦•à§‹à¦¨ à¦‰à¦ªà¦²à¦•à§à¦·à§‡à¦° à¦œà¦¨à§à¦¯ à¦ªà¦°à¦¿à¦•à¦²à§à¦ªà¦¨à¦¾ à¦•à¦°à¦›à§‡à¦¨? à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨à¥¤" />
            </div>
            <div className="category-grid" role="group" aria-label="à¦‰à¦ªà¦²à¦•à§à¦· à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨">
              {EVENT_TYPES.map(e => (
                <button
                  key={e.key}
                  className={`category-tile${eventType === e.key ? " active" : ""}`}
                  aria-pressed={eventType === e.key}
                  onClick={() => { setEventType(e.key); setCost(null); setStep(2); }}
                >
                  <span className="category-tile__icon">{e.icon}</span>
                  <span className="category-tile__label">{e.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 â€” Cost estimate */}
        {step === 2 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>à¦†à¦¨à§à¦®à¦¾à¦¨à¦¿à¦• à¦•à¦¤ à¦–à¦°à¦š à¦¹à¦¬à§‡?</h2>
              <AudioAssist text="à¦à¦‡ à¦‰à¦ªà¦²à¦•à§à¦·à§‡ à¦†à¦¨à§à¦®à¦¾à¦¨à¦¿à¦• à¦•à¦¤ à¦Ÿà¦¾à¦•à¦¾ à¦–à¦°à¦š à¦¹à¦¬à§‡ à¦¬à¦²à§‡ à¦®à¦¨à§‡ à¦•à¦°à§‡à¦¨?" />
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
              {EVENT_TYPES.find(e => e.key === eventType)?.hint}
            </p>
            <div className="preset-btn-row" role="group" aria-label="à¦–à¦°à¦š à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨" style={{ flexWrap: "wrap" }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  className={`preset-btn${cost === s ? " active" : ""}`}
                  aria-pressed={cost === s}
                  onClick={() => { setCost(s); setCustomCost(""); }}
                  style={{ minWidth: "80px", fontSize: "14px", padding: "10px 12px" }}
                >
                  {formatBDT(s)}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field"
              placeholder="à¦¨à¦¿à¦œà§‡ à¦²à¦¿à¦–à§à¦¨ (à¦Ÿà¦¾à¦•à¦¾à¦¯à¦¼)"
              value={customCost}
              onChange={e => { setCustomCost(e.target.value); setCost(null); }}
              style={{ marginTop: "12px", fontSize: "18px" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button className="btn btn--outline" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: "center" }}>â† à¦ªà§‡à¦›à¦¨à§‡</button>
              <button
                className="btn btn--primary" style={{ flex: 2, justifyContent: "center" }}
                onClick={() => (finalCost ? setStep(3) : null)}
                disabled={!finalCost}
              >à¦ªà¦°à§‡à¦° à¦§à¦¾à¦ª â†’</button>
            </div>
          </div>
        )}

        {/* Step 3 â€” Current savings */}
        {step === 3 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>à¦à¦–à¦¨ à¦•à¦¤ à¦Ÿà¦¾à¦•à¦¾ à¦†à¦›à§‡?</h2>
              <AudioAssist text="à¦à¦‡ à¦•à¦¾à¦œà§‡à¦° à¦œà¦¨à§à¦¯ à¦à¦–à¦¨ à¦†à¦ªà¦¨à¦¾à¦° à¦•à¦¾à¦›à§‡ à¦•à¦¤ à¦Ÿà¦¾à¦•à¦¾ à¦†à¦›à§‡?" />
            </div>
            <div className="preset-btn-row" role="group" style={{ flexWrap: "wrap" }}>
              {[0, 5000, 10000, 20000, 50000].map(s => (
                <button
                  key={s}
                  className={`preset-btn${savings === s ? " active" : ""}`}
                  aria-pressed={savings === s}
                  onClick={() => setSavings(s)}
                  style={{ minWidth: "70px", fontSize: "14px", padding: "10px 12px" }}
                >
                  {s === 0 ? "à¦•à¦¿à¦›à§ à¦¨à§‡à¦‡" : formatBDT(s)}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field"
              placeholder="à¦¨à¦¿à¦œà§‡ à¦²à¦¿à¦–à§à¦¨"
              onChange={e => setSavings(parseFloat(e.target.value) || 0)}
              style={{ marginTop: "12px", fontSize: "18px" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button className="btn btn--outline" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: "center" }}>â† à¦ªà§‡à¦›à¦¨à§‡</button>
              <button className="btn btn--primary" style={{ flex: 2, justifyContent: "center" }} onClick={() => setStep(4)}>à¦ªà¦°à§‡à¦° à¦§à¦¾à¦ª â†’</button>
            </div>
          </div>
        )}

        {/* Step 4 â€” Timeline */}
        {step === 4 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>à¦•à¦¤ à¦®à¦¾à¦¸ à¦¬à¦¾à¦•à¦¿ à¦†à¦›à§‡?</h2>
              <AudioAssist text="à¦à¦‡ à¦‰à¦ªà¦²à¦•à§à¦· à¦†à¦¸à¦¤à§‡ à¦†à¦° à¦•à¦¤ à¦®à¦¾à¦¸ à¦¬à¦¾à¦•à¦¿?" />
            </div>
            <div className="preset-btn-row" role="group" style={{ flexWrap: "wrap" }}>
              {MONTH_PRESETS.map(m => (
                <button
                  key={m}
                  className={`preset-btn${months === m ? " active" : ""}`}
                  aria-pressed={months === m}
                  onClick={() => { setMonths(m); setCustomMo(""); }}
                  style={{ minWidth: "70px", fontSize: "15px", padding: "10px 12px" }}
                >
                  {m} à¦®à¦¾à¦¸
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field"
              placeholder="à¦¨à¦¿à¦œà§‡ à¦²à¦¿à¦–à§à¦¨ (à¦®à¦¾à¦¸)"
              value={customMo}
              onChange={e => { setCustomMo(e.target.value); setMonths(null); }}
              style={{ marginTop: "12px", fontSize: "18px" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button className="btn btn--outline" onClick={() => setStep(3)} style={{ flex: 1, justifyContent: "center" }}>â† à¦ªà§‡à¦›à¦¨à§‡</button>
              <button
                className="btn btn--primary" style={{ flex: 2, justifyContent: "center" }}
                onClick={() => (finalMonths ? setStep(5) : null)}
                disabled={!finalMonths}
              >à¦«à¦²à¦¾à¦«à¦² à¦¦à§‡à¦–à§à¦¨ â†’</button>
            </div>
          </div>
        )}

        {/* Step 5 â€” Result */}
        {step === 5 && finalCost && finalMonths && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Hero */}
            <div className="card" style={{ padding: "var(--space-4)", background: "var(--color-primary)", color: "white", borderRadius: "16px" }}>
              <p style={{ fontSize: "14px", opacity: 0.85, marginBottom: "6px" }}>{eventLabel} à¦ªà¦°à¦¿à¦•à¦²à§à¦ªà¦¨à¦¾</p>
              <p style={{ fontSize: "32px", fontWeight: "800" }}>{formatBDT(finalCost)}</p>
              <p style={{ fontSize: "14px", opacity: 0.85, marginTop: "4px" }}>{finalMonths} à¦®à¦¾à¦¸à§‡à¦° à¦®à¦§à§à¦¯à§‡</p>
            </div>

            {/* Gap */}
            {gap !== null && gap > 0 && (
              <div className="card" style={{ padding: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>à¦†à¦°à¦“ à¦•à¦¤ à¦Ÿà¦¾à¦•à¦¾ à¦²à¦¾à¦—à¦¬à§‡</p>
                    <p style={{ fontSize: "26px", fontWeight: "800", color: "var(--color-danger, #dc2626)" }}>{formatBDT(gap)}</p>
                    {monthlySave && (
                      <p style={{ fontSize: "14px", marginTop: "8px", color: "var(--color-primary)", fontWeight: "600" }}>
                        â†’ à¦ªà§à¦°à¦¤à¦¿ à¦®à¦¾à¦¸à§‡ {formatBDT(monthlySave)} à¦œà¦®à¦¾à¦²à§‡ à¦¹à¦¬à§‡
                      </p>
                    )}
                    {dailySave && (
                      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                        (à¦ªà§à¦°à¦¤à¦¿à¦¦à¦¿à¦¨ à¦®à¦¾à¦¤à§à¦° {formatBDT(dailySave)})
                      </p>
                    )}
                  </div>
                  <AudioAssist text={resultText} label="à¦¶à§à¦¨à§à¦¨" />
                </div>
              </div>
            )}

            {gap === 0 && (
              <div className="card" style={{ padding: "var(--space-4)", background: "var(--color-success-light, #e6f4ea)" }}>
                <p style={{ fontWeight: "700", fontSize: "18px", color: "var(--color-primary)" }}>âœ… à¦†à¦ªà¦¨à¦¾à¦° à¦•à¦¾à¦›à§‡ à¦¯à¦¥à§‡à¦·à§à¦Ÿ à¦†à¦›à§‡!</p>
                <p style={{ fontSize: "14px", marginTop: "4px" }}>à¦à¦–à¦¨à¦•à¦¾à¦° à¦¸à¦žà§à¦šà¦¯à¦¼ à¦¦à¦¿à¦¯à¦¼à§‡à¦‡ à¦à¦‡ à¦‰à¦ªà¦²à¦•à§à¦· à¦¸à¦¾à¦®à¦²à¦¾à¦¨à§‹ à¦¸à¦®à§à¦­à¦¬à¥¤</p>
              </div>
            )}

            {/* Borrowing cost warning */}
            {gap && gap > 0 && borrowCost && (
              <div className="card" style={{ padding: "var(--space-4)", borderLeft: "4px solid var(--color-warning, #d97706)" }}>
                <p style={{ fontWeight: "600", marginBottom: "4px" }}>âš ï¸ à¦‹à¦£ à¦¨à¦¿à¦²à§‡ à¦•à¦¤ à¦ªà¦¡à¦¼à¦¬à§‡?</p>
                <p style={{ fontSize: "14px" }}>
                  {formatBDT(gap)} à¦§à¦¾à¦° à¦•à¦°à¦²à§‡ à¦†à¦¨à§à¦®à¦¾à¦¨à¦¿à¦• à¦®à§‹à¦Ÿ à¦«à§‡à¦°à¦¤ à¦¦à¦¿à¦¤à§‡ à¦¹à¦¤à§‡ à¦ªà¦¾à¦°à§‡ <strong>{formatBDT(borrowCost)}</strong> (à¦…à¦¨à¦¾à¦¨à§à¦·à§à¦ à¦¾à¦¨à¦¿à¦• à¦¹à¦¾à¦°à§‡ ~à§§à§«%)à¥¤
                </p>
                <Link href="/check-loan" className="btn btn--outline btn--sm" style={{ marginTop: "10px", display: "inline-flex" }}>
                  ðŸ” à¦‹à¦£à§‡à¦° à¦ªà§à¦°à¦•à§ƒà¦¤ à¦–à¦°à¦š à¦ªà¦°à§€à¦•à§à¦·à¦¾ à¦•à¦°à§à¦¨
                </Link>
              </div>
            )}

            <button className="btn btn--ghost" style={{ justifyContent: "center" }} onClick={() => { setStep(1); setEventType(""); setCost(null); setSavings(0); setMonths(null); setCustomCost(""); setCustomMo(""); }}>
              ðŸ”„ à¦¨à¦¤à§à¦¨ à¦ªà¦°à¦¿à¦•à¦²à§à¦ªà¦¨à¦¾ à¦•à¦°à§à¦¨
            </button>

            <div className="disclaimer" role="note">
              à¦¸à¦•à¦² à¦¹à¦¿à¦¸à¦¾à¦¬ à¦†à¦¨à§à¦®à¦¾à¦¨à¦¿à¦•à¥¤ à¦‹à¦£à§‡à¦° à¦¹à¦¾à¦° à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨ à¦“ à¦¶à¦°à§à¦¤ à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à§€ à¦­à¦¿à¦¨à§à¦¨ à¦¹à¦¯à¦¼à¥¤ à¦à¦Ÿà¦¿ à¦¤à¦¥à§à¦¯ à¦®à¦¾à¦¤à§à¦°, à¦†à¦°à§à¦¥à¦¿à¦• à¦ªà¦°à¦¾à¦®à¦°à§à¦¶ à¦¨à¦¯à¦¼à¥¤
            </div>
          </div>
        )}
      </div>
    </>
  );
}
