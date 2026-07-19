"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  HeartPulse, 
  Heart, 
  GraduationCap, 
  Compass, 
  Store, 
  Target, 
  Lightbulb, 
  BarChart3, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import AudioAssist from "../components/AudioAssist";

const GOAL_TYPES = [
  { key: "emergency",  icon: HeartPulse, label: "জরুরি তহবিল"   },
  { key: "wedding",    icon: Heart, label: "বিয়ে"           },
  { key: "education",  icon: GraduationCap, label: "পড়াশোনা"        },
  { key: "hajj",       icon: Compass, label: "হজ্জ / ওমরা"    },
  { key: "business",   icon: Store, label: "ব্যবসা শুরু"     },
  { key: "other",      icon: Target, label: "অন্য লক্ষ্য"    },
];

const AMOUNT_PRESETS = [5000, 10000, 20000, 50000, 100000, 200000];
const MONTH_PRESETS  = [3, 6, 12, 18, 24, 36];

function formatBDT(n: number) {
  if (n >= 100000) return `৳${(n / 100000).toFixed(1)} লক্ষ`;
  if (n >= 1000)   return `৳${n.toLocaleString("bn-BD")}`;
  return `৳${n}`;
}

export default function SavingsPage() {
  const [step, setStep] = useState(1);
  const [goalType, setGoalType]   = useState("");
  const [targetAmt, setTargetAmt] = useState<number | null>(null);
  const [months, setMonths]       = useState<number | null>(null);
  const [customAmt, setCustomAmt] = useState("");
  const [customMo,  setCustomMo]  = useState("");

  const finalAmt    = targetAmt ?? (customAmt ? parseFloat(customAmt) : null);
  const finalMonths = months   ?? (customMo  ? parseInt(customMo, 10)  : null);

  const dailySaving   = finalAmt && finalMonths ? Math.ceil(finalAmt / (finalMonths * 30)) : null;
  const monthlySaving = finalAmt && finalMonths ? Math.ceil(finalAmt / finalMonths)        : null;

  const resultText = dailySaving && monthlySaving
    ? `প্রতিদিন ${formatBDT(dailySaving)} সাশ্রয় করলে ${finalMonths} মাসে আপনার লক্ষ্যে পৌঁছাবেন। অথবা প্রতি মাসে ${formatBDT(monthlySaving)} জমান।`
    : "";

  return (
    <>
      <div className="section-header">
        <h1 className="section-title flex items-center justify-center gap-2">
          <Target className="w-8 h-8 text-primary" />
          <span>সঞ্চয় পরিকল্পনা</span>
        </h1>
        <p className="section-subtitle">ধাপে ধাপে আপনার লক্ষ্য ঠিক করুন — সম্পূর্ণ গোপনীয়</p>
      </div>

      <div className="p-4 max-w-xl mx-auto flex flex-col gap-4">
        {/* Step 1 — Goal type */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">কীসের জন্য সঞ্চয় করবেন?</h2>
              <AudioAssist text="কীসের জন্য সঞ্চয় করবেন? নিচ থেকে বেছে নিন।" />
            </div>
            <div className="grid grid-cols-2 gap-3" role="group" aria-label="লক্ষ্য বেছে নিন">
              {GOAL_TYPES.map(g => {
                const GoalIcon = g.icon;
                return (
                  <button
                    key={g.key}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border text-decoration-none transition-all cursor-pointer ${
                      goalType === g.key 
                        ? "bg-teal-50 border-primary text-primary" 
                        : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                    }`}
                    aria-pressed={goalType === g.key}
                    onClick={() => { setGoalType(g.key); setStep(2); }}
                  >
                    <GoalIcon className={`w-8 h-8 ${goalType === g.key ? "text-primary" : "text-slate-500"}`} />
                    <span className="text-sm font-semibold leading-normal">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2 — Target amount */}
        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">কত টাকা লাগবে?</h2>
              <AudioAssist text="কত টাকা লাগবে? নিচের বোতাম থেকে বেছে নিন অথবা নিজে লিখুন।" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4" role="group" aria-label="পরিমাণ বেছে নিন">
              {AMOUNT_PRESETS.map(a => (
                <button
                  key={a}
                  className={`py-2.5 px-3 rounded-lg border font-semibold text-sm transition-all cursor-pointer ${
                    targetAmt === a 
                      ? "bg-primary border-primary text-white" 
                      : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                  }`}
                  aria-pressed={targetAmt === a}
                  onClick={() => { setTargetAmt(a); setCustomAmt(""); }}
                >
                  {formatBDT(a)}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field w-full text-lg border border-slate-200 rounded-lg px-3 py-2 focus:outline-primary mb-4"
              placeholder="নিজে লিখুন (যেমন: ৩০০০০)"
              value={customAmt}
              onChange={e => { setCustomAmt(e.target.value); setTargetAmt(null); }}
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
                onClick={() => (finalAmt ? setStep(3) : null)}
                disabled={!finalAmt}
              >
                <span>পরের ধাপ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Timeline */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">কত মাসের মধ্যে?</h2>
              <AudioAssist text="কত মাসের মধ্যে এই টাকা জমাতে চান? বেছে নিন।" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4" role="group" aria-label="সময় বেছে নিন">
              {MONTH_PRESETS.map(m => (
                <button
                  key={m}
                  className={`py-2.5 px-3 rounded-lg border font-semibold text-sm transition-all cursor-pointer ${
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
              placeholder="নিজে লিখুন (মাসের সংখ্যা)"
              value={customMo}
              onChange={e => { setCustomMo(e.target.value); setMonths(null); }}
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
                className="flex-[2] py-2 px-4 rounded-lg bg-primary border-2 border-primary text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => (finalMonths ? setStep(4) : null)}
                disabled={!finalMonths}
              >
                <span>ফলাফল দেখুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Result */}
        {step === 4 && finalAmt && finalMonths && dailySaving && monthlySaving && (
          <div className="flex flex-col gap-4">
            {/* Hero result card */}
            <div className="bg-primary text-white rounded-xl p-5 shadow-sm">
              <p className="text-xs opacity-80 mb-1">আপনার সঞ্চয় লক্ষ্য</p>
              <p className="text-3xl font-extrabold mb-1">{formatBDT(finalAmt)}</p>
              <p className="text-sm opacity-90">{finalMonths} মাসের মধ্যে</p>
            </div>

            {/* Daily saving */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">প্রতিদিন জমান</p>
                  <p className="text-2xl font-extrabold text-primary">{formatBDT(dailySaving)}</p>
                  <p className="text-xs text-slate-500 mt-1">= মাসে {formatBDT(monthlySaving)}</p>
                </div>
                <AudioAssist text={resultText} label="শুনুন" />
              </div>
            </div>

            {/* Info tip */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center gap-2" role="note">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>এই হিসাব আপনার ডিভাইসেই হয়েছে। কোনো তথ্য কোথাও যায়নি।</span>
            </div>

            {/* CTAs */}
            <Link 
              href={`/compare?type=dps&min=${finalAmt}`} 
              className="py-2.5 px-4 rounded-lg border-2 border-primary text-primary font-bold text-sm flex items-center justify-center gap-1.5 transition-all text-decoration-none hover:bg-teal-50/50"
            >
              <BarChart3 className="w-4 h-4" />
              <span>DPS পণ্য তুলনা করুন</span>
            </Link>
            <button 
              className="py-2.5 px-4 rounded-lg font-bold text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer" 
              onClick={() => { setStep(1); setGoalType(""); setTargetAmt(null); setMonths(null); setCustomAmt(""); setCustomMo(""); }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>নতুন পরিকল্পনা করুন</span>
            </button>

            <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4" role="note">
              এই হিসাব আনুমানিক। মুদ্রাস্ফীতি বা সুদ ছাড়াই সরল হিসাব। এটি তথ্য মাত্র, আর্থিক পরামর্শ নয়।
            </div>
          </div>
        )}
      </div>
    </>
  );
}
