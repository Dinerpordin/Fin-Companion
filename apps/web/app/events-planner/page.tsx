"use client";

import { useState } from "react";
import Link from "next/link";
import AudioAssist from "../components/AudioAssist";

const EVENT_TYPES = [
  { key: "wedding",   icon: "💍", label: "বিয়ে",           hint: "মোট অনুষ্ঠানের খরচ" },
  { key: "dowry",     icon: "💰", label: "যৌতুক / উপহার",  hint: "বরপক্ষের দাবি বা পরিবারের উপহার" },
  { key: "eid",       icon: "🌙", label: "ঈদ উৎসব",        hint: "কেনাকাটা, খাবার, সেলামি" },
  { key: "funeral",   icon: "🕌", label: "জানাজা / কুলখানি",hint: "হঠাৎ খরচ" },
  { key: "hajj",      icon: "🕋", label: "হজ্জ / ওমরা",     hint: "যাত্রার মোট খরচ" },
  { key: "education", icon: "📚", label: "পড়াশোনার খরচ",   hint: "ভর্তি, বেতন, বই" },
  { key: "other",     icon: "📦", label: "অন্য উপলক্ষ",     hint: "নিজে লিখুন" },
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
  if (n >= 100000) return `৳${(n / 100000).toFixed(1)} লক্ষ`;
  if (n >= 1000)   return `৳${(n).toLocaleString("bn-BD")}`;
  return `৳${n}`;
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
    ? `আপনার ${eventLabel} এর জন্য প্রয়োজন ${formatBDT(gap!)}। প্রতি মাসে ${formatBDT(monthlySave)} সঞ্চয় করলে ${finalMonths} মাসে পৌঁছাবেন।`
    : "";

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">💍 উৎসব পরিকল্পনা</h1>
        <p className="section-subtitle">বিয়ে, ঈদ বা যেকোনো উপলক্ষের খরচ পরিকল্পনা করুন</p>
      </div>

      <div className="p-4">
        {/* Step 1 — Event type */}
        {step === 1 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>কী উপলক্ষে?</h2>
              <AudioAssist text="কোন উপলক্ষের জন্য পরিকল্পনা করছেন? বেছে নিন।" />
            </div>
            <div className="category-grid" role="group" aria-label="উপলক্ষ বেছে নিন">
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

        {/* Step 2 — Cost estimate */}
        {step === 2 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>আনুমানিক কত খরচ হবে?</h2>
              <AudioAssist text="এই উপলক্ষে আনুমানিক কত টাকা খরচ হবে বলে মনে করেন?" />
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
              {EVENT_TYPES.find(e => e.key === eventType)?.hint}
            </p>
            <div className="preset-btn-row" role="group" aria-label="খরচ বেছে নিন" style={{ flexWrap: "wrap" }}>
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
              placeholder="নিজে লিখুন (টাকায়)"
              value={customCost}
              onChange={e => { setCustomCost(e.target.value); setCost(null); }}
              style={{ marginTop: "12px", fontSize: "18px" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button className="btn btn--outline" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: "center" }}>← পেছনে</button>
              <button
                className="btn btn--primary" style={{ flex: 2, justifyContent: "center" }}
                onClick={() => (finalCost ? setStep(3) : null)}
                disabled={!finalCost}
              >পরের ধাপ →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Current savings */}
        {step === 3 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>এখন কত টাকা আছে?</h2>
              <AudioAssist text="এই কাজের জন্য এখন আপনার কাছে কত টাকা আছে?" />
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
                  {s === 0 ? "কিছু নেই" : formatBDT(s)}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field"
              placeholder="নিজে লিখুন"
              onChange={e => setSavings(parseFloat(e.target.value) || 0)}
              style={{ marginTop: "12px", fontSize: "18px" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button className="btn btn--outline" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: "center" }}>← পেছনে</button>
              <button className="btn btn--primary" style={{ flex: 2, justifyContent: "center" }} onClick={() => setStep(4)}>পরের ধাপ →</button>
            </div>
          </div>
        )}

        {/* Step 4 — Timeline */}
        {step === 4 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>কত মাস বাকি আছে?</h2>
              <AudioAssist text="এই উপলক্ষ আসতে আর কত মাস বাকি?" />
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
                  {m} মাস
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field"
              placeholder="নিজে লিখুন (মাস)"
              value={customMo}
              onChange={e => { setCustomMo(e.target.value); setMonths(null); }}
              style={{ marginTop: "12px", fontSize: "18px" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button className="btn btn--outline" onClick={() => setStep(3)} style={{ flex: 1, justifyContent: "center" }}>← পেছনে</button>
              <button
                className="btn btn--primary" style={{ flex: 2, justifyContent: "center" }}
                onClick={() => (finalMonths ? setStep(5) : null)}
                disabled={!finalMonths}
              >ফলাফল দেখুন →</button>
            </div>
          </div>
        )}

        {/* Step 5 — Result */}
        {step === 5 && finalCost && finalMonths && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Hero */}
            <div className="card" style={{ padding: "var(--space-4)", background: "var(--color-primary)", color: "white", borderRadius: "16px" }}>
              <p style={{ fontSize: "14px", opacity: 0.85, marginBottom: "6px" }}>{eventLabel} পরিকল্পনা</p>
              <p style={{ fontSize: "32px", fontWeight: "800" }}>{formatBDT(finalCost)}</p>
              <p style={{ fontSize: "14px", opacity: 0.85, marginTop: "4px" }}>{finalMonths} মাসের মধ্যে</p>
            </div>

            {/* Gap */}
            {gap !== null && gap > 0 && (
              <div className="card" style={{ padding: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>আরও কত টাকা লাগবে</p>
                    <p style={{ fontSize: "26px", fontWeight: "800", color: "var(--color-danger, #dc2626)" }}>{formatBDT(gap)}</p>
                    {monthlySave && (
                      <p style={{ fontSize: "14px", marginTop: "8px", color: "var(--color-primary)", fontWeight: "600" }}>
                        → প্রতি মাসে {formatBDT(monthlySave)} জমালে হবে
                      </p>
                    )}
                    {dailySave && (
                      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                        (প্রতিদিন মাত্র {formatBDT(dailySave)})
                      </p>
                    )}
                  </div>
                  <AudioAssist text={resultText} label="শুনুন" />
                </div>
              </div>
            )}

            {gap === 0 && (
              <div className="card" style={{ padding: "var(--space-4)", background: "var(--color-success-light, #e6f4ea)" }}>
                <p style={{ fontWeight: "700", fontSize: "18px", color: "var(--color-primary)" }}>✅ আপনার কাছে যথেষ্ট আছে!</p>
                <p style={{ fontSize: "14px", marginTop: "4px" }}>এখনকার সঞ্চয় দিয়েই এই উপলক্ষ সামলানো সম্ভব।</p>
              </div>
            )}

            {/* Borrowing cost warning */}
            {gap && gap > 0 && borrowCost && (
              <div className="card" style={{ padding: "var(--space-4)", borderLeft: "4px solid var(--color-warning, #d97706)" }}>
                <p style={{ fontWeight: "600", marginBottom: "4px" }}>⚠️ ঋণ নিলে কত পড়বে?</p>
                <p style={{ fontSize: "14px" }}>
                  {formatBDT(gap)} ধার করলে আনুমানিক মোট ফেরত দিতে হতে পারে <strong>{formatBDT(borrowCost)}</strong> (অনানুষ্ঠানিক হারে ~১৫%)।
                </p>
                <Link href="/check-loan" className="btn btn--outline btn--sm" style={{ marginTop: "10px", display: "inline-flex" }}>
                  🔍 ঋণের প্রকৃত খরচ পরীক্ষা করুন
                </Link>
              </div>
            )}

            <button className="btn btn--ghost" style={{ justifyContent: "center" }} onClick={() => { setStep(1); setEventType(""); setCost(null); setSavings(0); setMonths(null); setCustomCost(""); setCustomMo(""); }}>
              🔄 নতুন পরিকল্পনা করুন
            </button>

            <div className="disclaimer" role="note">
              সকল হিসাব আনুমানিক। ঋণের হার প্রতিষ্ঠান ও শর্ত অনুযায়ী ভিন্ন হয়। এটি তথ্য মাত্র, আর্থিক পরামর্শ নয়।
            </div>
          </div>
        )}
      </div>
    </>
  );
}
