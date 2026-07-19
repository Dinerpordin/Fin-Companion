"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  Flag, 
  Banknote, 
  Clock, 
  CreditCard, 
  FileText, 
  Users, 
  Landmark, 
  Shield, 
  Scale, 
  Calculator,
  Phone,
  Check,
  X
} from "lucide-react";
import AudioAssist from "../components/AudioAssist";

const RED_FLAGS = [
  {
    icon: Banknote,
    title: "অস্বাভাবিক বেশি রিটার্নের প্রতিশ্রুতি",
    body: "মাসে ২০-৩০% বা তার বেশি রিটার্নের কথা বললে এটি প্রায় সবসময় প্রতারণা। বর্তমান ব্যাংক FD রেট মাত্র ৭-৮% বার্ষিক।",
    audio: "মাসে ২০ থেকে ৩০ শতাংশ বা তার বেশি রিটার্নের কথা বললে এটি প্রায় সবসময় প্রতারণা। বর্তমান ব্যাংক রেট মাত্র ৭ থেকে ৮ শতাংশ বার্ষিক।",
  },
  {
    icon: Clock,
    title: "এখনই সিদ্ধান্ত নিতে চাপ দেওয়া",
    body: "যে কেউ বলে 'আজকেই টাকা দিন, আর সুযোগ নেই' — সে প্রতারক হওয়ার সম্ভাবনা বেশি। বৈধ প্রতিষ্ঠান সময় দেয়।",
    audio: "যে কেউ বলে আজকেই টাকা দিন, আর সুযোগ নেই, সে প্রতারক হওয়ার সম্ভাবনা বেশি। বৈধ প্রতিষ্ঠান সময় দেয়।",
  },
  {
    icon: CreditCard,
    title: "আগে ফি বা অ্যাডভান্স চাওয়া",
    body: "'লোন পেতে আগে ৫০০ টাকা প্রসেসিং ফি দিন' — এটি প্রায় সবসময় প্রতারণা। বৈধ ব্যাংক বা MFI আগে টাকা নেয় না।",
    audio: "লোন পেতে আগে ৫০০ টাকা প্রসেসিং ফি দিন। এটি প্রায় সবসময় প্রতারণা। বৈধ ব্যাংক বা এমএফআই আগে টাকা নেয় না।",
  },
  {
    icon: FileText,
    title: "কোনো লিখিত কাগজ বা রেজিস্ট্রেশন নেই",
    body: "বৈধ আর্থিক প্রতিষ্ঠান সবসময় লিখিত চুক্তি দেয় এবং বাংলাদেশ ব্যাংক বা IDRA-তে নিবন্ধিত থাকে।",
    audio: "বৈধ আর্থিক প্রতিষ্ঠান সবসময় লিখিত চুক্তি দেয় এবং বাংলাদেশ ব্যাংক বা আইডিআরএ তে নিবন্ধিত থাকে।",
  },
  {
    icon: Users,
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
  { icon: Landmark, name: "বাংলাদেশ ব্যাংক (DFIM)",      phone: "16236",     note: "আর্থিক প্রতিষ্ঠানের বিরুদ্ধে অভিযোগ" },
  { icon: Search, name: "BFIU হেল্পলাইন",               phone: "02-9530108", note: "মানি লন্ডারিং ও আর্থিক অপরাধ" },
  { icon: Shield, name: "RAB সাইবার ক্রাইম",            phone: "16777",     note: "অনলাইন প্রতারণা" },
  { icon: Scale, name: "ভোক্তা অধিকার পরিদপ্তর",       phone: "16123",     note: "পণ্য ও সেবায় প্রতারণা" },
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
        <h1 className="section-title flex items-center justify-center gap-2">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <span>প্রতারণা থেকে বাঁচুন</span>
        </h1>
        <p className="section-subtitle">স্কিম চেনার উপায়, অভিযোগের নম্বর, এবং নিজেকে রক্ষা করুন</p>
      </div>

      <div className="p-4 flex flex-col gap-6 max-w-2xl mx-auto">

        {/* Section 1 — Red flags */}
        <section aria-labelledby="redflag-title">
          <h2 id="redflag-title" className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-500" />
            <span>প্রতারণা চেনার ৫টি লক্ষণ</span>
          </h2>
          <div className="flex flex-col gap-3">
            {RED_FLAGS.map((rf, i) => {
              const IconComp = rf.icon;
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0 mt-0.5">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-md mb-1">{rf.title}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{rf.body}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <AudioAssist text={rf.audio} size="sm" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2 — Scheme checker */}
        <section aria-labelledby="checker-title">
          <h2 id="checker-title" className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <span>এটা কি বৈধ?</span>
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            প্রতিটি প্রশ্নের উত্তর দিন (শুধু ট্যাপ করুন):
          </p>
          <div className="flex flex-col gap-3">
            {CHECKLIST.map((c, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-800 mb-3">{c.q}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { const a = [...answers]; a[i] = true; setAnswers(a); }}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      answers[i] === true 
                        ? "bg-primary border-primary text-white" 
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                    aria-pressed={answers[i] === true}
                  >
                    <Check className="w-4 h-4" />
                    <span>হ্যাঁ</span>
                  </button>
                  <button
                    onClick={() => { const a = [...answers]; a[i] = false; setAnswers(a); }}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      answers[i] === false 
                        ? "bg-red-600 border-red-600 text-white" 
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                    aria-pressed={answers[i] === false}
                  >
                    <X className="w-4 h-4" />
                    <span>না</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {answered === CHECKLIST.length && (
            <div
              className={`rounded-xl p-4 mt-3 border transition-all ${
                riskLevel === "safe" 
                  ? "bg-green-50 border-green-200 text-green-800" 
                  : riskLevel === "caution" 
                  ? "bg-amber-50 border-amber-200 text-amber-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex justify-between items-center gap-2">
                <p className="text-md font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {riskLevel === "safe" && "তুলনামূলক নিরাপদ মনে হচ্ছে"}
                    {riskLevel === "caution" && "আরও যাচাই করুন"}
                    {riskLevel === "danger" && "সম্ভাব্য প্রতারণা!"}
                  </span>
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
              <p className="text-xs mt-2 opacity-90 leading-relaxed">
                {riskLevel === "safe"
                  ? "তবুও বিনিয়োগের আগে লিখিত চুক্তি নিন এবং পরিবারকে জানান।"
                  : "টাকা দেওয়ার আগে বিশ্বস্ত কাউকে জিজ্ঞেস করুন বা নিচের নম্বরে অভিযোগ করুন।"}
              </p>
            </div>
          )}
        </section>

        {/* Section 3 — Too good to be true calculator */}
        <section aria-labelledby="calc-title">
          <h2 id="calc-title" className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <span>"অনেক বেশি রিটার্ন" ক্যালকুলেটর</span>
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            তারা কত শতাংশ মাসিক রিটার্নের কথা বলছে?
          </p>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex gap-3 items-center mb-4">
              <input
                type="number"
                className="input-field max-w-[120px] text-lg font-bold text-slate-800 border border-slate-200 rounded-lg px-3 py-2 focus:outline-primary"
                placeholder="যেমন: ২০"
                value={returnPct}
                onChange={e => setReturnPct(e.target.value)}
              />
              <span className="text-md font-bold text-slate-700">% প্রতি মাস</span>
            </div>
            {annualPct && vsFD && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-900 flex flex-col gap-2">
                <div>
                  <p className="font-bold text-md mb-1">
                    = বার্ষিক <span className="underline">{annualPct.toFixed(0)}%</span>
                  </p>
                  <p className="text-xs text-red-700 leading-relaxed">
                    এটি ব্যাংক FD রেটের ({fdRate}%) চেয়ে <strong className="text-red-900">{vsFD} গুণ বেশি</strong>।
                    এই পরিমাণ রিটার্ন দেওয়া কোনো বৈধ প্রতিষ্ঠানের পক্ষে সম্ভব নয়।
                  </p>
                </div>
                <div className="self-end mt-1">
                  <AudioAssist
                    size="sm"
                    label="শুনুন"
                    text={`মাসে ${monthlyPct} শতাংশ মানে বার্ষিক ${annualPct?.toFixed(0)} শতাংশ। এটি ব্যাংক রেটের ${vsFD} গুণ বেশি। কোনো বৈধ প্রতিষ্ঠান এত রিটার্ন দিতে পারে না।`}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 4 — Report contacts */}
        <section aria-labelledby="report-title">
          <h2 id="report-title" className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            <span>অভিযোগ করুন</span>
          </h2>
          <div className="flex flex-col gap-3">
            {CONTACTS.map((c, i) => {
              const ContactIcon = c.icon;
              return (
                <a
                  key={i}
                  href={`tel:${c.phone}`}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-decoration-none text-slate-700 group hover:border-primary"
                >
                  <div className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-teal-50 group-hover:text-primary transition-colors">
                    <ContactIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{c.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.note}</p>
                  </div>
                  <div className="flex items-center gap-1 font-extrabold text-sm text-primary bg-teal-50 py-1.5 px-3 rounded-lg border border-teal-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    <span>{c.phone}</span>
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <div className="text-xs text-slate-400 text-center mt-4 border-t border-slate-100 pt-4" role="note">
          এই পাতার তথ্য সচেতনতার জন্য। কোনো আইনি পরামর্শ নয়। সিদ্ধান্ত নেওয়ার আগে বিশ্বস্ত ব্যক্তির পরামর্শ নিন।
        </div>
      </div>
    </>
  );
}
