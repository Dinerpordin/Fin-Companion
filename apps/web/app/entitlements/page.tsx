"use client";

import { useState } from "react";
import AudioAssist from "../components/AudioAssist";

// Eligibility rules mapped to programs
const AGE_GROUPS = [
  { key: "child",  icon: "🧒", label: "১৮ বছরের নিচে" },
  { key: "adult",  icon: "👨", label: "১৮–৬৪ বছর"      },
  { key: "senior", icon: "👴", label: "৬৫ বছর বা বেশি" },
];

const PERSON_TYPES = [
  { key: "widow",      icon: "👩‍🦳", label: "বিধবা / স্বামী পরিত্যক্তা" },
  { key: "disabled",   icon: "♿",   label: "প্রতিবন্ধী"         },
  { key: "farmer",     icon: "🌾",   label: "কৃষক"               },
  { key: "single_mom", icon: "👩‍👧",  label: "একা মা"             },
  { key: "elderly",    icon: "👴",   label: "বয়স্ক ব্যক্তি"      },
  { key: "poor",       icon: "🏠",   label: "অতি দরিদ্র পরিবার"  },
  { key: "student",    icon: "🎓",   label: "শিক্ষার্থী"          },
  { key: "other",      icon: "👤",   label: "অন্য"               },
];

const INCOME_BANDS = [
  { key: "zero",   label: "কোনো আয় নেই / ৳৩,০০০ পর্যন্ত" },
  { key: "low",    label: "৳৩,০০১ – ৳৮,০০০"              },
  { key: "medium", label: "৳৮,০০১ এর বেশি"              },
];

type Program = {
  name: string;
  icon: string;
  benefit: string;
  how: string;
  docs: string;
  audio: string;
};

