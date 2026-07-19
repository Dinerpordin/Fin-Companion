"use client";

import { useState } from "react";
import AudioAssist from "../components/AudioAssist";

const INSURANCE_TYPES = [
  { key: "health",    icon: "🏥", label: "স্বাস্থ্য বীমা"  },
  { key: "life",      icon: "💀", label: "জীবন বীমা"     },
  { key: "crop",      icon: "🌾", label: "ফসল বীমা"      },
  { key: "property",  icon: "🏠", label: "সম্পদ বীমা"    },
];

const EXPLAINER_SLIDES = [
  { icon: "💰", title: "আপনি প্রতি মাসে ছোট একটি টাকা জমান", body: "বীমা কোম্পানিকে দেন — একে প্রিমিয়াম বলে।", audio: "বীমায় আপনি প্রতি মাসে ছোট একটি টাকা দেন। একে প্রিমিয়াম বলে।" },
  { icon: "🏥", title: "হঠাৎ বিপদ হলে (অসুস্থতা, মৃত্যু, আগুন)", body: "বীমা কোম্পানি একটি বড় টাকা দেয় — যাতে আপনাকে জমি বিক্রি করতে না হয়।", audio: "বিপদ হলে বীমা কোম্পানি একটি বড় টাকা দেয়। যাতে আপনাকে সম্পদ বিক্রি করতে না হয়।" },
  { icon: "✅", title: "বীমা কী নয়?", body: "বীমা লাভজনক বিনিয়োগ নয়। এটি ঝুঁকি থেকে সুরক্ষা মাত্র।", audio: "বীমা বিনিয়োগ নয়। এটি বিপদের সময় সুরক্ষা দেয়।" },
];

const PRODUCTS: Record<string, { name: string; provider: string; premium: string; covers: string; claim: string; idra: string; audio: string }[]> = {
  health: [
    {
      name: "স্বাস্থ্য সুরক্ষা বীমা",
      provider: "Delta Life Insurance",
      premium: "মাসে ৳১৫০-৳৫০০",
      covers: "হাসপাতালে ভর্তি খরচ পর্যন্ত ৳৫০,০০০",
      claim: "হাসপাতালের বিল ও ভর্তির কাগজ দিয়ে দাবি করুন",
      idra: "IDRA নিবন্ধিত",
      audio: "ডেল্টা লাইফের স্বাস্থ্য সুরক্ষা বীমা মাসে ১৫০ থেকে ৫০০ টাকায় ৫০ হাজার টাকা পর্যন্ত হাসপাতালের খরচ দেয়।",
    },
    {
      name: "গ্রামীণ স্বাস্থ্য বীমা",
      provider: "Green Delta Insurance",
      premium: "মাসে ৳১০০-৳৩০০",
      covers: "বাহ্যিক ও অভ্যন্তরীণ চিকিৎসা সহায়তা",
      claim: "প্রেসক্রিপশন ও বিলসহ নিকটস্থ শাখায় দাবি করুন",
      idra: "IDRA নিবন্ধিত",
      audio: "গ্রিন ডেল্টার গ্রামীণ স্বাস্থ্য বীমা মাসে ১০০ থেকে ৩০০ টাকায় পাওয়া যায়।",
    },
  ],
  life: [
    {
      name: "জীবন বীমা (সাধারণ)",
      provider: "National Life Insurance",
      premium: "মাসে ৳২০০-৳৮০০",
      covers: "মৃত্যুতে পরিবারকে ৳১-৳৫ লক্ষ",
      claim: "মৃত্যু সনদ, NID ও নমিনির কাগজ দিয়ে দাবি করুন",
      idra: "IDRA নিবন্ধিত",
      audio: "ন্যাশনাল লাইফের জীবন বীমা মাসে ২০০ থেকে ৮০০ টাকায় মৃত্যুতে পরিবারকে ১ থেকে ৫ লক্ষ টাকা দেয়।",
    },
    {
      name: "মাইক্রো লাইফ প্ল্যান",
      provider: "Pragati Life Insurance",
      premium: "মাসে ৳৫০-৳১৫০",
      covers: "মৃত্যুতে পরিবারকে ৳৩০,০০০",
      claim: "মৃত্যু সনদসহ নিকটস্থ শাখায় দাবি করুন",
      idra: "IDRA নিবন্ধিত",
      audio: "প্রগতি লাইফের মাইক্রো প্ল্যান মাসে মাত্র ৫০ থেকে ১৫০ টাকায় পাওয়া যায়।",
    },
  ],
  crop: [
    {
      name: "ফসল বীমা",
      provider: "Sadharan Bima Corporation (SBC)",
      premium: "ফসলের মূল্যের ~২-৩%",
      covers: "বন্যা, খরা বা পোকায় ফসল নষ্ট হলে ক্ষতিপূরণ",
      claim: "উপজেলা কৃষি অফিসের প্রত্যয়নসহ দাবি করুন",
      idra: "IDRA নিবন্ধিত",
      audio: "সাধারণ বীমা কর্পোরেশনের ফসল বীমা বন্যা বা খরায় ফসল নষ্ট হলে ক্ষতিপূরণ দেয়।",
    },
  ],
  property: [
    {
      name: "গৃহস্থালি সম্পদ বীমা",
      provider: "Rupali General Insurance",
      premium: "বার্ষিক ৳৩০০-৳১,০০০",
      covers: "আগুন, চুরি বা দুর্ঘটনায় সম্পদ ক্ষতি",
      claim: "পুলিশ রিপোর্ট ও ক্ষতির ছবিসহ দাবি করুন",
      idra: "IDRA নিবন্ধিত",
      audio: "রূপালী জেনারেল বীমার গৃহস্থালি বীমা আগুন বা চুরিতে সম্পদ ক্ষতির বিপরীতে সুরক্ষা দেয়।",
    },
  ],
};

