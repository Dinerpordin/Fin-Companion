"use client";

import { useState } from "react";
import Link from "next/link";
import AudioAssist from "../components/AudioAssist";

const GOAL_TYPES = [
  { key: "emergency",  icon: "ðŸ¥", label: "à¦œà¦°à§à¦°à¦¿ à¦¤à¦¹à¦¬à¦¿à¦²"   },
  { key: "wedding",    icon: "ðŸ’", label: "à¦¬à¦¿à¦¯à¦¼à§‡"           },
  { key: "education",  icon: "ðŸ“š", label: "à¦ªà¦¡à¦¼à¦¾à¦¶à§‹à¦¨à¦¾"        },
  { key: "hajj",       icon: "ðŸ•‹", label: "à¦¹à¦œà§à¦œ / à¦“à¦®à¦°à¦¾"    },
  { key: "business",   icon: "ðŸª", label: "à¦¬à§à¦¯à¦¬à¦¸à¦¾ à¦¶à§à¦°à§"     },
  { key: "other",      icon: "ðŸŽ¯", label: "à¦…à¦¨à§à¦¯ à¦²à¦•à§à¦·à§à¦¯"    },
];

const AMOUNT_PRESETS = [5000, 10000, 20000, 50000, 100000, 200000];
const MONTH_PRESETS  = [3, 6, 12, 18, 24, 36];

function formatBDT(n: number) {
  if (n >= 100000) return `à§³${(n / 100000).toFixed(1)} à¦²à¦•à§à¦·`;
  if (n >= 1000)   return `à§³${n.toLocaleString("bn-BD")}`;
  return `à§³${n}`;
}

