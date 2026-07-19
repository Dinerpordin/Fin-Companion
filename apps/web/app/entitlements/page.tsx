"use client";

import { useState } from "react";
import { 
  User, 
  UserCheck, 
  Heart, 
  Leaf, 
  Home, 
  GraduationCap, 
  Building2, 
  Check, 
  RotateCcw,
  BookOpen,
  Scale,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import AudioAssist from "../components/AudioAssist";

// Eligibility rules mapped to programs
const AGE_GROUPS = [
  { key: "child",  icon: User, label: "১৮ বছরের নিচে" },
  { key: "adult",  icon: User, label: "১৮–৬৪ বছর"      },
  { key: "senior", icon: UserCheck, label: "৬৫ বছর বা বেশি" },
];

const PERSON_TYPES = [
  { key: "widow",      icon: User, label: "বিধবা / স্বামী পরিত্যক্তা" },
  { key: "disabled",   icon: Heart, label: "প্রতিবন্ধী"         },
  { key: "farmer",     icon: Leaf, label: "কৃষক"               },
  { key: "single_mom", icon: User, label: "একা মা"             },
  { key: "elderly",    icon: UserCheck, label: "বয়স্ক ব্যক্তি"      },
  { key: "poor",       icon: Home, label: "অতি দরিদ্র পরিবার"  },
  { key: "student",    icon: GraduationCap, label: "শিক্ষার্থী"          },
  { key: "other",      icon: User, label: "অন্য"               },
];

const INCOME_BANDS = [
  { key: "zero",   label: "কোনো আয় নেই / ৳৩,০০০ পর্যন্ত" },
  { key: "low",    label: "৳৩,০০১ – ৳৮,০০০"              },
  { key: "medium", label: "৳৮,০০১ এর বেশি"              },
];

type Program = {
  name: string;
  icon: any;
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
      icon: UserCheck,
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
      icon: User,
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
      icon: Heart,
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
      icon: Leaf,
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
      icon: GraduationCap,
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
      icon: Leaf,
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
      icon: Building2,
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
        <h1 className="section-title flex items-center justify-center gap-2">
          <Building2 className="w-8 h-8 text-primary" />
          <span>সরকারি সাহায্য</span>
        </h1>
        <p className="section-subtitle">আপনি কি সরকারি ভাতা বা সহায়তা পাওয়ার যোগ্য?</p>
      </div>

      <div className="p-4 max-w-xl mx-auto flex flex-col gap-4">

        {/* Step 1 — Age */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">আপনার বয়স কত?</h2>
              <AudioAssist text="আপনার বয়স কত? নিচের বোতাম থেকে বেছে নিন।" />
            </div>
            <div className="flex flex-col gap-3">
              {AGE_GROUPS.map(a => {
                const AgeIcon = a.icon;
                return (
                  <button
                    key={a.key}
                    onClick={() => { setAge(a.key); setStep(2); }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-slate-700 font-bold transition-all"
                  >
                    <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                      <AgeIcon className="w-6 h-6" />
                    </div>
                    <span>{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2 — Person type */}
        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">আপনি কে?</h2>
              <AudioAssist text="আপনি কে? নিচের বিকল্পগুলো থেকে বেছে নিন।" />
            </div>
            <div className="grid grid-cols-2 gap-3" role="group">
              {PERSON_TYPES.map(p => {
                const TypeIcon = p.icon;
                return (
                  <button
                    key={p.key}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border font-semibold text-sm cursor-pointer transition-all ${
                      type === p.key 
                        ? "bg-teal-50 border-primary text-primary" 
                        : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                    }`}
                    onClick={() => { setType(p.key); setStep(3); }}
                  >
                    <TypeIcon className={`w-6 h-6 ${type === p.key ? "text-primary" : "text-slate-500"}`} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
            <button 
              className="mt-4 w-full py-2 px-4 rounded-lg border-2 border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50 transition-all" 
              onClick={() => setStep(1)}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>পেছনে</span>
            </button>
          </div>
        )}

        {/* Step 3 — Income */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">মাসিক আয় কত?</h2>
              <AudioAssist text="আপনার পরিবারের মাসিক আয় কত?" />
            </div>
            <div className="flex flex-col gap-3">
              {INCOME_BANDS.map(ib => (
                <button
                  key={ib.key}
                  onClick={() => runCheck(ib.key)}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-slate-700 font-bold text-sm text-left transition-all"
                >
                  {ib.label}
                </button>
              ))}
            </div>
            <button 
              className="mt-4 w-full py-2 px-4 rounded-lg border-2 border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50 transition-all" 
              onClick={() => setStep(2)}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>পেছনে</span>
            </button>
          </div>
        )}

        {/* Step 4 — Results */}
        {step === 4 && results && (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold text-slate-800">
              {results.length > 0
                ? `আপনি ${results.length}টি সরকারি সুবিধার জন্য যোগ্য হতে পারেন:`
                : "আপনার দেওয়া তথ্যে কোনো নির্দিষ্ট ভাতার যোগ্যতা পাওয়া যায়নি।"}
            </p>

            {results.map((prog, i) => {
              const ProgIcon = prog.icon;
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
                        <ProgIcon className="w-5 h-5 text-primary shrink-0" />
                        <span>{prog.name}</span>
                      </p>
                      <p className="text-lg font-extrabold text-primary mb-3">
                        {prog.benefit}
                      </p>
                      <p className="text-xs text-slate-600 mb-1 leading-relaxed">
                        <strong>কীভাবে পাবেন:</strong> {prog.how}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong>প্রয়োজনীয় কাগজ:</strong> {prog.docs}
                      </p>
                    </div>
                    <AudioAssist text={prog.audio} size="sm" />
                  </div>
                </div>
              );
            })}

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center gap-2" role="note">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span>যোগ্যতা নির্ভর করে স্থানীয় বরাদ্দ ও তালিকায় স্থান পাওয়ার উপর। সঠিক তথ্যের জন্য সরাসরি সমাজসেবা অফিসে যোগাযোগ করুন।</span>
            </div>

            <button 
              className="py-2.5 px-4 rounded-lg border-2 border-primary text-primary font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-teal-50/50" 
              onClick={() => { setStep(1); setAge(""); setType(""); setIncome(""); setResults(null); }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>আবার চেক করুন</span>
            </button>

            <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4 mt-4" role="note">
              এই তথ্য সচেতনতার জন্য — চূড়ান্ত যোগ্যতা সরকারি নিয়ম অনুযায়ী নির্ধারিত হয়।
            </div>
          </div>
        )}
      </div>
    </>
  );
}