export default function InsurancePage() {
  const [slide,       setSlide]       = useState(0);
  const [activeType,  setActiveType]  = useState("");
  const [verifyName,  setVerifyName]  = useState("");
  const [verifyResult, setVerifyResult] = useState<"registered" | "unknown" | null>(null);

  // Simplified verification — a short list of known registered companies
  const REGISTERED = ["delta life", "green delta", "national life", "pragati life", "rupali", "sadharan bima", "sbc", "popular life", "meghna life", "allianz", "sunlife", "bsrs"];

  const handleVerify = () => {
    const lower = verifyName.toLowerCase().trim();
    const found = REGISTERED.some(r => lower.includes(r) || r.includes(lower));
    setVerifyResult(found ? "registered" : "unknown");
  };

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">🌱 বীমা সচেতনতা</h1>
        <p className="section-subtitle">বীমা বুঝুন, সঠিক পণ্য বেছে নিন, প্রতারণা এড়ান</p>
      </div>

      <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Section 1 — What is insurance */}
        <section aria-labelledby="explainer-title">
          <h2 id="explainer-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "12px" }}>
            💡 বীমা কী? (সহজ ভাষায়)
          </h2>
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "36px" }}>{EXPLAINER_SLIDES[slide].icon}</span>
              <AudioAssist text={EXPLAINER_SLIDES[slide].audio} label="শুনুন" />
            </div>
            <p style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>{EXPLAINER_SLIDES[slide].title}</p>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{EXPLAINER_SLIDES[slide].body}</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button
                onClick={() => setSlide(Math.max(0, slide - 1))}
                disabled={slide === 0}
                className="btn btn--outline"
                style={{ flex: 1, justifyContent: "center", fontSize: "13px" }}
              >← আগে</button>
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
              >পরে →</button>
            </div>
          </div>
        </section>

        {/* Section 2 — Products by type */}
        <section aria-labelledby="products-title">
          <h2 id="products-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "12px" }}>
            📋 কোন বীমা আপনার কাজে লাগবে?
          </h2>
          <div className="category-grid" role="group" aria-label="বীমার ধরন" style={{ marginBottom: "16px" }}>
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
                      <p style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: "600", marginBottom: "8px" }}>{prod.provider} · {prod.idra}</p>
                      <p style={{ fontSize: "16px", fontWeight: "800", color: "var(--color-primary)", marginBottom: "4px" }}>{prod.premium}</p>
                      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>✅ কভার করে: {prod.covers}</p>
                      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>📋 দাবি করতে: {prod.claim}</p>
                    </div>
                    <AudioAssist text={prod.audio} size="sm" />
                  </div>
                </div>
              ))}
              <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>তথ্য সর্বশেষ যাচাই: জুলাই ২০২৬। সঠিক প্রিমিয়াম প্রতিষ্ঠান থেকে নিশ্চিত করুন।</p>
            </div>
          )}
        </section>

        {/* Section 3 — Verify company */}
        <section aria-labelledby="verify-title">
          <h2 id="verify-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "4px" }}>
            🔍 এই বীমা কোম্পানি কি বৈধ?
          </h2>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
            কোম্পানির নাম লিখুন — IDRA নিবন্ধিত কিনা দেখুন
          </p>
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="input-field"
                placeholder="কোম্পানির নাম লিখুন"
                value={verifyName}
                onChange={e => { setVerifyName(e.target.value); setVerifyResult(null); }}
                style={{ flex: 1, fontSize: "16px" }}
              />
              <button className="btn btn--primary" onClick={handleVerify} style={{ justifyContent: "center", padding: "0 16px" }}>খুঁজুন</button>
            </div>
            {verifyResult === "registered" && (
              <div style={{ marginTop: "12px", padding: "12px", borderRadius: "8px", background: "var(--color-success-light, #e6f4ea)" }}>
                <p style={{ fontWeight: "700" }}>✅ নিবন্ধিত বলে পাওয়া গেছে</p>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>তবুও বিস্তারিত শর্ত পড়ুন এবং IDRA.gov.bd থেকে নিশ্চিত করুন।</p>
              </div>
            )}
            {verifyResult === "unknown" && (
              <div style={{ marginTop: "12px", padding: "12px", borderRadius: "8px", background: "var(--color-error-light, #fce8e6)" }}>
                <p style={{ fontWeight: "700" }}>⚠️ নাম খুঁজে পাওয়া যায়নি</p>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>IDRA.gov.bd বা ০৯৬৬৬৭৮৬৯৮৬ তে ফোন করে নিশ্চিত করুন।</p>
              </div>
            )}
          </div>
        </section>

        <div className="disclaimer" role="note">
          পণ্যের তথ্য পরিবর্তন হতে পারে। বীমা কেনার আগে সরাসরি প্রতিষ্ঠানের সাথে যোগাযোগ করুন। এটি তথ্য মাত্র, বীমা পরামর্শ নয়।
        </div>
      </div>
    </>
  );
}
