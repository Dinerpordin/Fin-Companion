"use client";

import { useState } from "react";
import Link from "next/link";
import AudioAssist from "../components/AudioAssist";

const SCENARIOS = [
  { key: "flood",      icon: "🌊", label: "বন্যা / নদী ভাঙন" },
  { key: "health",     icon: "🏥", label: "হাসপাতালে ভর্তি"  },
  { key: "job_loss",   icon: "💼", label: "চাকরি / কাজ হারিয়েছি" },
  { key: "death",      icon: "🕌", label: "পরিবারে মৃত্যু"   },
  { key: "fire",       icon: "🔥", label: "আগুন বা দুর্ঘটনা" },
  { key: "crop_fail",  icon: "🌾", label: "ফসল নষ্ট হয়েছে"  },
];

type Step = { icon: string; text: string; audio: string };
type ScenarioGuide = {
  label: string;
  immediate: Step[];
  govHelp: { name: string; how: string; phone?: string }[];
  avoid: string;
  avoidAudio: string;
};

const GUIDES: Record<string, ScenarioGuide> = {
  flood: {
    label: "বন্যা / নদী ভাঙন",
    immediate: [
      { icon: "🆘", text: "আপনার পরিবারকে নিরাপদ স্থানে নিয়ে যান। জরুরি কাগজপত্র (NID, জমির দলিল) সাথে নিন।", audio: "প্রথমে পরিবারকে নিরাপদ স্থানে নিন এবং গুরুত্বপূর্ণ কাগজপত্র সাথে নিন।" },
      { icon: "📞", text: "ইউনিয়ন পরিষদ বা উপজেলা নির্বাহী অফিসারকে (UNO) জানান — জরুরি ত্রাণের জন্য।", audio: "ইউনিয়ন পরিষদ বা ইউএনও অফিসে জানান যাতে জরুরি ত্রাণ পান।" },
      { icon: "💧", text: "বিশুদ্ধ পানি ও শুকনো খাবার সংগ্রহ করুন। বন্যার পানি পান করবেন না।", audio: "বন্যার পানি পান করবেন না। বিশুদ্ধ পানি ও শুকনো খাবার সংগ্রহ করুন।" },
    ],
    govHelp: [
      { name: "ত্রাণ বরাদ্দ (GR)", how: "ইউনিয়ন পরিষদে নাম নিবন্ধন করুন", phone: "" },
      { name: "BRAC দুর্যোগ সহায়তা", how: "স্থানীয় BRAC অফিসে যোগাযোগ করুন" },
      { name: "MFI জরুরি ঋণ", how: "আপনার বর্তমান MFI-তে জরুরি ঋণ চাইতে পারেন" },
    ],
    avoid: "পানিবন্দী অবস্থায় মহাজনি সুদে ঋণ নেবেন না। অতিরিক্ত সুদ পরিস্থিতি আরও খারাপ করবে।",
    avoidAudio: "বন্যার পরে মহাজনি সুদে ঋণ নেওয়া থেকে বিরত থাকুন। প্রথমে সরকারি ত্রাণ ও এনজিও সহায়তার চেষ্টা করুন।",
  },
  health: {
    label: "হাসপাতালে ভর্তি",
    immediate: [
      { icon: "🏥", text: "সরকারি হাসপাতালে প্রথমে যান — জরুরি চিকিৎসা বিনামূল্যে পাওয়ার কথা।", audio: "সরকারি হাসপাতালে জরুরি চিকিৎসা বিনামূল্যে পাওয়ার কথা। প্রথমে সেখানে যান।" },
      { icon: "📋", text: "সব বিল ও ওষুধের প্রেসক্রিপশন সংরক্ষণ করুন — বীমা বা সহায়তার জন্য দরকার হবে।", audio: "সব বিল ও প্রেসক্রিপশন সংরক্ষণ করুন।" },
      { icon: "📞", text: "পরিচিত বা সমিতির কাছে সাহায্য চাইতে সংকোচ করবেন না।", audio: "পরিচিত বা সমিতির কাছে সাহায্য চাইতে সংকোচ করবেন না।" },
    ],
    govHelp: [
      { name: "সরকারি হাসপাতাল জরুরি সেবা", how: "যেকোনো সরকারি হাসপাতালের জরুরি বিভাগে যান", phone: "999" },
      { name: "স্বাস্থ্য অধিদপ্তর হেল্পলাইন", how: "ফোন করুন", phone: "16167" },
      { name: "সমাজসেবা অফিস", how: "চিকিৎসা সহায়তার আবেদন করুন" },
    ],
    avoid: "চিকিৎসার জন্য জমি বা সম্পদ বিক্রির আগে সরকারি সহায়তা ও NGO সাহায্যের চেষ্টা করুন।",
    avoidAudio: "চিকিৎসার জন্য জমি বিক্রির আগে সরকারি সহায়তা ও এনজিও সাহায্যের চেষ্টা করুন।",
  },
  job_loss: {
    label: "চাকরি / কাজ হারিয়েছি",
    immediate: [
      { icon: "💸", text: "এখনকার খরচ কমান — খাবার, ভাড়া এবং ঋণের কিস্তিকে অগ্রাধিকার দিন।", audio: "এখনই খরচ কমান। খাবার, ভাড়া এবং ঋণের কিস্তিকে অগ্রাধিকার দিন।" },
      { icon: "🤝", text: "MFI-এ জানান — কিছু MFI কর্মহীন সদস্যদের কিস্তি সাময়িক স্থগিত রাখে।", audio: "আপনার এমএফআই কে জানান যে কাজ হারিয়েছেন। কিছু এমএফআই কিস্তি সাময়িক স্থগিত রাখে।" },
      { icon: "🔍", text: "কর্মসংস্থান সংস্থা: বাংলাদেশ কর্মসংস্থান ব্যাংক (ফোন: ০২-৯৩৪৫৩৩৩) — ক্ষুদ্র ঋণ পাওয়া যায়।", audio: "বাংলাদেশ কর্মসংস্থান ব্যাংকে যোগাযোগ করুন। তারা নতুন উদ্যোগ শুরু করতে ক্ষুদ্র ঋণ দেয়।" },
    ],
    govHelp: [
      { name: "বাংলাদেশ কর্মসংস্থান ব্যাংক", how: "ক্ষুদ্র উদ্যোক্তা ঋণ", phone: "02-9345333" },
      { name: "যুব উন্নয়ন অধিদপ্তর", how: "প্রশিক্ষণ ও উদ্যোক্তা সহায়তা" },
    ],
    avoid: "কাজ না থাকলে নতুন ভোগের ঋণ নেবেন না। শুধু প্রয়োজনীয় খরচ চালানোর জন্য ঋণ নিন।",
    avoidAudio: "কাজ না থাকলে নতুন ভোগের ঋণ নেবেন না। প্রথমে সরকারি সহায়তা ও পরিবারের সাহায্য নিন।",
  },
  death: {
    label: "পরিবারে মৃত্যু",
    immediate: [
      { icon: "📋", text: "মৃত্যু সনদ (Death Certificate) ইউনিয়ন পরিষদ থেকে সংগ্রহ করুন — অনেক সুবিধার জন্য এটি লাগবে।", audio: "ইউনিয়ন পরিষদ থেকে মৃত্যু সনদ সংগ্রহ করুন।" },
      { icon: "🏦", text: "মৃত ব্যক্তির ব্যাংক হিসাব বা MFI ঋণ থাকলে — প্রতিষ্ঠানকে জানান।", audio: "মৃত ব্যক্তির ব্যাংক বা এমএফআই ঋণ থাকলে তাদের জানান। কিছু ক্ষেত্রে মাফ বা পুনর্গঠন সম্ভব।" },
      { icon: "📜", text: "উত্তরাধিকার সম্পত্তি ভাগের জন্য রেজিস্টার্ড বণ্টননামা করুন — ঝামেলা এড়াতে।", audio: "সম্পত্তি ভাগের জন্য রেজিস্টার্ড বণ্টননামা করুন। এতে পরে বিরোধ কম হয়।" },
    ],
    govHelp: [
      { name: "বিধবা ভাতা", how: "স্বামী মারা গেলে স্থানীয় সমাজসেবা অফিসে আবেদন করুন" },
      { name: "মৃত্যু সনদ", how: "ইউনিয়ন পরিষদ বা পৌরসভায় সংগ্রহ করুন" },
    ],
    avoid: "শোকের মুহূর্তে বড় আর্থিক সিদ্ধান্ত নেবেন না। সম্পত্তি বিক্রি বা ঋণ নেওয়া এড়িয়ে চলুন।",
    avoidAudio: "শোকের সময় তাড়াহুড়ো করে সম্পত্তি বিক্রি বা বড় ঋণ নেওয়া থেকে বিরত থাকুন।",
  },
  fire: {
    label: "আগুন বা দুর্ঘটনা",
    immediate: [
      { icon: "🚒", text: "ফায়ার সার্ভিস: ১৬১৬৩ বা ৯৯৯। প্রথমে পরিবারের নিরাপত্তা নিশ্চিত করুন।", audio: "আগুনে ফায়ার সার্ভিস ১৬১৬৩ বা জরুরি সেবা ৯৯৯ এ ফোন করুন।" },
      { icon: "📸", text: "যত দ্রুত সম্ভব ক্ষতির ছবি তুলুন — বীমা বা সহায়তার দাবির জন্য প্রমাণ লাগবে।", audio: "ক্ষতির ছবি তুলুন। বীমা বা সরকারি সহায়তার দাবিতে এটি কাজে লাগবে।" },
      { icon: "🏘️", text: "ইউনিয়ন পরিষদে ঘটনা জানান — ত্রাণ পাওয়ার জন্য নিবন্ধন করুন।", audio: "ইউনিয়ন পরিষদে ঘটনা জানান এবং ত্রাণের জন্য নিবন্ধন করুন।" },
    ],
    govHelp: [
      { name: "ফায়ার সার্ভিস", how: "ফোন করুন", phone: "16163" },
      { name: "জেলা ত্রাণ ও পুনর্বাসন অফিস", how: "আগুনে ক্ষতির পরে সহায়তার আবেদন করুন" },
    ],
    avoid: "দুর্ঘটনার পরপরই কোনো চুক্তি বা সম্পত্তি বিক্রিতে স্বাক্ষর করবেন না।",
    avoidAudio: "দুর্ঘটনার পরপরই কোনো চুক্তি বা বিক্রিতে স্বাক্ষর করবেন না।",
  },
  crop_fail: {
    label: "ফসল নষ্ট হয়েছে",
    immediate: [
      { icon: "📋", text: "উপজেলা কৃষি অফিসে ক্ষতির তথ্য জানান — সরকারি প্রণোদনার জন্য নিবন্ধন করুন।", audio: "উপজেলা কৃষি অফিসে ক্ষতির তথ্য জানান এবং প্রণোদনার জন্য নিবন্ধন করুন।" },
      { icon: "🌾", text: "পরবর্তী মৌসুমের জন্য কৃষি ব্যাংক বা ব্র্যাক কৃষি ঋণের আবেদন করুন।", audio: "পরবর্তী মৌসুমের জন্য কৃষি ব্যাংক বা ব্র্যাক থেকে কৃষি ঋণের আবেদন করুন।" },
      { icon: "👥", text: "স্থানীয় কৃষক সমিতির সাথে যোগাযোগ রাখুন — সম্মিলিতভাবে সহায়তা পাওয়া সহজ হয়।", audio: "স্থানীয় কৃষক সমিতির সাথে যোগাযোগ রাখুন।" },
    ],
    govHelp: [
      { name: "কৃষি প্রণোদনা / ক্ষতিপূরণ", how: "উপজেলা কৃষি অফিসে আবেদন করুন" },
      { name: "বাংলাদেশ কৃষি ব্যাংক", how: "কৃষি ঋণের আবেদন", phone: "16150" },
    ],
    avoid: "ফসল নষ্ট হলে ক্ষুব্ধ হয়ে জমি বিক্রি করবেন না। সরকারি ক্ষতিপূরণের আবেদন আগে করুন।",
    avoidAudio: "ফসল নষ্টে হতাশ হয়ে জমি বিক্রি করবেন না। আগে সরকারি ক্ষতিপূরণের আবেদন করুন।",
  },
};

