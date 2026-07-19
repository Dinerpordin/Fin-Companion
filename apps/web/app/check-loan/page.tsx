"use client";

import { useState } from "react";
import Link from "next/link";
import { calculateLoan } from "@fc/calculators";
import type { LoanFrequency } from "@fc/shared";
import { trackEvent } from "../utils/analytics";
import { formatBDT } from "../utils/formatBDT";
import AudioAssist from "../components/AudioAssist";
import WizardStepHeader from "../components/WizardStepHeader";

// BDT preset amounts for the loan amount field
const AMOUNT_PRESETS = [
  { label: "৳৫,০০০",    value: 5000   },
  { label: "৳১০,০০০",   value: 10000  },
  { label: "৳২৫,০০০",   value: 25000  },
  { label: "৳৫০,০০০",   value: 50000  },
  { label: "৳১,০০,০০০", value: 100000 },
];

// BDT preset amounts for instalment fields
const INSTALMENT_PRESETS = [
  { label: "৳৫০০",   value: 500  },
  { label: "৳১,০০০", value: 1000 },
  { label: "৳১,৫০০", value: 1500 },
  { label: "৳২,০০০", value: 2000 },
  { label: "৳৩,০০০", value: 3000 },
];

// Guided wizard step config
const WIZARD_STEPS = [
  {
    step: 1,
    icon: "💵",
    title: "আপনি কত টাকা ঋণ বা ধার নিচ্ছেন?",
    audio: "আপনি কত টাকা ঋণ বা ধার নিচ্ছেন? নিচের বোতাম থেকে বেছে নিন বা নিজে লিখুন।",
    placeholder: "টাকার পরিমাণ লিখুন (যেমন: ৫০০০০)",
  },
  {
    step: 2,
    icon: "📅",
    title: "প্রতি কিস্তিতে কত টাকা দিতে হয়?",
    audio: "প্রতি কিস্তিতে কত টাকা দিতে হয়? মাসিক কিস্তির পরিমাণটি নিচে লিখুন।",
    placeholder: "কিস্তির টাকা লিখুন (যেমন: ১৫০০)",
  },
  {
    step: 3,
    icon: "🔄",
    title: "কতদিন পর পর কিস্তি দিতে হয়?",
    audio: "কতদিন পর পর কিস্তি দিতে হয়? সাপ্তাহিক, পাক্ষিক, বা মাসিক — যেটি প্রযোজ্য সেটি বেছে নিন।",
    placeholder: "",
  },
  {
    step: 4,
    icon: "🔢",
    title: "মোট কতটি কিস্তি দিতে হবে?",
    audio: "মোট কতটি কিস্তি দিতে হবে? যেমন: ২৪ মাসের ঋণে ২৪টি কিস্তি।",
    placeholder: "কিস্তির সংখ্যা লিখুন (যেমন: ৩৬)",
  },
  {
    step: 5,
    icon: "🧾",
    title: "ঋণ নেওয়ার সময় কোনো ফি দিতে হয়েছে?",
    audio: "ঋণ নেওয়ার সময় কোনো প্রসেসিং ফি বা অগ্রিম চার্জ ছিল? থাকলে টাকার পরিমাণ লিখুন, না থাকলে খালি রেখে পরবর্তী ধাপে যান।",
    placeholder: "ফি-এর পরিমাণ লিখুন (না থাকলে খালি রাখুন)",
  },
];

const FREQUENCY_OPTIONS = [
  { value: "weekly",    label: "সাপ্তাহিক (প্রতি সপ্তাহে)" },
  { value: "biweekly",  label: "পাক্ষিক (২ সপ্তাহে একবার)" },
  { value: "monthly",   label: "মাসিক (প্রতি মাসে)" },
  { value: "quarterly", label: "ত্রৈমাসিক (৩ মাসে একবার)" },
  { value: "yearly",    label: "বার্ষিক (প্রতি বছর)" },
];