function getPrograms(age: string, type: string, income: string): Program[] {
  const programs: Program[] = [];

  // Old-age allowance
  if (age === "senior" && income !== "medium") {
    programs.push({
      name: "বয়স্ক ভাতা",
      icon: "👴",
      benefit: "মাসে ৳৬০০",
      how: "স্থানীয় ইউনিয়ন পরিষদ বা পৌরসভায় আবেদন করুন",
      docs: "NID, জন্ম নিবন্ধন, ছবি, দরিদ্রতার প্রমাণ",
      audio: "বয়স্ক ভাতা: ৬৫ বছর বা বেশি বয়সী দরিদ্র ব্যক্তিদের জন্য মাসে ৬০০ টাকা। ইউনিয়ন পরিষদে আবেদন করুন।",
    });
  }

  // Widow / deserted women allowance
  if (type === "widow" && income !== "medium") {
    programs.push({
      name: "বিধবা ও স্বামী পরিত্যক্তা ভাতা",
      icon: "👩",
      benefit: "মাসে ৳৫৫০",
      how: "ইউনিয়ন পরিষদ বা সমাজসেবা অফিসে আবেদন",
      docs: "NID, বিবাহ/তালাকের সনদ, ছবি, দরিদ্রতার প্রমাণ",
      audio: "বিধবা ও স্বামী পরিত্যক্তা ভাতা: প্রতি মাসে ৫৫০ টাকা। ইউনিয়ন পরিষদে আবেদন করুন।",
    });
  }

  // Disability allowance
  if (type === "disabled") {
    programs.push({
      name: "প্রতিবন্ধী ভাতা",
      icon: "♿",
      benefit: "মাসে ৳৮৫০",
      how: "উপজেলা সমাজসেবা অফিসে প্রতিবন্ধিতা সনদসহ আবেদন",
      docs: "NID, প্রতিবন্ধিতা সনদ, ডাক্তারি প্রতিবেদন, ছবি",
      audio: "প্রতিবন্ধী ভাতা: প্রতি মাসে ৮৫০ টাকা। উপজেলা সমাজসেবা অফিসে প্রতিবন্ধিতা সনদ নিয়ে আবেদন করুন।",
    });
  }

  // VGD (vulnerable group development)
  if ((type === "widow" || type === "single_mom" || type === "poor") && income === "zero") {
    programs.push({
      name: "ভালনারেবল গ্রুপ ডেভেলপমেন্ট (VGD)",
      icon: "🌾",
      benefit: "মাসে ৩০ কেজি চাল + প্রশিক্ষণ সুবিধা",
      how: "ইউনিয়ন পরিষদ বা পৌরসভায় আবেদন (তালিকা ২ বছর পর পর নবায়ন হয়)",
      docs: "NID, ছবি, পারিবারিক তথ্য",
      audio: "ভিজিডি: অতি দরিদ্র মহিলাদের জন্য মাসে ৩০ কেজি চাল এবং প্রশিক্ষণ। ইউনিয়ন পরিষদে আবেদন করুন।",
    });
  }

  // School stipend
  if (type === "student" && income !== "medium") {
    programs.push({
      name: "প্রাথমিক ও মাধ্যমিক উপবৃত্তি",
      icon: "📚",
      benefit: "মাসিক ৳৩০০–৳৭৫০ (শ্রেণি অনুযায়ী)",
      how: "বিদ্যালয় কর্তৃপক্ষের মাধ্যমে আবেদন",
      docs: "জন্ম নিবন্ধন, অভিভাবকের NID, ব্যাংক হিসাব নম্বর",
      audio: "শিক্ষা উপবৃত্তি: দরিদ্র পরিবারের শিক্ষার্থীদের জন্য মাসে ৩০০ থেকে ৭৫০ টাকা। বিদ্যালয় থেকে আবেদন করুন।",
    });
  }

  // Farmer input assistance
  if (type === "farmer") {
    programs.push({
      name: "কৃষি প্রণোদনা / উপকরণ সহায়তা",
      icon: "🌿",
      benefit: "বীজ, সার, কীটনাশক বিনামূল্যে বা ভর্তুকিতে",
      how: "উপজেলা কৃষি অফিসে কৃষক নিবন্ধন করুন",
      docs: "NID, জমির কাগজ বা বর্গাচাষির প্রমাণ",
      audio: "কৃষি প্রণোদনা: নিবন্ধিত কৃষকদের জন্য বিনামূল্যে বা ভর্তুকিতে বীজ ও সার। উপজেলা কৃষি অফিসে যোগাযোগ করুন।",
    });
  }

  // General poor families
  if ((income === "zero" || income === "low") && programs.length === 0) {
    programs.push({
      name: "সামাজিক নিরাপত্তা তথ্য",
      icon: "🏛️",
      benefit: "আপনার উপজেলায় কী সুবিধা আছে জানুন",
      how: "উপজেলা সমাজসেবা অফিসে যোগাযোগ করুন",
      docs: "NID নিয়ে যান",
      audio: "আপনার উপজেলার সমাজসেবা অফিসে যোগাযোগ করলে স্থানীয় সুবিধা সম্পর্কে জানতে পারবেন।",
    });
  }

  return programs;
}