export default function EmergencyPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const guide = selected ? GUIDES[selected] : null;

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">🆘 জরুরি আর্থিক গাইড</h1>
        <p className="section-subtitle">বিপদের সময় কী করবেন — সহজ ধাপে ধাপে</p>
      </div>

      <div className="p-4">
        {/* Scenario selector */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: "700" }}>কী হয়েছে?</h2>
            <AudioAssist text="কী হয়েছে? নিচের বিকল্পগুলো থেকে বেছে নিন।" />
          </div>
          <div className="category-grid" role="group" aria-label="জরুরি পরিস্থিতি">
            {SCENARIOS.map(s => (
              <button
                key={s.key}
                className={`category-tile${selected === s.key ? " active" : ""}`}
                aria-pressed={selected === s.key}
                onClick={() => setSelected(s.key)}
              >
                <span className="category-tile__icon">{s.icon}</span>
                <span className="category-tile__label">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Guide content */}
        {guide && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700" }}>{guide.label} — এখন কী করবেন</h2>

            {/* Immediate steps */}
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "10px" }}>⚡ তাৎক্ষণিক করণীয়</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {guide.immediate.map((step, i) => (
                  <div key={i} className="card" style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", lineHeight: 1.6 }}>
                          <span style={{ marginRight: "6px" }}>{step.icon}</span>
                          {step.text}
                        </p>
                      </div>
                      <AudioAssist text={step.audio} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gov help */}
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "10px" }}>🏛️ সরকারি / NGO সহায়তা</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {guide.govHelp.map((h, i) => (
                  <div key={i} className="card" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "14px" }}>{h.name}</p>
                      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{h.how}</p>
                    </div>
                    {h.phone && (
                      <a
                        href={`tel:${h.phone}`}
                        style={{ fontSize: "16px", fontWeight: "800", color: "var(--color-primary)", textDecoration: "none" }}
                      >
                        {h.phone} 📲
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* What to avoid */}
            <div className="card" style={{ padding: "14px 16px", borderLeft: "4px solid var(--color-danger, #dc2626)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "700", marginBottom: "4px" }}>🚫 এড়িয়ে চলুন</p>
                  <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{guide.avoid}</p>
                </div>
                <AudioAssist text={guide.avoidAudio} size="sm" />
              </div>
            </div>

            {/* Quick links */}
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/locator" className="btn btn--outline" style={{ flex: 1, justifyContent: "center", fontSize: "13px" }}>
                📍 কাছের সহায়তা
              </Link>
              <Link href="/protect" className="btn btn--outline" style={{ flex: 1, justifyContent: "center", fontSize: "13px" }}>
                🛡️ প্রতারণা এড়ান
              </Link>
            </div>
          </div>
        )}

        <div className="disclaimer" style={{ marginTop: "24px" }} role="note">
          এই গাইড সচেতনতার জন্য। জরুরি পরিস্থিতিতে স্থানীয় কর্তৃপক্ষ ও পরিচিতজনের সাহায্য নিন।
        </div>
      </div>
    </>
  );
}
