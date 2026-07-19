"use client";

import { useState } from "react";
import { 
  HeartPulse, 
  Heart, 
  Leaf, 
  Home, 
  Coins, 
  CheckCircle2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertTriangle,
  BookOpen,
  FileCheck2,
  FileText
} from "lucide-react";
import AudioAssist from "../components/AudioAssist";

const INSURANCE_TYPES = [
  { key: "health",    icon: HeartPulse, label: "স্বাস্থ্য বীমা"  },
  { key: "life",      icon: Heart, label: "জীবন বীমা"     },
  { key: "crop",      icon: Leaf, label: "ফসল বীমা"      },
  { key: "property",  icon: Home, label: "সম্পদ বীমা"    },
];

const EXPLAINER_SLIDES = [
  { icon: Coins, title: "আপনি প্রতি মাসে ছোট একটি টাকা জমান", body: "বীমা কোম্পানিকে দেন — একে প্রিমিয়াম বলে।", audio: "বীমায় আপনি প্রতি মাসে ছোট একটি টাকা দেন। একে প্রিমিয়াম বলে।" },
  { icon: HeartPulse, title: "হঠাৎ বিপদ হলে (অসুস্থতা, মৃত্যু, আগুন)", body: "বীমা কোম্পানি একটি বড় টাকা দেয় — যাতে আপনাকে জমি বিক্রি করতে না হয়।", audio: "বিপদ হলে বীমা কোম্পানি একটি বড় টাকা দেয়। যাতে আপনাকে সম্পদ বিক্রি করতে না হয়।" },
  { icon: CheckCircle2, title: "বীমা কী নয়?", body: "বীমা লাভজনক বিনিয়োগ নয়। এটি ঝুঁকি থেকে সুরক্ষা মাত্র।", audio: "বীমা বিনিয়োগ নয়। এটি বিপদের সময় সুরক্ষা দেয়।" },
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

  const REGISTERED = ["delta life", "green delta", "national life", "pragati life", "rupali", "sadharan bima", "sbc", "popular life", "meghna life", "allianz", "sunlife", "bsrs"];

  const handleVerify = () => {
    const lower = verifyName.toLowerCase().trim();
    const found = REGISTERED.some(r => lower.includes(r) || r.includes(lower));
    setVerifyResult(found ? "registered" : "unknown");
  };

  const SlideIcon = EXPLAINER_SLIDES[slide].icon;

  return (
    <>
      <div className="section-header">
        <h1 className="section-title flex items-center justify-center gap-2">
          <Heart className="w-8 h-8 text-primary" />
          <span>বীমা সচেতনতা</span>
        </h1>
        <p className="section-subtitle">বীমা বুঝুন, সঠিক পণ্য বেছে নিন, প্রতারণা এড়ান</p>
      </div>

      <div className="p-4 max-w-xl mx-auto flex flex-col gap-6">

        {/* Section 1 — What is insurance */}
        <section aria-labelledby="explainer-title">
          <h2 id="explainer-title" className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>বীমা কী? (সহজ ভাষায়)</span>
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-50 text-primary rounded-xl">
                <SlideIcon className="w-8 h-8" />
              </div>
              <AudioAssist text={EXPLAINER_SLIDES[slide].audio} label="শুনুন" />
            </div>
            <p className="text-md font-bold text-slate-800 mb-2">{EXPLAINER_SLIDES[slide].title}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{EXPLAINER_SLIDES[slide].body}</p>
            <div className="flex gap-3 mt-5 items-center">
              <button
                onClick={() => setSlide(Math.max(0, slide - 1))}
                disabled={slide === 0}
                className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>আগে</span>
              </button>
              <div className="flex-1 flex justify-center items-center gap-1.5">
                {EXPLAINER_SLIDES.map((_, i) => (
                  <span key={i} className={`w-2 h-2 rounded-full transition-colors ${i === slide ? "bg-primary" : "bg-slate-200"}`} />
                ))}
              </div>
              <button
                onClick={() => setSlide(Math.min(EXPLAINER_SLIDES.length - 1, slide + 1))}
                disabled={slide === EXPLAINER_SLIDES.length - 1}
                className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <span>পরে</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Section 2 — Products by type */}
        <section aria-labelledby="products-title">
          <h2 id="products-title" className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-primary" />
            <span>কোন বীমা আপনার কাজে লাগবে?</span>
          </h2>
          <div className="grid grid-cols-2 gap-2 mb-4" role="group" aria-label="বীমার ধরন">
            {INSURANCE_TYPES.map(t => {
              const TypeIcon = t.icon;
              const isActive = activeType === t.key;
              return (
                <button
                  key={t.key}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border font-semibold text-sm transition-all cursor-pointer ${
                    isActive 
                      ? "bg-teal-50 border-primary text-primary" 
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                  aria-pressed={isActive}
                  onClick={() => setActiveType(isActive ? "" : t.key)}
                >
                  <TypeIcon className={`w-6 h-6 ${isActive ? "text-primary" : "text-slate-500"}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {activeType && PRODUCTS[activeType] && (
            <div className="flex flex-col gap-3">
              {PRODUCTS[activeType].map((prod, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-sm mb-1">{prod.name}</p>
                      <p className="text-[11px] text-primary font-bold mb-3">{prod.provider} · {prod.idra}</p>
                      <p className="text-lg font-extrabold text-primary mb-2">{prod.premium}</p>
                      <p className="text-xs text-slate-600 mb-1 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <span>কভার করে: {prod.covers}</span>
                      </p>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>দাবি করতে: {prod.claim}</span>
                      </p>
                    </div>
                    <AudioAssist text={prod.audio} size="sm" />
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-slate-400">তথ্য সর্বশেষ যাচাই: জুলাই ২০২৬। সঠিক প্রিমিয়াম প্রতিষ্ঠান থেকে নিশ্চিত করুন।</p>
            </div>
          )}
        </section>

        {/* Section 3 — Verify company */}
        <section aria-labelledby="verify-title">
          <h2 id="verify-title" className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <span>এই বীমা কোম্পানি কি বৈধ?</span>
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            কোম্পানির নাম লিখুন — IDRA নিবন্ধিত কিনা দেখুন
          </p>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-primary"
                placeholder="কোম্পানির নাম লিখুন"
                value={verifyName}
                onChange={e => { setVerifyName(e.target.value); setVerifyResult(null); }}
              />
              <button 
                className="py-2 px-4 rounded-lg bg-primary text-white font-bold text-sm cursor-pointer hover:bg-primary-dark transition-all" 
                onClick={handleVerify}
              >
                খুঁজুন
              </button>
            </div>
            {verifyResult === "registered" && (
              <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs">
                <p className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>নিবন্ধিত বলে পাওয়া গেছে</span>
                </p>
                <p className="mt-1 opacity-90">তবুও বিস্তারিত শর্ত পড়ুন এবং IDRA.gov.bd থেকে নিশ্চিত করুন।</p>
              </div>
            )}
            {verifyResult === "unknown" && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>নাম খুঁজে পাওয়া যায়নি</span>
                </p>
                <p className="mt-1 opacity-90">IDRA.gov.bd বা ০৯৬৬৬৭৮৬৯৮৬ তে ফোন করে নিশ্চিত করুন।</p>
              </div>
            )}
          </div>
        </section>

        <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4 mt-4" role="note">
          পণ্যের তথ্য পরিবর্তন হতে পারে। বীমা কেনার আগে সরাসরি প্রতিষ্ঠানের সাথে যোগাযোগ করুন। এটি তথ্য মাত্র, বীমা পরামর্শ নয়।
        </div>
      </div>
    </>
  );
}