export default function EntitlementsPage() {
  const [step,    setStep]    = useState(1);
  const [age,     setAge]     = useState("");
  const [type,    setType]    = useState("");
  const [income,  setIncome]  = useState("");
  const [results, setResults] = useState<Program[] | null>(null);

  const runCheck = (incomeKey: string) => {
    setIncome(incomeKey);
    setResults(getPrograms(age, type, incomeKey));
    setStep(4);
  };

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">🏛️ সরকারি সাহায্য</h1>
        <p className="section-subtitle">আপনি কি সরকারি ভাতা বা সহায়তা পাওয়ার যোগ্য?</p>
      </div>

      <div className="p-4">

        {/* Step 1 — Age */}
        {step === 1 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>আপনার বয়স কত?</h2>
              <AudioAssist text="আপনার বয়স কত? নিচের বোতাম থেকে বেছে নিন।" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {AGE_GROUPS.map(a => (
                <button
                  key={a.key}
                  onClick={() => { setAge(a.key); setStep(2); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "16px 18px", borderRadius: "12px", border: "2px solid var(--color-border)",
                    background: "var(--color-surface)", cursor: "pointer",
                    fontSize: "16px", fontWeight: "600", fontFamily: "var(--font-body)",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: "28px" }}>{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Person type */}
        {step === 2 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>আপনি কে?</h2>
              <AudioAssist text="আপনি কে? নিচের বিকল্পগুলো থেকে বেছে নিন।" />
            </div>
            <div className="category-grid" role="group">
              {PERSON_TYPES.map(p => (
                <button
                  key={p.key}
                  className={`category-tile${type === p.key ? " active" : ""}`}
                  aria-pressed={type === p.key}
                  onClick={() => { setType(p.key); setStep(3); }}
                >
                  <span className="category-tile__icon">{p.icon}</span>
                  <span className="category-tile__label">{p.label}</span>
                </button>
              ))}
            </div>
            <button className="btn btn--outline" onClick={() => setStep(1)} style={{ marginTop: "16px", justifyContent: "center" }}>← পেছনে</button>
          </div>
        )}

        {/* Step 3 — Income */}
        {step === 3 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>মাসিক আয় কত?</h2>
              <AudioAssist text="আপনার পরিবারের মাসিক আয় কত?" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {INCOME_BANDS.map(ib => (
                <button
                  key={ib.key}
                  onClick={() => runCheck(ib.key)}
                  style={{
                    padding: "16px 18px", borderRadius: "12px", border: "2px solid var(--color-border)",
                    background: "var(--color-surface)", cursor: "pointer",
                    fontSize: "16px", fontWeight: "600", fontFamily: "var(--font-body)",
                    textAlign: "left",
                  }}
                >
                  {ib.label}
                </button>
              ))}
            </div>
            <button className="btn btn--outline" onClick={() => setStep(2)} style={{ marginTop: "16px", justifyContent: "center" }}>← পেছনে</button>
          </div>
        )}

        {/* Step 4 — Results */}
        {step === 4 && results && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "15px", fontWeight: "700" }}>
              {results.length > 0
                ? `আপনি ${results.length}টি সরকারি সুবিধার জন্য যোগ্য হতে পারেন:`
                : "আপনার দেওয়া তথ্যে কোনো নির্দিষ্ট ভাতার যোগ্যতা পাওয়া যায়নি।"}
            </p>

            {results.map((prog, i) => (
              <div key={i} className="card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>
                      {prog.icon} {prog.name}
                    </p>
                    <p style={{ fontSize: "18px", fontWeight: "800", color: "var(--color-primary)", marginBottom: "8px" }}>
                      {prog.benefit}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                      <strong>কীভাবে পাবেন:</strong> {prog.how}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                      <strong>প্রয়োজনীয় কাগজ:</strong> {prog.docs}
                    </p>
                  </div>
                  <AudioAssist text={prog.audio} size="sm" />
                </div>
              </div>
            ))}

            <div className="privacy-notice" role="note">
              <span className="privacy-notice__icon">ℹ️</span>
              <span>যোগ্যতা নির্ভর করে স্থানীয় বরাদ্দ ও তালিকায় স্থান পাওয়ার উপর। সঠিক তথ্যের জন্য সরাসরি সমাজসেবা অফিসে যোগাযোগ করুন।</span>
            </div>

            <button className="btn btn--outline" style={{ justifyContent: "center" }} onClick={() => { setStep(1); setAge(""); setType(""); setIncome(""); setResults(null); }}>
              🔄 আবার চেক করুন
            </button>

            <div className="disclaimer" role="note">
              এই তথ্য সচেতনতার জন্য — চূড়ান্ত যোগ্যতা সরকারি নিয়ম অনুযায়ী নির্ধারিত হয়।
            </div>
          </div>
        )}
      </div>
    </>
  );
}
