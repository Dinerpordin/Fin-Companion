"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Heart, 
  Coins, 
  Moon, 
  Building2, 
  Compass, 
  GraduationCap, 
  Box, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CalendarRange, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Search
} from "lucide-react";
import AudioAssist from "../components/AudioAssist";

const EVENT_TYPES = [
  { key: "wedding",   icon: Heart, label: "বিয়ে",           hint: "মোট অনুষ্ঠানের খরচ" },
  { key: "dowry",     icon: Coins, label: "যৌতুক / উপহার",  hint: "বরপক্ষের দাবি বা পরিবারের উপহার" },
  { key: "eid",       icon: Moon, label: "ঈদ উৎসব",        hint: "কেনাকাটা, খাবার, সেলামি" },
  { key: "funeral",   icon: Building2, label: "জানাজা / কুলখানি",hint: "হঠাৎ খরচ" },
  { key: "hajj",      icon: Compass, label: "হজ্জ / ওমরা",     hint: "যাত্রার মোট খরচ" },
  { key: "education", icon: GraduationCap, label: "পড়াশোনার খরচ",   hint: "ভর্তি, বেতন, বই" },
  { key: "other",     icon: Box, label: "অন্য উপলক্ষ",     hint: "নিজে লিখুন" },
];

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
  const borrowCost   = gap ? Math.round(gap * (1 + INFORMAL_RATE)) : null;

  const suggestions  = eventType ? (EVENT_SUGGESTIONS[eventType] ?? EVENT_SUGGESTIONS.other) : [];
  const eventLabel   = EVENT_TYPES.find(e => e.key === eventType)?.label ?? "";

  const resultText = monthlySave
    ? `আপনার ${eventLabel} এর জন্য প্রয়োজন ${formatBDT(gap!)}। প্রতি মাসে ${formatBDT(monthlySave)} সঞ্চয় করলে ${finalMonths} মাসে পৌঁছাবেন।`
    : "";

  return (
    <>
      <div className="section-header">
        <h1 className="section-title flex items-center justify-center gap-2">
          <CalendarRange className="w-8 h-8 text-primary" />
          <span>উৎসব পরিকল্পনা</span>
        </h1>
        <p className="section-subtitle">বিয়ে, ঈদ বা যেকোনো উপলক্ষের খরচ পরিকল্পনা করুন</p>
      </div>

      <div className="p-4 max-w-xl mx-auto flex flex-col gap-4">
        {/* Step 1 — Event type */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">কী উপলক্ষে?</h2>
              <AudioAssist text="কোন উপলক্ষের জন্য পরিকল্পনা করছেন? বেছে নিন।" />
            </div>
            <div className="grid grid-cols-2 gap-3" role="group" aria-label="উপলক্ষ বেছে নিন">
              {EVENT_TYPES.map(e => {
                const EventIcon = e.icon;
                return (
                  <button
                    key={e.key}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-decoration-none transition-all cursor-pointer ${
                      eventType === e.key 
                        ? "bg-teal-50 border-primary text-primary" 
                        : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                    }`}
                    aria-pressed={eventType === e.key}
                    onClick={() => { setEventType(e.key); setCost(null); setStep(2); }}
                  >
                    <EventIcon className={`w-7 h-7 ${eventType === e.key ? "text-primary" : "text-slate-500"}`} />
                    <span className="text-sm font-semibold leading-normal">{e.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2 — Cost estimate */}
        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-800">আনুমানিক কত খরচ হবে?</h2>
              <AudioAssist text="এই উপলক্ষে আনুমানিক কত টাকা খরচ হবে বলে মনে করেন?" />
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {EVENT_TYPES.find(e => e.key === eventType)?.hint}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4" role="group" aria-label="খরচ বেছে নিন">
              {suggestions.map(s => (
                <button
                  key={s}
                  className={`py-2.5 px-2 rounded-lg border font-semibold text-xs transition-all cursor-pointer ${
                    cost === s 
                      ? "bg-primary border-primary text-white" 
                      : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                  }`}
                  aria-pressed={cost === s}
                  onClick={() => { setCost(s); setCustomCost(""); }}
                >
                  {formatBDT(s)}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field w-full text-lg border border-slate-200 rounded-lg px-3 py-2 focus:outline-primary mb-4"
              placeholder="নিজে লিখুন (টাকায়)"
              value={customCost}
              onChange={e => { setCustomCost(e.target.value); setCost(null); }}
            />
            <div className="flex gap-3">
              <button 
                className="flex-1 py-2 px-4 rounded-lg border-2 border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-slate-50" 
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>পেছনে</span>
              </button>
              <button
                className="flex-[2] py-2 px-4 rounded-lg bg-primary border-2 border-primary text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => (finalCost ? setStep(3) : null)}
                disabled={!finalCost}
              >
                <span>পরের ধাপ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Current savings */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">এখন কত টাকা আছে?</h2>
              <AudioAssist text="এই কাজের জন্য এখন আপনার কাছে কত টাকা আছে?" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4" role="group">
              {[0, 5000, 10000, 20000, 50000].map(s => (
                <button
                  key={s}
                  className={`py-2.5 px-2 rounded-lg border font-semibold text-xs transition-all cursor-pointer ${
                    savings === s 
                      ? "bg-primary border-primary text-white" 
                      : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                  }`}
                  aria-pressed={savings === s}
                  onClick={() => setSavings(s)}
                >
                  {s === 0 ? "কিছু নেই" : formatBDT(s)}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field w-full text-lg border border-slate-200 rounded-lg px-3 py-2 focus:outline-primary mb-4"
              placeholder="নিজে লিখুন"
              onChange={e => setSavings(parseFloat(e.target.value) || 0)}
            />
            <div className="flex gap-3">
              <button 
                className="flex-1 py-2 px-4 rounded-lg border-2 border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-slate-50" 
                onClick={() => setStep(2)}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>পেছনে</span>
              </button>
              <button 
                className="flex-[2] py-2 px-4 rounded-lg bg-primary border-2 border-primary text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer" 
                onClick={() => setStep(4)}
              >
                <span>পরের ধাপ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Timeline */}
        {step === 4 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">কত মাস বাকি আছে?</h2>
              <AudioAssist text="এই উপলক্ষ আসতে আর কত মাস বাকি?" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4" role="group">
              {MONTH_PRESETS.map(m => (
                <button
                  key={m}
                  className={`py-2.5 px-2 rounded-lg border font-semibold text-xs transition-all cursor-pointer ${
                    months === m 
                      ? "bg-primary border-primary text-white" 
                      : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                  }`}
                  aria-pressed={months === m}
                  onClick={() => { setMonths(m); setCustomMo(""); }}
                >
                  {m} মাস
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field w-full text-lg border border-slate-200 rounded-lg px-3 py-2 focus:outline-primary mb-4"
              placeholder="নিজে লিখুন (মাস)"
              value={customMo}
              onChange={e => { setCustomMo(e.target.value); setMonths(null); }}
            />
            <div className="flex gap-3">
              <button 
                className="flex-1 py-2 px-4 rounded-lg border-2 border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-slate-50" 
                onClick={() => setStep(3)}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>পেছনে</span>
              </button>
              <button
                className="flex-[2] py-2 px-4 rounded-lg bg-primary border-2 border-primary text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => (finalMonths ? setStep(5) : null)}
                disabled={!finalMonths}
              >
                <span>ফলাফল দেখুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5 — Result */}
        {step === 5 && finalCost && finalMonths && (
          <div className="flex flex-col gap-4">
            {/* Hero */}
            <div className="bg-primary text-white rounded-xl p-5 shadow-sm">
              <p className="text-xs opacity-80 mb-1">{eventLabel} পরিকল্পনা</p>
              <p className="text-3xl font-extrabold mb-1">{formatBDT(finalCost)}</p>
              <p className="text-sm opacity-90">{finalMonths} মাসের মধ্যে</p>
            </div>

            {/* Gap */}
            {gap !== null && gap > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">আরও কত টাকা লাগবে</p>
                    <p className="text-2xl font-extrabold text-red-600">{formatBDT(gap)}</p>
                    {monthlySave && (
                      <p className="text-sm mt-3 font-semibold text-primary">
                        → প্রতি মাসে {formatBDT(monthlySave)} জমান
                      </p>
                    )}
                    {dailySave && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        (প্রতিদিন মাত্র {formatBDT(dailySave)})
                      </p>
                    )}
                  </div>
                  <AudioAssist text={resultText} label="শুনুন" />
                </div>
              </div>
            )}

            {gap === 0 && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-xs">
                <p className="font-bold text-sm flex items-center gap-1.5 text-primary">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>আপনার কাছে যথেষ্ট আছে!</span>
                </p>
                <p className="mt-1 opacity-90">এখনকার সঞ্চয় দিয়েই এই উপলক্ষ সামলানো সম্ভব।</p>
              </div>
            )}

            {/* Borrowing cost warning */}
            {gap && gap > 0 && borrowCost && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 border-l-4 border-l-amber-500 text-xs">
                <p className="font-bold text-sm text-slate-800 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>ঋণ নিলে কত পড়বে?</span>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {formatBDT(gap)} ধার করলে আনুমানিক মোট ফেরত দিতে হতে পারে <strong className="text-slate-800">{formatBDT(borrowCost)}</strong> (অনানুষ্ঠানিক হারে ~১৫%)।
                </p>
                <Link 
                  href="/check-loan" 
                  className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 font-semibold text-[11px] mt-2.5 inline-flex items-center gap-1 text-decoration-none hover:bg-slate-50"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>ঋণের প্রকৃত খরচ পরীক্ষা করুন</span>
                </Link>
              </div>
            )}

            <button 
              className="py-2.5 px-4 rounded-lg font-bold text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer" 
              onClick={() => { setStep(1); setEventType(""); setCost(null); setSavings(0); setMonths(null); setCustomCost(""); setCustomMo(""); }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>নতুন পরিকল্পনা করুন</span>
            </button>

            <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4 mt-4" role="note">
              সকল হিসাব আনুমানিক। ঋণের হার প্রতিষ্ঠান ও শর্ত অনুযায়ী ভিন্ন হয়। এটি তথ্য মাত্র, আর্থিক পরামর্শ নয়।
            </div>
          </div>
        )}
      </div>
    </>
  );
}
