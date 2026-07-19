"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Waves, 
  HeartPulse, 
  Briefcase, 
  Building2, 
  Flame, 
  Leaf, 
  AlertTriangle, 
  Phone, 
  Droplets, 
  FileText, 
  Handshake, 
  Search, 
  Camera, 
  Users, 
  AlertCircle,
  MapPin,
  ShieldCheck,
  Check,
  ChevronRight,
  Coins
} from "lucide-react";
import AudioAssist from "../components/AudioAssist";

const SCENARIOS = [
  { key: "flood",      icon: Waves, label: "বন্যা / নদী ভাঙন" },
  { key: "health",     icon: HeartPulse, label: "হাসপাতালে ভর্তি"  },
  { key: "job_loss",   icon: Briefcase, label: "চাকরি / কাজ হারিয়েছি" },
  { key: "death",      icon: Building2, label: "পরিবারে মৃত্যু"   },
  { key: "fire",       icon: Flame, label: "আগুন বা দুর্ঘটনা" },
  { key: "crop_fail",  icon: Leaf, label: "ফসল নষ্ট হয়েছে"  },
];

type Step = { icon: any; text: string; audio: string };
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
      { icon: AlertTriangle, text: "আপনার পরিবারকে নিরাপদ স্থানে নিয়ে যান। জরুরি কাগজপত্র (NID, জমির দলিল) সাথে নিন।", audio: "প্রথমে পরিবারকে নিরাপদ স্থানে নিন এবং গুরুত্বপূর্ণ কাগজপত্র সাথে নিন।" },
      { icon: Phone, text: "ইউনিয়ন পরিষদ বা উপজেলা নির্বাহী অফিসারকে (UNO) জানান — জরুরি ত্রাণের জন্য।", audio: "ইউনিয়ন পরিষদ বা ইউএনও অফিসে জানান যাতে জরুরি ত্রাণ পান।" },
      { icon: Droplets, text: "বিশুদ্ধ পানি ও শুকনো খাবার সংগ্রহ করুন। বন্যার পানি পান করবেন না।", audio: "বন্যার পানি পান করবেন না। বিশুদ্ধ পানি ও শুকনো খাবার সংগ্রহ করুন।" },
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
      { icon: HeartPulse, text: "সরকারি হাসপাতালে প্রথমে যান — জরুরি চিকিৎসা বিনামূল্যে পাওয়ার কথা।", audio: "সরকারি হাসপাতালে জরুরি চিকিৎসা বিনামূল্যে পাওয়ার কথা। প্রথমে সেখানে যান।" },
      { icon: FileText, text: "সব বিল ও ওষুধের প্রেসক্রিপশন সংরক্ষণ করুন — বীমা বা সহায়তার জন্য দরকার হবে।", audio: "সব বিল ও প্রেসক্রিপশন সংরক্ষণ করুন।" },
      { icon: Phone, text: "পরিচিত বা সমিতির কাছে সাহায্য চাইতে সংকোচ করবেন না।", audio: "পরিচিত বা সমিতির কাছে সাহায্য চাইতে সংকোচ করবেন না।" },
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
      { icon: Coins, text: "এখনকার খরচ কমান — খাবার, ভাড়া এবং ঋণের কিস্তিকে অগ্রাধিকার দিন।", audio: "এখনই খরচ কমান। খাবার, ভাড়া এবং ঋণের কিস্তিকে অগ্রাধিকার দিন।" },
      { icon: Handshake, text: "MFI-এ জানান — কিছু MFI কর্মহীন সদস্যদের কিস্তি সাময়িক স্থগিত রাখে।", audio: "আপনার এমএফআই কে জানান যে কাজ হারিয়েছেন। কিছু এমএফআই কিস্তি সাময়িক স্থগিত রাখে।" },
      { icon: Search, text: "কর্মসংস্থান সংস্থা: বাংলাদেশ কর্মসংস্থান ব্যাংক (ফোন: ০২-৯৩৪৫৩৩৩) — ক্ষুদ্র ঋণ পাওয়া যায়।", audio: "বাংলাদেশ কর্মসংস্থান ব্যাংকে যোগাযোগ করুন। তারা নতুন উদ্যোগ শুরু করতে ক্ষুদ্র ঋণ দেয়।" },
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
      { icon: FileText, text: "মৃত্যু সনদ (Death Certificate) ইউনিয়ন পরিষদ থেকে সংগ্রহ করুন — অনেক সুবিধার জন্য এটি লাগবে।", audio: "ইউনিয়ন পরিষদ থেকে মৃত্যু সনদ সংগ্রহ করুন।" },
      { icon: Building2, text: "মৃত ব্যক্তির ব্যাংক হিসাব বা MFI ঋণ থাকলে — প্রতিষ্ঠানকে জানান।", audio: "মৃত ব্যক্তির ব্যাংক বা এমএফআই ঋণ থাকলে তাদের জানান। কিছু ক্ষেত্রে মাফ বা পুনর্গঠন সম্ভব।" },
      { icon: FileText, text: "উত্তরাধিকার সম্পত্তি ভাগের জন্য রেজিস্টার্ড বণ্টননামা করুন — ঝামেলা এড়াতে।", audio: "সম্পত্তি ভাগের জন্য রেজিস্টার্ড বণ্টননামা করুন। এতে পরে বিরোধ কম হয়।" },
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
      { icon: Flame, text: "ফায়ার সার্ভিস: ১৬১৬৩ বা ৯৯৯। প্রথমে পরিবারের নিরাপত্তা নিশ্চিত করুন।", audio: "আগুনে ফায়ার সার্ভিস ১৬১৬৩ বা জরুরি সেবা ৯৯৯ এ ফোন করুন।" },
      { icon: Camera, text: "যত দ্রুত সম্ভব ক্ষতির ছবি তুলুন — বীমা বা সহায়তার দাবির জন্য প্রমাণ লাগবে।", audio: "ক্ষতির ছবি তুলুন। বীমা বা সরকারি সহায়তার দাবিতে এটি কাজে লাগবে।" },
      { icon: Building2, text: "ইউনিয়ন পরিষদে ঘটনা জানান — ত্রাণ পাওয়ার জন্য নিবন্ধন করুন।", audio: "ইউনিয়ন পরিষদে ঘটনা জানান এবং ত্রাণের জন্য নিবন্ধন করুন।" },
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
      { icon: FileText, text: "উপজেলা কৃষি অফিসে ক্ষতির তথ্য জানান — সরকারি প্রণোদনার জন্য নিবন্ধন করুন।", audio: "উপজেলা কৃষি অফিসে ক্ষতির তথ্য জানান এবং প্রণোদনার জন্য নিবন্ধন করুন।" },
      { icon: Leaf, text: "পরবর্তী মৌসুমের জন্য কৃষি ব্যাংক বা ব্র্যাক কৃষি ঋণের আবেদন করুন।", audio: "পরবর্তী মৌসুমের জন্য কৃষি ব্যাংক বা ব্র্যাক থেকে কৃষি ঋণের আবেদন করুন।" },
      { icon: Users, text: "স্থানীয় কৃষক সমিতির সাথে যোগাযোগ রাখুন — সম্মিলিতভাবে সহায়তা পাওয়া সহজ হয়।", audio: "স্থানীয় কৃষক সমিতির সাথে যোগাযোগ রাখুন।" },
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
        <h1 className="section-title flex items-center justify-center gap-2">
          <AlertCircle className="w-8 h-8 text-primary" />
          <span>জরুরি আর্থিক গাইড</span>
        </h1>
        <p className="section-subtitle">বিপদের সময় কী করবেন — সহজ ধাপে ধাপে</p>
      </div>

      <div className="p-4 max-w-xl mx-auto flex flex-col gap-4">
        {/* Scenario selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800">কী হয়েছে?</h2>
            <AudioAssist text="কী হয়েছে? নিচের বিকল্পগুলো থেকে বেছে নিন।" />
          </div>
          <div className="grid grid-cols-2 gap-3" role="group" aria-label="জরুরি পরিস্থিতি">
            {SCENARIOS.map(s => {
              const ScenarioIcon = s.icon;
              const isActive = selected === s.key;
              return (
                <button
                  key={s.key}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border font-semibold text-sm cursor-pointer transition-all ${
                    isActive 
                      ? "bg-teal-50 border-primary text-primary" 
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                  aria-pressed={isActive}
                  onClick={() => setSelected(s.key)}
                >
                  <ScenarioIcon className={`w-6 h-6 ${isActive ? "text-primary" : "text-slate-500"}`} />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Guide content */}
        {guide && (
          <div className="flex flex-col gap-4 mt-2">
            <h2 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-2">{guide.label} — এখন কী করবেন</h2>

            {/* Immediate steps */}
            <div>
              <h3 className="text-sm font-bold text-amber-600 mb-2 flex items-center gap-1">
                <span>তাৎক্ষণিক করণীয়</span>
              </h3>
              <div className="flex flex-col gap-2.5">
                {guide.immediate.map((step, i) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-3">
                          <div className="p-1.5 bg-slate-50 text-slate-500 rounded-lg shrink-0 mt-0.5">
                            <StepIcon className="w-4 h-4" />
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {step.text}
                          </p>
                        </div>
                        <AudioAssist text={step.audio} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gov help */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">সরকারি / NGO सहायता</h3>
              <div className="flex flex-col gap-2.5">
                {guide.govHelp.map((h, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{h.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{h.how}</p>
                    </div>
                    {h.phone && (
                      <a
                        href={`tel:${h.phone}`}
                        className="py-1.5 px-3 rounded-lg bg-teal-50 border border-teal-100 text-primary font-extrabold text-sm flex items-center gap-1 hover:bg-primary hover:text-white hover:border-primary transition-all text-decoration-none"
                      >
                        <span>{h.phone}</span>
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* What to avoid */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 border-l-4 border-l-red-500 text-xs shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>এড়িয়ে চলুন</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed">{guide.avoid}</p>
                </div>
                <AudioAssist text={guide.avoidAudio} size="sm" />
              </div>
            </div>

            {/* Quick links */}
            <div className="flex gap-3">
              <Link 
                href="/locator" 
                className="flex-1 py-2 px-4 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 text-decoration-none transition-all"
              >
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>কাছের সহায়তা</span>
              </Link>
              <Link 
                href="/protect" 
                className="flex-1 py-2 px-4 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 text-decoration-none transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>প্রতারণা এড়ান</span>
              </Link>
            </div>
          </div>
        )}

        <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4 mt-4" role="note">
          এই গাইড সচেতনতার জন্য। জরুরি পরিস্থিতিতে স্থানীয় কর্তৃপক্ষ ও পরিচিতজনের সাহায্য নিন।
        </div>
      </div>
    </>
  );
}
