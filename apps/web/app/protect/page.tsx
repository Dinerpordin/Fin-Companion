"use client";

import { useState } from "react";
import AudioAssist from "../components/AudioAssist";

const RED_FLAGS = [
  {
    icon: "💸",
    title: "অস্বাভাবিক বেশি রিটার্নের প্রতিশ্রুতি",
    body: "মাসে ২০-৩০% বা তার বেশি রিটার্নের কথা বললে এটি প্রায় সবসময় প্রতারণা। বর্তমান ব্যাংক FD রেট মাত্র ৭-৮% বার্ষিক।",
    audio: "মাসে ২০ থেকে ৩০ শতাংশ বা তার বেশি রিটার্নের কথা বললে এটি প্রায় সবসময় প্রতারণা। বর্তমান ব্যাংক রেট মাত্র ৭ থেকে ৮ শতাংশ বার্ষিক।",
  },
  {
    icon: "⏰",
    title: "এখনই সিদ্ধান্ত নিতে চাপ দেওয়া",
    body: "যে কেউ বলে 'আজকেই টাকা দিন, আর সুযোগ নেই' — সে প্রতারক হওয়ার সম্ভাবনা বেশি। বৈধ প্রতিষ্ঠান সময় দেয়।",
    audio: "যে কেউ বলে আজকেই টাকা দিন, আর সুযোগ নেই, সে প্রতারক হওয়ার সম্ভাবনা বেশি। বৈধ প্রতিষ্ঠান সময় দেয়।",
  },
  {
    icon: "💳",
    title: "আগে ফি বা অ্যাডভান্স চাওয়া",
    body: "'লোন পেতে আগে ৫০০ টাকা প্রসেসিং ফি দিন' — এটি প্রায় সবসময় প্রতারণা। বৈধ ব্যাংক বা MFI আগে টাকা নেয় না।",
    audio: "লোন পেতে আগে ৫০০ টাকা প্রসেসিং ফি দিন। এটি প্রায় সবসময় প্রতারণা। বৈধ ব্যাংক বা এমএফআই আগে টাকা নেয় না।",
  },
  {
    icon: "📵",
    title: "কোনো লিখিত কাগজ বা রেজিস্ট্রেশন নেই",
    body: "বৈধ আর্থিক প্রতিষ্ঠান সবসময় লিখিত চুক্তি দেয় এবং বাংলাদেশ ব্যাংক বা IDRA-তে নিবন্ধিত থাকে।",
    audio: "বৈধ আর্থিক প্রতিষ্ঠান সবসময় লিখিত চুক্তি দেয় এবং বাংলাদেশ ব্যাংক বা আইডিআরএ তে নিবন্ধিত থাকে।",
  },
  {
    icon: "🕵️",
    title: "পরিচিতদের মাধ্যমে টানা হচ্ছে",
    body: "পিরামিড স্কিমে প্রথমদিকে লাভ দেওয়া হয় বিশ্বাস অর্জনের জন্য। বন্ধু বা আত্মীয় বললেও যাচাই না করে বিনিয়োগ করবেন না।",
    audio: "পিরামিড স্কিমে প্রথমদিকে লাভ দেওয়া হয় বিশ্বাস অর্জনের জন্য। বন্ধু বা আত্মীয় বললেও যাচাই না করে বিনিয়োগ করবেন না।",
  },
];

const CHECKLIST = [
  { q: "এই প্রতিষ্ঠান কি বাংলাদেশ ব্যাংক বা IDRA-তে নিবন্ধিত?", safe: true  },
  { q: "তারা কি মাসে ১৫% বা তার বেশি রিটার্নের প্রতিশ্রুতি দিচ্ছে?", safe: false },
  { q: "তারা কি শুরুতেই কোনো ফি বা টাকা চাইছে?", safe: false },
  { q: "তারা কি লিখিত চুক্তিপত্র দিতে রাজি?", safe: true  },
  { q: "তারা কি এখনই সিদ্ধান্ত নিতে চাপ দিচ্ছে?", safe: false },
];

