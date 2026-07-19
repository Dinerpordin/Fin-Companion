"use client";

import { useState } from "react";
import Link from "next/link";
import AudioAssist from "../components/AudioAssist";

const GOAL_TYPES = [
  { key: "emergency",  icon: "🏥", label: "জরুরি তহবিল"   },
  { key: "wedding",    icon: "💍", label: "বিয়ে"           },
  { key: "education",  icon: "📚", label: "পড়াশোনা"        },
  { key: "hajj",       icon: "🕋", label: "হজ্জ / ওমরা"    },
  { key: "business",   icon: "🏪", label: "ব্যবসা শুরু"     },
  { key: "other",      icon: "🎯", label: "অন্য লক্ষ্য"    },
];

const AMOUNT_PRESETS = [5000, 10000, 20000, 50000, 100000, 200000];
const MONTH_PRESETS  = [3, 6, 12, 18, 24, 36];

function formatBDT(n: number) {
  if (n >= 100000) return `৳${(n / 100000).toFixed(1)} লক্ষ`;
  if (n >= 1000)   return `৳${n.toLocaleString("bn-BD")}`;
  return `৳${n}`;
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
    ? `প্রতিদিন ${formatBDT(dailySaving)} সাশ্রয় করলে ${finalMonths} মাসে আপনার লক্ষ্যে পৌঁছাবেন। অথবা প্রতি মাসে ${formatBDT(monthlySaving)} জমান।`
    : "";

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">🎯 সঞ্চয় পরিকল্পনা</h1>
        <p className="section-subtitle">ধাপে ধাপে আপনার লক্ষ্য ঠিক করুন — সম্পূর্ণ গোপনীয়</p>
      </div>

      <div className="p-4">
        {/* Step 1 — Goal type */}
        {step === 1 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>কীসের জন্য সঞ্চয় করবেন?</h2>
              <AudioAssist text="কীসের জন্য সঞ্চয় করবেন? নিচ থেকে বেছে নিন।" />
            </div>
            <div className="category-grid" role="group" aria-label="লক্ষ্য বেছে নিন">
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

        {/* Step 2 — Target amount */}
        {step === 2 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>কত টাকা লাগবে?</h2>
              <AudioAssist text="কত টাকা লাগবে? নিচের বোতাম থেকে বেছে নিন অথবা নিজে লিখুন।" />
            </div>
            <div className="preset-btn-row" role="group" aria-label="পরিমাণ বেছে নিন" style={{ flexWrap: "wrap" }}>
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
              placeholder="নিজে লিখুন (যেমন: ৩০০০০)"
              value={customAmt}
              onChange={e => { setCustomAmt(e.target.value); setTargetAmt(null); }}
              style={{ marginTop: "12px", fontSize: "18px" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button className="btn btn--outline" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: "center" }}>← পেছনে</button>
              <button
                className="btn btn--primary" style={{ flex: 2, justifyContent: "center" }}
                onClick={() => (finalAmt ? setStep(3) : null)}
                disabled={!finalAmt}
              >পরের ধাপ →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Timeline */}
        {step === 3 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>কত মাসের মধ্যে?</h2>
              <AudioAssist text="কত মাসের মধ্যে এই টাকা জমাতে চান? বেছে নিন।" />
            </div>
            <div className="preset-btn-row" role="group" aria-label="সময় বেছে নিন" style={{ flexWrap: "wrap" }}>
              {MONTH_PRESETS.map(m => (
                <button
                  key={m}
                  className={`preset-btn${months === m ? " active" : ""}`}
                  aria-pressed={months === m}
                  onClick={() => { setMonths(m); setCustomMo(""); }}
                  style={{ minWidth: "70px", fontSize: "15px", padding: "10px 14px" }}
                >
                  {m} মাস
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field"
              placeholder="নিজে লিখুন (মাসের সংখ্যা)"
              value={customMo}
              onChange={e => { setCustomMo(e.target.value); setMonths(null); }}
              style={{ marginTop: "12px", fontSize: "18px" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button className="btn btn--outline" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: "center" }}>← পেছনে</button>
              <button
                className="btn btn--primary" style={{ flex: 2, justifyContent: "center" }}
                onClick={() => (finalMonths ? setStep(4) : null)}
                disabled={!finalMonths}
              >ফলাফল দেখুন →</button>
            </div>
          </div>
        )}

        {/* Step 4 — Result */}
        {step === 4 && finalAmt && finalMonths && dailySaving && monthlySaving && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Hero result card */}
            <div className="card" style={{ padding: "var(--space-4)", background: "var(--color-primary)", color: "white", borderRadius: "16px" }}>
              <p style={{ fontSize: "14px", opacity: 0.85, marginBottom: "8px" }}>আপনার সঞ্চয় লক্ষ্য</p>
              <p style={{ fontSize: "32px", fontWeight: "800", marginBottom: "4px" }}>{formatBDT(finalAmt)}</p>
              <p style={{ fontSize: "16px", opacity: 0.9 }}>{finalMonths} মাসের মধ্যে</p>
            </div>

            {/* Daily saving */}
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>প্রতিদিন জমান</p>
                  <p style={{ fontSize: "28px", fontWeight: "800", color: "var(--color-primary)" }}>{formatBDT(dailySaving)}</p>
                  <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "4px" }}>= মাসে {formatBDT(monthlySaving)}</p>
                </div>
                <AudioAssist text={resultText} label="শুনুন" />
              </div>
            </div>

            {/* Info tip */}
            <div className="privacy-notice" role="note">
              <span className="privacy-notice__icon" aria-hidden="true">💡</span>
              <span>এই হিসাব আপনার ডিভাইসেই হয়েছে। কোনো তথ্য কোথাও যায়নি।</span>
            </div>

            {/* CTAs */}
            <Link href={`/compare?type=dps&min=${finalAmt}`} className="btn btn--outline" style={{ justifyContent: "center" }}>
              📊 DPS পণ্য তুলনা করুন
            </Link>
            <button className="btn btn--ghost" style={{ justifyContent: "center" }} onClick={() => { setStep(1); setGoalType(""); setTargetAmt(null); setMonths(null); setCustomAmt(""); setCustomMo(""); }}>
              🔄 নতুন পরিকল্পনা করুন
            </button>

            <div className="disclaimer" role="note">
              এই হিসাব আনুমানিক। মুদ্রাস্ফীতি বা সুদ ছাড়াই সরল হিসাব। এটি তথ্য মাত্র, আর্থিক পরামর্শ নয়।
            </div>
          </div>
        )}
      </div>
    </>
  );
}
