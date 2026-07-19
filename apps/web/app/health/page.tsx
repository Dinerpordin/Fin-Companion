"use client";

import { useState } from "react";
import Link from "next/link";
import { trackEvent } from "../utils/analytics";
import AudioAssist from "../components/AudioAssist";

export default function HealthPage() {
  const [income, setIncome] = useState("");
  const [fixedCosts, setFixedCosts] = useState("");
  const [debtRepay, setDebtRepay] = useState("");
  const [savings, setSavings] = useState("");
  
  const [results, setResults] = useState<{
    cashflow: "good" | "tight" | "negative" | null;
    debtPressure: "low" | "medium" | "high" | null;
    savingsPotential: "good" | "low" | null;
  }>({ cashflow: null, debtPressure: null, savingsPotential: null });

  const calculateHealth = () => {
    const inc = parseFloat(income) || 0;
    const costs = parseFloat(fixedCosts) || 0;
    const debt = parseFloat(debtRepay) || 0;
    const sav = parseFloat(savings) || 0;
    
    if (inc === 0) return;

    const totalOut = costs + debt;
    const cashflowRatio = totalOut / inc;
    const debtRatio = debt / inc;
    const savingsRatio = sav / inc;

    setResults({
      cashflow: cashflowRatio > 1 ? "negative" : cashflowRatio > 0.8 ? "tight" : "good",
      debtPressure: debtRatio > 0.4 ? "high" : debtRatio > 0.2 ? "medium" : "low",
      savingsPotential: savingsRatio > 0.1 ? "good" : "low"
    });

    // Sprint 9: Track health snapshot completed using privacy-safe binned income
    trackEvent("health_assessment", {
      amount: inc,
      intentClass: "health_snapshot"
    });
  };

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">আর্থিক স্বাস্থ্য</h1>
        <p className="section-subtitle">
          আপনার আয়, ব্যয় ও ঋণ বিশ্লেষণ — গোপনীয়ভাবে
        </p>
      </div>

      <div className="p-4">
        <div className="privacy-notice mb-4" role="note">
          <span className="privacy-notice__icon" aria-hidden="true">🔒</span>
          <span>
            আপনার আর্থিক তথ্য শুধু আপনার ডিভাইসে হিসাব হয়। সার্ভারে যায় না।
          </span>
        </div>

        <div className="card mb-4" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "var(--space-3)" }}>
          <label>
            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>মাসিক আয় (টাকা)</div>
            <input type="number" className="input-field" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="উদা: ২০০০০" />
          </label>
          <label>
            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>মাসিক খরচ (টাকা)</div>
            <input type="number" className="input-field" value={fixedCosts} onChange={(e) => setFixedCosts(e.target.value)} placeholder="উদা: ১২০০০" />
          </label>
          <label>
            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>মাসিক ঋণের কিস্তি (টাকা)</div>
            <input type="number" className="input-field" value={debtRepay} onChange={(e) => setDebtRepay(e.target.value)} placeholder="উদা: ৩০০০" />
          </label>
          <label>
            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>মাসিক সঞ্চয় (টাকা)</div>
            <input type="number" className="input-field" value={savings} onChange={(e) => setSavings(e.target.value)} placeholder="উদা: ১০০০" />
          </label>
          <button className="btn btn--primary" onClick={calculateHealth} style={{ justifyContent: "center" }}>বিশ্লেষণ করুন</button>
        </div>

        {results.cashflow && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "var(--space-3)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>ফলাফলের সংকেত</h3>
            
            <div style={{ padding: "12px", borderRadius: "8px", background: results.cashflow === "good" ? "var(--color-success-light, #e6f4ea)" : results.cashflow === "tight" ? "var(--color-warning-light, #fef7e0)" : "var(--color-error-light, #fce8e6)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontWeight: "600" }}>নগদ প্রবাহ: {results.cashflow === "good" ? "✅ স্বাভাবিক" : results.cashflow === "tight" ? "⚠️ চাপযুক্ত" : "🔴 নেতিবাচক"}</p>
                <AudioAssist size="sm" text={`আপনার নগদ প্রবাহ ${results.cashflow === "good" ? "স্বাভাবিক" : results.cashflow === "tight" ? "চাপযুক্ত" : "নেতিবাচক"}। আয় দিয়ে খরচ মেটানোর ক্ষমতা।`} />
              </div>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>আপনার আয় দিয়ে খরচ মেটানোর ক্ষমতা।</p>
            </div>

            <div style={{ padding: "12px", borderRadius: "8px", background: results.debtPressure === "low" ? "var(--color-success-light, #e6f4ea)" : results.debtPressure === "medium" ? "var(--color-warning-light, #fef7e0)" : "var(--color-error-light, #fce8e6)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontWeight: "600" }}>ঋণের চাপ: {results.debtPressure === "low" ? "✅ কম" : results.debtPressure === "medium" ? "⚠️ মাঝারি" : "🔴 বেশি"}</p>
                <AudioAssist size="sm" text={`আপনার ঋণের চাপ ${results.debtPressure === "low" ? "কম" : results.debtPressure === "medium" ? "মাঝারি" : "বেশি"}। আয়ের তুলনায় ঋণের কিস্তির অনুপাত।`} />
              </div>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>আয়ের তুলনায় ঋণের কিস্তির অনুপাত।</p>
            </div>

            <div style={{ padding: "12px", borderRadius: "8px", background: results.savingsPotential === "good" ? "var(--color-success-light, #e6f4ea)" : "var(--color-warning-light, #fef7e0)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontWeight: "600" }}>সঞ্চয়: {results.savingsPotential === "good" ? "✅ ভালো" : "⚠️ কম"}</p>
                <AudioAssist size="sm" text={`আপনার সঞ্চয় ${results.savingsPotential === "good" ? "ভালো" : "কম"}। আয়ের অনুপাতে সঞ্চয়ের হার।`} />
              </div>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>আয়ের অনুপাতে সঞ্চয়ের হার।</p>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Link href="/scenarios" className="btn btn--outline" style={{ width: "100%", justifyContent: "center" }}>
                কীভাবে অবস্থার উন্নতি করবেন? (পরিকল্পনা)
              </Link>
            </div>
          </div>
        )}

        <div className="disclaimer mt-4" role="note">
          এই টুলের ফলাফল পরিস্থিতির সংকেত মাত্র — আর্থিক পরামর্শ নয়।
        </div>
      </div>
    </>
  );
}
