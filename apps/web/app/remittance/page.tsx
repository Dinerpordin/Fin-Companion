"use client";

import { useState } from "react";
import Link from "next/link";
import AudioAssist from "../components/AudioAssist";

const CHANNELS = [
  {
    key: "bkash",
    icon: "📱",
    name: "bKash",
    fee: "৳5–৳25 প্রতি লেনদেনে",
    rate: "বাজার দরের কাছাকাছি",
    speed: "তাৎক্ষণিক",
    best: "ছোট পরিমাণ (৳5,000 পর্যন্ত)",
    audio: "বিকাশ: প্রতি লেনদেনে ৫ থেকে ২৫ টাকা ফি। ছোট পরিমাণের জন্য ভালো।",
  },
  {
    key: "nagad",
    icon: "📲",
    name: "Nagad",
    fee: "৳5–৳20 প্রতি লেনদেনে",
    rate: "বাজার দরের কাছাকাছি",
    speed: "তাৎক্ষণিক",
    best: "ছোট থেকে মাঝারি পরিমাণ",
    audio: "নগদ: প্রতি লেনদেনে ৫ থেকে ২০ টাকা ফি। বিকাশের মতোই।",
  },
  {
    key: "dbbl",
    icon: "🏧",
    name: "Dutch-Bangla (DBBL)",
    fee: "৳30–৳100",
    rate: "ভালো বিনিময় হার",
    speed: "একই দিন বা পরের দিন",
    best: "মাঝারি পরিমাণ",
    audio: "ডাচ-বাংলা ব্যাংক: বিনিময় হার ভালো। মাঝারি পরিমাণের জন্য উপযুক্ত।",
  },
  {
    key: "bank",
    icon: "🏦",
    name: "ব্যাংক ওয়্যার ট্রান্সফার",
    fee: "৳100–৳500 (ব্যাংক ভেদে)",
    rate: "সাধারণত সর্বোত্তম হার",
    speed: "১–৩ কার্যদিবস",
    best: "বড় পরিমাণ (৳50,000+)",
    audio: "ব্যাংক ট্রান্সফার: বড় পরিমাণে সবচেয়ে ভালো হার পাওয়া যায়। ১ থেকে ৩ দিন সময় লাগে।",
  },
  {
    key: "exchange",
    icon: "🏪",
    name: "এক্সচেঞ্জ হাউস (Western Union / MoneyGram)",
    fee: "৳150–৳600",
    rate: "পরিবর্তনশীল — তুলনা করুন",
    speed: "মিনিট থেকে ঘণ্টা",
    best: "প্রাপক ব্যাংক ছাড়া নগদ পেতে",
    audio: "ওয়েস্টার্ন ইউনিয়ন বা মানিগ্রাম: নগদ পেতে চাইলে উপযুক্ত। তবে ফি তুলনা করুন।",
  },
];

const WHAT_TO_DO = [
  {
    icon: "🏦",
    title: "FD (Fixed Deposit) খুলুন",
    body: "৬–১২ মাসের জন্য রাখলে ৭–৮% বার্ষিক রিটার্ন পাবেন।",
    href: "/compare?type=fd",
    cta: "FD তুলনা করুন",
  },
  {
    icon: "💰",
    title: "DPS শুরু করুন",
    body: "প্রতি মাসে একটু জমিয়ে বড় লক্ষ্যের দিকে এগিয়ে যান।",
    href: "/compare?type=dps",
    cta: "DPS তুলনা করুন",
  },
  {
    icon: "🎯",
    title: "জরুরি তহবিল গড়ুন",
    body: "মাসের খরচের ৩–৬ গুণ আলাদা রাখুন।",
    href: "/savings",
    cta: "পরিকল্পনা করুন",
  },
  {
    icon: "🔍",
    title: "ঋণ শোধ করুন",
    body: "যদি কোনো ঋণ থাকে, রেমিট্যান্সের টাকা দিয়ে আগে পরিশোধ করলে সুদ বাঁচবে।",
    href: "/check-loan",
    cta: "ঋণ পরীক্ষা করুন",
  },
];

function formatBDT(n: number) {
  if (n >= 100000) return `৳${(n / 100000).toFixed(1)} লক্ষ`;
  if (n >= 1000)   return `৳${n.toLocaleString("bn-BD")}`;
  return `৳${n}`;
}