export default function SavingsPage() {
  const [step, setStep] = useState(1);
  const [goalType, setGoalType]   = useState("");
  const [targetAmt, setTargetAmt] = useState<number | null>(null);
  const [months, setMonths]       = useState<number | null>(null);
  const [customAmt, setCustomAmt] = useState("");
  const [customMo,  setCustomMo]  = useState("");

  const finalAmt    = targetAmt ?? (customAmt ? parseFloat(customAmt) : null);
  const finalMonths = months   ?? (customMo  ? parseInt(customMo, 10)  : null);

  const dailySaving   = finalAmt && finalMonths ? Math.ceil(finalAmt / (finalMonths * 30)) : null;
  const monthlySaving = finalAmt && finalMonths ? Math.ceil(finalAmt / finalMonths)        : null;

  const resultText = dailySaving && monthlySaving
    ? `à¦ªà§à¦°à¦¤à¦¿à¦¦à¦¿à¦¨ ${formatBDT(dailySaving)} à¦¸à¦¾à¦¶à§à¦°à¦¯à¦¼ à¦•à¦°à¦²à§‡ ${finalMonths} à¦®à¦¾à¦¸à§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦²à¦•à§à¦·à§à¦¯à§‡ à¦ªà§Œà¦à¦›à¦¾à¦¬à§‡à¦¨à¥¤ à¦…à¦¥à¦¬à¦¾ à¦ªà§à¦°à¦¤à¦¿ à¦®à¦¾à¦¸à§‡ ${formatBDT(monthlySaving)} à¦œà¦®à¦¾à¦¨à¥¤`
    : "";

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">ðŸŽ¯ à¦¸à¦žà§à¦šà¦¯à¦¼ à¦ªà¦°à¦¿à¦•à¦²à§à¦ªà¦¨à¦¾</h1>
        <p className="section-subtitle">à¦§à¦¾à¦ªà§‡ à¦§à¦¾à¦ªà§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦²à¦•à§à¦·à§à¦¯ à¦ à¦¿à¦• à¦•à¦°à§à¦¨ â€” à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ à¦—à§‹à¦ªà¦¨à§€à¦¯à¦¼</p>
      </div>

      <div className="p-4">
        {/* Step 1 â€” Goal type */}
        {step === 1 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>à¦•à§€à¦¸à§‡à¦° à¦œà¦¨à§à¦¯ à¦¸à¦žà§à¦šà¦¯à¦¼ à¦•à¦°à¦¬à§‡à¦¨?</h2>
              <AudioAssist text="à¦•à§€à¦¸à§‡à¦° à¦œà¦¨à§à¦¯ à¦¸à¦žà§à¦šà¦¯à¦¼ à¦•à¦°à¦¬à§‡à¦¨? à¦¨à¦¿à¦š à¦¥à§‡à¦•à§‡ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨à¥¤" />
            </div>
            <div className="category-grid" role="group" aria-label="à¦²à¦•à§à¦·à§à¦¯ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨">
              {GOAL_TYPES.map(g => (
                <button
                  key={g.key}
                  className={`category-tile${goalType === g.key ? " active" : ""}`}
                  aria-pressed={goalType === g.key}
                  onClick={() => { setGoalType(g.key); setStep(2); }}
                >
                  <span className="category-tile__icon">{g.icon}</span>
                  <span className="category-tile__label">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 â€” Target amount */}
        {step === 2 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>à¦•à¦¤ à¦Ÿà¦¾à¦•à¦¾ à¦²à¦¾à¦—à¦¬à§‡?</h2>
              <AudioAssist text="à¦•à¦¤ à¦Ÿà¦¾à¦•à¦¾ à¦²à¦¾à¦—à¦¬à§‡? à¦¨à¦¿à¦šà§‡à¦° à¦¬à§‹à¦¤à¦¾à¦® à¦¥à§‡à¦•à§‡ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨ à¦…à¦¥à¦¬à¦¾ à¦¨à¦¿à¦œà§‡ à¦²à¦¿à¦–à§à¦¨à¥¤" />
            </div>
            <div className="preset-btn-row" role="group" aria-label="à¦ªà¦°à¦¿à¦®à¦¾à¦£ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨" style={{ flexWrap: "wrap" }}>
              {AMOUNT_PRESETS.map(a => (
                <button
                  key={a}
                  className={`preset-btn${targetAmt === a ? " active" : ""}`}
                  aria-pressed={targetAmt === a}
                  onClick={() => { setTargetAmt(a); setCustomAmt(""); }}
                  style={{ minWidth: "80px", fontSize: "15px", padding: "10px 14px" }}
                >
                  {formatBDT(a)}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field"
              placeholder="à¦¨à¦¿à¦œà§‡ à¦²à¦¿à¦–à§à¦¨ (à¦¯à§‡à¦®à¦¨: à§©à§¦à§¦à§¦à§¦)"
              value={customAmt}
              onChange={e => { setCustomAmt(e.target.value); setTargetAmt(null); }}
              style={{ marginTop: "12px", fontSize: "18px" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button className="btn btn--outline" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: "center" }}>â† à¦ªà§‡à¦›à¦¨à§‡</button>
              <button
                className="btn btn--primary" style={{ flex: 2, justifyContent: "center" }}
                onClick={() => (finalAmt ? setStep(3) : null)}
                disabled={!finalAmt}
              >à¦ªà¦°à§‡à¦° à¦§à¦¾à¦ª â†’</button>
            </div>
          </div>
        )}

        {/* Step 3 â€” Timeline */}
        {step === 3 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>à¦•à¦¤ à¦®à¦¾à¦¸à§‡à¦° à¦®à¦§à§à¦¯à§‡?</h2>
              <AudioAssist text="à¦•à¦¤ à¦®à¦¾à¦¸à§‡à¦° à¦®à¦§à§à¦¯à§‡ à¦à¦‡ à¦Ÿà¦¾à¦•à¦¾ à¦œà¦®à¦¾à¦¤à§‡ à¦šà¦¾à¦¨? à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨à¥¤" />
            </div>
            <div className="preset-btn-row" role="group" aria-label="à¦¸à¦®à¦¯à¦¼ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨" style={{ flexWrap: "wrap" }}>
              {MONTH_PRESETS.map(m => (
                <button
                  key={m}
                  className={`preset-btn${months === m ? " active" : ""}`}
                  aria-pressed={months === m}
                  onClick={() => { setMonths(m); setCustomMo(""); }}
                  style={{ minWidth: "70px", fontSize: "15px", padding: "10px 14px" }}
                >
                  {m} à¦®à¦¾à¦¸
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field"
              placeholder="à¦¨à¦¿à¦œà§‡ à¦²à¦¿à¦–à§à¦¨ (à¦®à¦¾à¦¸à§‡à¦° à¦¸à¦‚à¦–à§à¦¯à¦¾)"
              value={customMo}
              onChange={e => { setCustomMo(e.target.value); setMonths(null); }}
              style={{ marginTop: "12px", fontSize: "18px" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button className="btn btn--outline" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: "center" }}>â† à¦ªà§‡à¦›à¦¨à§‡</button>
              <button
                className="btn btn--primary" style={{ flex: 2, justifyContent: "center" }}
                onClick={() => (finalMonths ? setStep(4) : null)}
                disabled={!finalMonths}
              >à¦«à¦²à¦¾à¦«à¦² à¦¦à§‡à¦–à§à¦¨ â†’</button>
            </div>
          </div>
        )}

        {/* Step 4 â€” Result */}
        {step === 4 && finalAmt && finalMonths && dailySaving && monthlySaving && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Hero result card */}
            <div className="card" style={{ padding: "var(--space-4)", background: "var(--color-primary)", color: "white", borderRadius: "16px" }}>
              <p style={{ fontSize: "14px", opacity: 0.85, marginBottom: "8px" }}>à¦†à¦ªà¦¨à¦¾à¦° à¦¸à¦žà§à¦šà¦¯à¦¼ à¦²à¦•à§à¦·à§à¦¯</p>
              <p style={{ fontSize: "32px", fontWeight: "800", marginBottom: "4px" }}>{formatBDT(finalAmt)}</p>
              <p style={{ fontSize: "16px", opacity: 0.9 }}>{finalMonths} à¦®à¦¾à¦¸à§‡à¦° à¦®à¦§à§à¦¯à§‡</p>
            </div>

            {/* Daily saving */}
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>à¦ªà§à¦°à¦¤à¦¿à¦¦à¦¿à¦¨ à¦œà¦®à¦¾à¦¨</p>
                  <p style={{ fontSize: "28px", fontWeight: "800", color: "var(--color-primary)" }}>{formatBDT(dailySaving)}</p>
                  <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "4px" }}>= à¦®à¦¾à¦¸à§‡ {formatBDT(monthlySaving)}</p>
                </div>
                <AudioAssist text={resultText} label="à¦¶à§à¦¨à§à¦¨" />
              </div>
            </div>

            {/* Info tip */}
            <div className="privacy-notice" role="note">
              <span className="privacy-notice__icon" aria-hidden="true">ðŸ’¡</span>
              <span>à¦à¦‡ à¦¹à¦¿à¦¸à¦¾à¦¬ à¦†à¦ªà¦¨à¦¾à¦° à¦¡à¦¿à¦­à¦¾à¦‡à¦¸à§‡à¦‡ à¦¹à¦¯à¦¼à§‡à¦›à§‡à¥¤ à¦•à§‹à¦¨à§‹ à¦¤à¦¥à§à¦¯ à¦•à§‹à¦¥à¦¾à¦“ à¦¯à¦¾à¦¯à¦¼à¦¨à¦¿à¥¤</span>
            </div>

            {/* CTAs */}
            <Link href={`/compare?type=dps&min=${finalAmt}`} className="btn btn--outline" style={{ justifyContent: "center" }}>
              ðŸ“Š DPS à¦ªà¦£à§à¦¯ à¦¤à§à¦²à¦¨à¦¾ à¦•à¦°à§à¦¨
            </Link>
            <button className="btn btn--ghost" style={{ justifyContent: "center" }} onClick={() => { setStep(1); setGoalType(""); setTargetAmt(null); setMonths(null); setCustomAmt(""); setCustomMo(""); }}>
              ðŸ”„ à¦¨à¦¤à§à¦¨ à¦ªà¦°à¦¿à¦•à¦²à§à¦ªà¦¨à¦¾ à¦•à¦°à§à¦¨
            </button>

            <div className="disclaimer" role="note">
              à¦à¦‡ à¦¹à¦¿à¦¸à¦¾à¦¬ à¦†à¦¨à§à¦®à¦¾à¦¨à¦¿à¦•à¥¤ à¦®à§à¦¦à§à¦°à¦¾à¦¸à§à¦«à§€à¦¤à¦¿ à¦¬à¦¾ à¦¸à§à¦¦ à¦›à¦¾à¦¡à¦¼à¦¾à¦‡ à¦¸à¦°à¦² à¦¹à¦¿à¦¸à¦¾à¦¬à¥¤ à¦à¦Ÿà¦¿ à¦¤à¦¥à§à¦¯ à¦®à¦¾à¦¤à§à¦°, à¦†à¦°à§à¦¥à¦¿à¦• à¦ªà¦°à¦¾à¦®à¦°à§à¦¶ à¦¨à¦¯à¦¼à¥¤
            </div>
          </div>
        )}
      </div>
    </>
  );
}