export default function CheckLoanPage() {
  const [amount, setAmount] = useState("");
  const [instalmentAmount, setInstalmentAmount] = useState("");
  const [frequency, setFrequency] = useState<LoanFrequency>("monthly");
  const [instalmentCount, setInstalmentCount] = useState("");
  const [upfrontFees, setUpfrontFees] = useState("");

  const [result, setResult] = useState<any>(null);

  // Wizard is now the DEFAULT mode (Sprint C)
  const [isGuidedMode, setIsGuidedMode] = useState(true);
  const [guidedStep, setGuidedStep] = useState(1);

  // Inline validation errors (Sprint E — replaces alert())
  const [stepError, setStepError] = useState("");

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!amount || !instalmentAmount || !instalmentCount) return;

    try {
      const output = calculateLoan({
        loan_amount: Number(amount),
        instalment_amount: Number(instalmentAmount),
        frequency,
        instalment_count: Number(instalmentCount),
        upfront_fees: upfrontFees ? Number(upfrontFees) : 0,
      });
      setResult(output);
      trackEvent("loan_checker", {
        amount: Number(amount),
        costRate: output.approximate_apr_percent,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const advanceStep = () => {
    setStepError("");
    if (guidedStep === 1 && !amount)          return setStepError("অনুগ্রহ করে ঋণের পরিমাণ লিখুন বা বেছে নিন।");
    if (guidedStep === 2 && !instalmentAmount) return setStepError("অনুগ্রহ করে কিস্তির পরিমাণ লিখুন বা বেছে নিন।");
    if (guidedStep === 4 && !instalmentCount) return setStepError("অনুগ্রহ করে কিস্তির সংখ্যা লিখুন।");
    if (guidedStep < 5) {
      setGuidedStep(guidedStep + 1);
    } else {
      if (!amount || !instalmentAmount || !instalmentCount)
        return setStepError("সব প্রয়োজনীয় তথ্য পূরণ হয়নি। পূর্বের ধাপগুলো পরীক্ষা করুন।");
      handleCalculate();
    }
  };

  const costBandLabels: Record<string, { label: string; color: string }> = {
    low:       { label: "কম খরচ",       color: "var(--color-success, #059669)" },
    medium:    { label: "মাঝারি খরচ",    color: "var(--color-warning, #d97706)" },
    high:      { label: "বেশি খরচ",      color: "var(--color-error, #dc2626)"   },
    very_high: { label: "অত্যধিক খরচ",   color: "var(--color-error, #dc2626)"   },
  };

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">ঋণ পরীক্ষা</h1>
        <p className="section-subtitle">আপনার ঋণের প্রকৃত খরচ হিসাব করুন — সম্পূর্ণ গোপনীয়</p>
      </div>

      <div className="p-4">
        {/* Privacy notice */}
        <div className="privacy-notice mb-4" role="note">
          <span className="privacy-notice__icon" aria-hidden="true">🔒</span>
          <span>আপনার সকল হিসাব শুধু আপনার ডিভাইসে হয়। কোনো তথ্য সার্ভারে পাঠানো হয় না।</span>
        </div>

        {/* Mode Toggle — now secondary, at top-right as small link (Sprint C) */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
          <button
            onClick={() => { setIsGuidedMode(!isGuidedMode); setGuidedStep(1); setStepError(""); }}
            className="btn btn--ghost btn--sm"
            style={{ fontSize: "12px", color: "var(--color-text-tertiary)", padding: "4px 8px" }}
          >
            {isGuidedMode ? "⚙️ বিশেষজ্ঞ মোড" : "🧭 সহজ ধাপে ধাপে মোড"}
          </button>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          {!isGuidedMode ? (
            /* Standard Grid Form */
            <form onSubmit={handleCalculate} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {/* Loan Amount */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <label htmlFor="amount" style={{ fontSize: "14px", fontWeight: "600" }}>ঋণের পরিমাণ (টাকা)</label>
                  <AudioAssist text="ঋণের পরিমাণ কত টাকা?" size="sm" />
                </div>
                <input id="amount" type="number" className="input-field" placeholder="যেমন: ৫০০০০" value={amount} onChange={e => setAmount(e.target.value)} required />
                <div className="preset-btn-row" role="group" aria-label="পরিমাণ দ্রুত বেছে নিন">
                  {AMOUNT_PRESETS.map(p => (
                    <button key={p.value} type="button" className={`preset-btn ${amount === String(p.value) ? "active" : ""}`} aria-pressed={amount === String(p.value)} onClick={() => setAmount(String(p.value))}>{p.label}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                {/* Instalment amount */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <label htmlFor="instalmentAmount" style={{ fontSize: "14px", fontWeight: "600" }}>কিস্তির পরিমাণ (টাকা)</label>
                    <AudioAssist text="প্রতি কিস্তির পরিমাণ কত?" size="sm" />
                  </div>
                  <input id="instalmentAmount" type="number" className="input-field" placeholder="যেমন: ১৫০০" value={instalmentAmount} onChange={e => setInstalmentAmount(e.target.value)} required />
                </div>
                {/* Frequency */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <label htmlFor="frequency" style={{ fontSize: "14px", fontWeight: "600" }}>কিস্তির ধরন</label>
                    <AudioAssist text="কিস্তি কত দিন পর পর দিতে হবে?" size="sm" />
                  </div>
                  <select id="frequency" className="input-field" value={frequency} onChange={e => setFrequency(e.target.value as LoanFrequency)} required>
                    {FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <label htmlFor="instalmentCount" style={{ fontSize: "14px", fontWeight: "600" }}>কিস্তির সংখ্যা</label>
                    <AudioAssist text="মোট কতটি কিস্তি দিতে হবে?" size="sm" />
                  </div>
                  <input id="instalmentCount" type="number" className="input-field" placeholder="যেমন: ৩৬" value={instalmentCount} onChange={e => setInstalmentCount(e.target.value)} required />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <label htmlFor="upfrontFees" style={{ fontSize: "14px", fontWeight: "600" }}>অগ্রিম ফি (যদি থাকে)</label>
                    <AudioAssist text="কোনো অগ্রিম প্রসেসিং ফি আছে কি?" size="sm" />
                  </div>
                  <input id="upfrontFees" type="number" className="input-field" placeholder="যেমন: ৫০০" value={upfrontFees} onChange={e => setUpfrontFees(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn btn--primary mt-2" style={{ justifyContent: "center" }}>হিসাব করুন</button>
            </form>
          ) : (
            /* Guided Step-by-Step Wizard (now default) */
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {/* WizardStepHeader replaces ad-hoc progress bar (Sprint C) */}
              <WizardStepHeader
                step={guidedStep}
                total={5}
                icon={WIZARD_STEPS[guidedStep - 1].icon}
                title={WIZARD_STEPS[guidedStep - 1].title}
                audioText={WIZARD_STEPS[guidedStep - 1].audio}
              />

              {/* Input per step */}
              <div style={{ marginTop: "var(--space-2)" }}>
                {guidedStep === 1 && (
                  <>
                    <input type="number" className="input-field" placeholder={WIZARD_STEPS[0].placeholder} value={amount} onChange={e => { setAmount(e.target.value); setStepError(""); }} autoFocus />
                    <div className="preset-btn-row" role="group" aria-label="পরিমাণ দ্রুত বেছে নিন">
                      {AMOUNT_PRESETS.map(p => (
                        <button key={p.value} type="button" className={`preset-btn ${amount === String(p.value) ? "active" : ""}`} aria-pressed={amount === String(p.value)} onClick={() => { setAmount(String(p.value)); setStepError(""); }}>{p.label}</button>
                      ))}
                    </div>
                  </>
                )}
                {guidedStep === 2 && (
                  <>
                    <input type="number" className="input-field" placeholder={WIZARD_STEPS[1].placeholder} value={instalmentAmount} onChange={e => { setInstalmentAmount(e.target.value); setStepError(""); }} autoFocus />
                    <div className="preset-btn-row" role="group" aria-label="কিস্তির পরিমাণ দ্রুত বেছে নিন">
                      {INSTALMENT_PRESETS.map(p => (
                        <button key={p.value} type="button" className={`preset-btn ${instalmentAmount === String(p.value) ? "active" : ""}`} aria-pressed={instalmentAmount === String(p.value)} onClick={() => { setInstalmentAmount(String(p.value)); setStepError(""); }}>{p.label}</button>
                      ))}
                    </div>
                  </>
                )}
                {guidedStep === 3 && (
                  <select className="input-field" value={frequency} onChange={e => setFrequency(e.target.value as LoanFrequency)} style={{ fontSize: "16px" }}>
                    {FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                )}
                {guidedStep === 4 && (
                  <input type="number" className="input-field" placeholder={WIZARD_STEPS[3].placeholder} value={instalmentCount} onChange={e => { setInstalmentCount(e.target.value); setStepError(""); }} autoFocus />
                )}
                {guidedStep === 5 && (
                  <input type="number" className="input-field" placeholder={WIZARD_STEPS[4].placeholder} value={upfrontFees} onChange={e => setUpfrontFees(e.target.value)} autoFocus />
                )}

                {/* Inline validation error (Sprint E — replaces alert()) */}
                {stepError && (
                  <p className="form-error" role="alert">⚠️ {stepError}</p>
                )}
              </div>

              {/* Wizard navigation */}
              <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                {guidedStep > 1 ? (
                  <button onClick={() => { setGuidedStep(guidedStep - 1); setStepError(""); }} className="btn btn--outline" style={{ flex: 1, justifyContent: "center" }}>
                    ← পূর্বের ধাপ
                  </button>
                ) : <div style={{ flex: 1 }} />}

                <button onClick={advanceStep} className="btn btn--primary" style={{ flex: 1, justifyContent: "center" }}>
                  {guidedStep < 5 ? "পরবর্তী →" : "হিসাব করুন ✓"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Card with Visual Money Bars (Sprint A) */}
        {result && (
          <div
            className="card mt-4"
            style={{ padding: "var(--space-4)", borderLeft: `4px solid ${costBandLabels[result.cost_band]?.color}` }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>ফলাফল</h2>
              <AudioAssist
                text={`হিসাবের ফলাফল: আপনার মোট পরিশোধ করতে হবে ${formatBDT(result.total_repay)}। এর মধ্যে বাড়তি খরচ হলো ${formatBDT(result.total_extra_paid)}। সময় লাগবে ${result.time_remaining_months} মাস। এটি একটি ${costBandLabels[result.cost_band]?.label} ঋণ।`}
              />
            </div>

            {/* Visual money bars */}
            <div className="money-bars">
              {/* Principal bar */}
              <div className="money-bar-row">
                <div className="money-bar-label">
                  <span className="money-bar-label__name">🟢 আসল ঋণের পরিমাণ</span>
                  <span className="money-bar-label__amount" style={{ color: "var(--color-primary)" }}>
                    {formatBDT(Number(amount))}
                  </span>
                </div>
                <div className="money-bar-track">
                  <div
                    className="money-bar-fill money-bar-fill--principal"
                    style={{ width: `${(Number(amount) / result.total_repay) * 100}%` }}
                  />
                </div>
              </div>
              {/* Extra cost bar */}
              <div className="money-bar-row">
                <div className="money-bar-label">
                  <span className="money-bar-label__name">🟠 বাড়তি খরচ (সুদ ও ফি)</span>
                  <span className="money-bar-label__amount" style={{ color: costBandLabels[result.cost_band]?.color }}>
                    {formatBDT(result.total_extra_paid)}
                  </span>
                </div>
                <div className="money-bar-track">
                  <div
                    className="money-bar-fill money-bar-fill--extra"
                    style={{ width: `${(result.total_extra_paid / result.total_repay) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Summary row */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-border-light)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>মোট পরিশোধ:</span>
                <span style={{ fontWeight: "800", fontSize: "18px" }}>{formatBDT(result.total_repay)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>সময় লাগবে:</span>
                <span style={{ fontWeight: "600" }}>{result.time_remaining_months} মাস</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>খরচের মাত্রা:</span>
                <span style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "13px",
                  fontWeight: "700",
                  background: `${costBandLabels[result.cost_band]?.color}20`,
                  color: costBandLabels[result.cost_band]?.color,
                }}>
                  {costBandLabels[result.cost_band]?.label}
                </span>
              </div>
            </div>

            <div style={{ marginTop: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <Link href="/compare" className="btn btn--outline" style={{ width: "100%", justifyContent: "center" }}>
                📊 কম খরচের বিকল্প খুঁজুন
              </Link>
              <button
                onClick={() => {
                  setResult(null);
                  setAmount("");
                  setInstalmentAmount("");
                  setInstalmentCount("");
                  setUpfrontFees("");
                  setGuidedStep(1);
                  setStepError("");
                }}
                className="btn btn--secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                🔄 নতুন করে হিসাব করুন
              </button>
            </div>
          </div>
        )}

        <div className="disclaimer mt-4" role="note">
          এই টুল শুধু তথ্যের জন্য। এটি আর্থিক পরামর্শ নয়।
        </div>
      </div>
    </>
  );
}