export default function RemittancePage() {
  const [amount,     setAmount]     = useState<number | null>(null);
  const [customAmt,  setCustomAmt]  = useState("");
  const [selected,   setSelected]   = useState<string | null>(null);

  const PRESETS = [5000, 10000, 25000, 50000, 100000, 200000];
  const finalAmt = amount ?? (customAmt ? parseFloat(customAmt) : null);
  const channel  = CHANNELS.find(c => c.key === selected);

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">✈️ রেমিট্যান্স গাইড</h1>
        <p className="section-subtitle">বিদেশ থেকে টাকা পাঠানো ও পাওয়ার সহজ গাইড</p>
      </div>

      <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Channel comparison */}
        <section aria-labelledby="channel-title">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 id="channel-title" style={{ fontSize: "17px", fontWeight: "700" }}>
              📊 কোন মাধ্যমে পাঠাবেন?
            </h2>
            <AudioAssist text="কোন মাধ্যমে টাকা পাঠাবেন? নিচে তুলনা দেখুন।" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {CHANNELS.map(ch => (
              <button
                key={ch.key}
                onClick={() => setSelected(selected === ch.key ? null : ch.key)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "14px",
                  padding: "14px 16px", borderRadius: "12px", border: "2px solid",
                  borderColor: selected === ch.key ? "var(--color-primary)" : "var(--color-border)",
                  background: selected === ch.key ? "var(--color-primary-light, #e6f4f0)" : "var(--color-surface)",
                  cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)",
                  width: "100%",
                }}
                aria-expanded={selected === ch.key}
              >
                <span style={{ fontSize: "28px", flexShrink: 0 }}>{ch.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "700", fontSize: "15px", marginBottom: "2px" }}>{ch.name}</p>
                  <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>💸 ফি: {ch.fee}</p>
                  <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>⏱ গতি: {ch.speed}</p>
                  <p style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: "600" }}>✅ সেরা: {ch.best}</p>
                </div>
                <AudioAssist text={ch.audio} size="sm" />
              </button>
            ))}
          </div>
        </section>

        {/* Amount received — what to do */}
        <section aria-labelledby="received-title">
          <h2 id="received-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "4px" }}>
            💡 টাকা পেলে কী করবেন?
          </h2>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
            কত টাকা পেয়েছেন বা পাবেন?
          </p>
          <div className="preset-btn-row" role="group" style={{ flexWrap: "wrap", marginBottom: "10px" }}>
            {PRESETS.map(p => (
              <button
                key={p}
                className={`preset-btn${amount === p ? " active" : ""}`}
                onClick={() => { setAmount(p); setCustomAmt(""); }}
                style={{ minWidth: "80px", fontSize: "14px", padding: "10px 12px" }}
              >
                {formatBDT(p)}
              </button>
            ))}
          </div>
          <input
            type="number"
            className="input-field"
            placeholder="নিজে লিখুন (টাকায়)"
            value={customAmt}
            onChange={e => { setCustomAmt(e.target.value); setAmount(null); }}
            style={{ marginBottom: "16px", fontSize: "16px" }}
          />

          {finalAmt && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="card" style={{ padding: "14px 16px", background: "var(--color-primary)", color: "white", borderRadius: "12px" }}>
                <p style={{ fontSize: "13px", opacity: 0.85 }}>পাওয়া রেমিট্যান্স</p>
                <p style={{ fontSize: "28px", fontWeight: "800" }}>{formatBDT(finalAmt)}</p>
                <AudioAssist
                  text={`আপনি পেয়েছেন ${formatBDT(finalAmt)}। নিচে এই টাকা ব্যবহারের কিছু পরামর্শ দেওয়া হল।`}
                  label="শুনুন"
                />
              </div>
              <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-secondary)" }}>এই টাকা কীভাবে কাজে লাগাবেন:</p>
              {WHAT_TO_DO.map((w, i) => (
                <div key={i} className="card" style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>{w.icon} {w.title}</p>
                      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "8px" }}>{w.body}</p>
                      <Link href={w.href} className="btn btn--outline btn--sm" style={{ display: "inline-flex", fontSize: "13px" }}>
                        {w.cta} →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tips */}
        <section aria-labelledby="tips-title">
          <h2 id="tips-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "12px" }}>⚠️ সতর্কতা</h2>
          <div className="card" style={{ padding: "14px 16px", borderLeft: "4px solid var(--color-warning, #d97706)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: "600", marginBottom: "4px" }}>অবৈধ হুন্ডি ব্যবহার করবেন না</p>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                  হুন্ডি বেআইনি এবং আপনার টাকা হারানোর ঝুঁকি থাকে। বৈধ চ্যানেলে পাঠালে প্রবাসী কল্যাণ সুবিধা পাওয়া যায়।
                </p>
              </div>
              <AudioAssist text="হুন্ডি বেআইনি এবং বিপজ্জনক। সবসময় বৈধ ব্যাংক বা মোবাইল ফিনান্সিয়াল সার্ভিস ব্যবহার করুন।" size="sm" />
            </div>
          </div>
        </section>

        <div className="disclaimer" role="note">
          ফি ও বিনিময় হার পরিবর্তনশীল। লেনদেনের আগে সরাসরি প্রতিষ্ঠান থেকে নিশ্চিত করুন। এটি তথ্য মাত্র।
        </div>
      </div>
    </>
  );
}