const CONTACTS = [
  { icon: "🏦", name: "বাংলাদেশ ব্যাংক (DFIM)",      phone: "16236",     note: "আর্থিক প্রতিষ্ঠানের বিরুদ্ধে অভিযোগ" },
  { icon: "🔍", name: "BFIU হেল্পলাইন",               phone: "02-9530108", note: "মানি লন্ডারিং ও আর্থিক অপরাধ" },
  { icon: "👮", name: "RAB সাইবার ক্রাইম",            phone: "16777",     note: "অনলাইন প্রতারণা" },
  { icon: "⚖️", name: "ভোক্তা অধিকার পরিদপ্তর",       phone: "16123",     note: "পণ্য ও সেবায় প্রতারণা" },
];

export default function ProtectPage() {
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(CHECKLIST.length).fill(null));
  const [returnPct, setReturnPct] = useState("");

  const answered   = answers.filter(a => a !== null).length;
  const safeCount  = CHECKLIST.filter((c, i) => {
    if (answers[i] === null) return false;
    return c.safe ? answers[i] === true : answers[i] === false;
  }).length;

  const riskLevel =
    answered < CHECKLIST.length ? "pending" :
    safeCount >= 4 ? "safe" :
    safeCount >= 2 ? "caution" : "danger";

  const fdRate = 7.5; // approximate current FD rate %
  const monthlyPct = parseFloat(returnPct);
  const annualPct  = monthlyPct ? monthlyPct * 12 : null;
  const vsFD       = annualPct  ? (annualPct / fdRate).toFixed(1) : null;

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">🛡️ প্রতারণা থেকে বাঁচুন</h1>
        <p className="section-subtitle">স্কিম চেনার উপায়, অভিযোগের নম্বর, এবং নিজেকে রক্ষা করুন</p>
      </div>

      <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Section 1 — Red flags */}
        <section aria-labelledby="redflag-title">
          <h2 id="redflag-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "12px" }}>
            🚩 প্রতারণা চেনার ৫টি লক্ষণ
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {RED_FLAGS.map((rf, i) => (
              <div key={i} className="card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: "700", fontSize: "15px", marginBottom: "6px" }}>
                      {rf.icon} {rf.title}
                    </p>
                    <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{rf.body}</p>
                  </div>
                  <AudioAssist text={rf.audio} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2 — Scheme checker */}
        <section aria-labelledby="checker-title">
          <h2 id="checker-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "4px" }}>
            🔎 এটা কি বৈধ?
          </h2>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
            প্রতিটি প্রশ্নের উত্তর দিন (শুধু ট্যাপ করুন):
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {CHECKLIST.map((c, i) => (
              <div key={i} className="card" style={{ padding: "14px 16px" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>{c.q}</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => { const a = [...answers]; a[i] = true; setAnswers(a); }}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "10px", border: "2px solid",
                      borderColor: answers[i] === true ? "var(--color-primary)" : "var(--color-border)",
                      background: answers[i] === true ? "var(--color-primary)" : "var(--color-surface)",
                      color: answers[i] === true ? "white" : "var(--color-text-primary)",
                      fontWeight: "700", fontSize: "16px", cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                    aria-pressed={answers[i] === true}
                  >✅ হ্যাঁ</button>
                  <button
                    onClick={() => { const a = [...answers]; a[i] = false; setAnswers(a); }}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "10px", border: "2px solid",
                      borderColor: answers[i] === false ? "var(--color-danger, #dc2626)" : "var(--color-border)",
                      background: answers[i] === false ? "var(--color-danger, #dc2626)" : "var(--color-surface)",
                      color: answers[i] === false ? "white" : "var(--color-text-primary)",
                      fontWeight: "700", fontSize: "16px", cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                    aria-pressed={answers[i] === false}
                  >❌ না</button>
                </div>
              </div>
            ))}
          </div>

          {answered === CHECKLIST.length && (
            <div
              className="card"
              style={{
                padding: "16px", marginTop: "12px",
                background: riskLevel === "safe" ? "var(--color-success-light, #e6f4ea)" :
                            riskLevel === "caution" ? "var(--color-warning-light, #fef7e0)" :
                            "var(--color-error-light, #fce8e6)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "18px", fontWeight: "800" }}>
                  {riskLevel === "safe"    ? "✅ তুলনামূলক নিরাপদ মনে হচ্ছে" :
                   riskLevel === "caution" ? "⚠️ আরও যাচাই করুন" :
                   "🔴 সম্ভাব্য প্রতারণা!"}
                </p>
                <AudioAssist
                  size="sm"
                  text={
                    riskLevel === "safe"    ? "এই প্রতিষ্ঠান তুলনামূলক নিরাপদ মনে হচ্ছে। তবু বিনিয়োগের আগে সব শর্ত যাচাই করুন।" :
                    riskLevel === "caution" ? "কিছু সন্দেহজনক লক্ষণ আছে। বিনিয়োগের আগে আরও যাচাই করুন।" :
                    "সতর্কতা! এটি প্রতারণা হওয়ার সম্ভাবনা বেশি। টাকা দেওয়ার আগে বিশ্বস্ত কাউকে জিজ্ঞেস করুন।"
                  }
                />
              </div>
              <p style={{ fontSize: "13px", marginTop: "6px", color: "var(--color-text-secondary)" }}>
                {riskLevel === "safe"
                  ? "তবুও বিনিয়োগের আগে লিখিত চুক্তি নিন এবং পরিবারকে জানান।"
                  : "টাকা দেওয়ার আগে বিশ্বস্ত কাউকে জিজ্ঞেস করুন বা নিচের নম্বরে অভিযোগ করুন।"}
              </p>
            </div>
          )}
        </section>

        {/* Section 3 — Too good to be true calculator */}
        <section aria-labelledby="calc-title">
          <h2 id="calc-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "4px" }}>
            🧮 "অনেক বেশি রিটার্ন" ক্যালকুলেটর
          </h2>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
            তারা কত শতাংশ মাসিক রিটার্নের কথা বলছে?
          </p>
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
              <input
                type="number"
                className="input-field"
                placeholder="যেমন: ২০"
                value={returnPct}
                onChange={e => setReturnPct(e.target.value)}
                style={{ fontSize: "20px", maxWidth: "140px" }}
              />
              <span style={{ fontSize: "18px", fontWeight: "700" }}>% প্রতি মাস</span>
            </div>
            {annualPct && vsFD && (
              <div style={{ background: "var(--color-error-light, #fce8e6)", padding: "12px", borderRadius: "10px" }}>
                <p style={{ fontWeight: "700", marginBottom: "4px" }}>
                  = বার্ষিক <strong>{annualPct.toFixed(0)}%</strong>
                </p>
                <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                  এটি ব্যাংক FD রেটের ({fdRate}%) চেয়ে <strong>{vsFD} গুণ বেশি</strong>।
                  এই রিটার্ন দেওয়া কোনো বৈধ প্রতিষ্ঠানের পক্ষে সম্ভব নয়।
                </p>
                <AudioAssist
                  size="sm"
                  label="শুনুন"
                  text={`মাসে ${monthlyPct} শতাংশ মানে বার্ষিক ${annualPct?.toFixed(0)} শতাংশ। এটি ব্যাংক রেটের ${vsFD} গুণ বেশি। কোনো বৈধ প্রতিষ্ঠান এত রিটার্ন দিতে পারে না।`}
                />
              </div>
            )}
          </div>
        </section>

        {/* Section 4 — Report contacts */}
        <section aria-labelledby="report-title">
          <h2 id="report-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "12px" }}>
            📞 অভিযোগ করুন
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {CONTACTS.map((c, i) => (
              <a
                key={i}
                href={`tel:${c.phone}`}
                className="card"
                style={{ padding: "14px 16px", textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "14px" }}
              >
                <span style={{ fontSize: "28px" }}>{c.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "700", fontSize: "14px" }}>{c.name}</p>
                  <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{c.note}</p>
                </div>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--color-primary)" }}>{c.phone} 📲</span>
              </a>
            ))}
          </div>
        </section>

        <div className="disclaimer" role="note">
          এই পাতার তথ্য সচেতনতার জন্য। কোনো আইনি পরামর্শ নয়। সিদ্ধান্ত নেওয়ার আগে বিশ্বস্ত ব্যক্তির পরামর্শ নিন।
        </div>
      </div>
    </>
  );
}
