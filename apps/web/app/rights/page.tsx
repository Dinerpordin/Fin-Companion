"use client";

import { useState } from "react";
import { 
  Home, 
  User, 
  Banknote, 
  Scale, 
  FileText, 
  Laptop, 
  AlertTriangle, 
  Coins, 
  Phone, 
  History, 
  Building2, 
  Handshake,
  ChevronDown,
  ChevronUp,
  BookOpen
} from "lucide-react";
import AudioAssist from "../components/AudioAssist";

const TABS = [
  { key: "land",     icon: Home, label: "জমির অধিকার"     },
  { key: "women",    icon: User, label: "নারীর অধিকার"     },
  { key: "borrower", icon: Banknote, label: "ঋণগ্রহীতার অধিকার" },
  { key: "legalaid", icon: Scale, label: "আইনি সহায়তা"      },
];

const CONTENT: Record<string, { title: string; items: { icon: any; heading: string; body: string; audio: string }[] }> = {
  land: {
    title: "জমি ও সম্পত্তির অধিকার",
    items: [
      {
        icon: FileText,
        heading: "মালিকানার প্রমাণ কী?",
        body: "জমির মালিকানা প্রমাণের জন্য দরকার: খতিয়ান (CS/RS/SA), দলিল (বিক্রয় বা উত্তরাধিকার), মিউটেশন সার্টিফিকেট এবং ভূমি কর পরিশোধের রসিদ।",
        audio: "জমির মালিকানার জন্য খতিয়ান, দলিল, মিউটেশন সার্টিফিকেট এবং ভূমি কর পরিশোধের রসিদ রাখুন।",
      },
      {
        icon: Laptop,
        heading: "অনলাইনে খতিয়ান চেক করুন",
        body: "land.gov.bd ওয়েবসাইটে গিয়ে জেলা, উপজেলা ও মৌজা নম্বর দিয়ে আপনার খতিয়ান দেখতে পারবেন।",
        audio: "land.gov.bd ওয়েবসাইটে গিয়ে জেলা ও উপজেলার নাম দিয়ে আপনার জমির খতিয়ান দেখুন।",
      },
      {
        icon: AlertTriangle,
        heading: "জমি দখল হলে কী করবেন?",
        body: "স্থানীয় থানায় সাধারণ ডায়েরি (GD) করুন। ইউনিয়ন ভূমি অফিসে অভিযোগ দিন। আদালতে দেওয়ানি মামলা করতে পারেন। বিনামূল্যে আইনি সহায়তার জন্য BLAST বা জেলা লিগ্যাল এইড অফিসে যোগাযোগ করুন।",
        audio: "জমি দখল হলে থানায় জিডি করুন, ভূমি অফিসে অভিযোগ দিন এবং বিনামূল্যে আইনি সহায়তার জন্য ব্লাস্ট বা লিগ্যাল এইড অফিসে যান।",
      },
      {
        icon: FileText,
        heading: "উত্তরাধিকার সূত্রে জমি পেলে",
        body: "মৃত্যুর পর জমি ভাগ করতে হলে সেপ্টেম্বর ২০২৫ থেকে রেজিস্টার্ড বণ্টননামা দলিল আবশ্যক। মুখের কথায় বণ্টন আর বৈধ নয়।",
        audio: "উত্তরাধিকার সূত্রে জমি ভাগ করতে এখন রেজিস্টার্ড বণ্টননামা দলিল করা আবশ্যক। সাব-রেজিস্ট্রার অফিসে যোগাযোগ করুন।",
      },
    ],
  },
  women: {
    title: "নারীর আর্থিক ও আইনি অধিকার",
    items: [
      {
        icon: Building2,
        heading: "নারী একা ব্যাংক হিসাব খুলতে পারেন",
        body: "বাংলাদেশে যেকোনো প্রাপ্তবয়স্ক নারী তার নিজের NID দিয়ে একা ব্যাংক হিসাব খুলতে পারেন। স্বামী বা পুরুষ অভিভাবকের সম্মতি আইনত প্রয়োজন নেই।",
        audio: "যেকোনো প্রাপ্তবয়স্ক নারী নিজের জাতীয় পরিচয়পত্র দিয়ে একা ব্যাংক হিসাব খুলতে পারেন। কোনো পুরুষের সম্মতি দরকার নেই।",
      },
      {
        icon: Scale,
        heading: "উত্তরাধিকার সম্পত্তিতে অধিকার",
        body: "মুসলিম আইনে মেয়ে পুত্রের অর্ধেক পায়। হিন্দু আইনে নারীর উত্তরাধিকার নিয়ম ভিন্ন। পারিবারিক চাপে অধিকার ছেড়ে দিলে পরে আদালতে দাবি জানানো কঠিন হতে পারে।",
        audio: "উত্তরাধিকারে মেয়ের আইনত অংশ আছে। পারিবারিক চাপে অধিকার ছেড়ে দেওয়ার আগে আইনি পরামর্শ নিন।",
      },
      {
        icon: Coins,
        heading: "যৌতুক নেওয়া বা দেওয়া উভয়ই বেআইনি",
        body: "যৌতুক নিরোধ আইন ১৯৮০ অনুযায়ী যৌতুক দেওয়া এবং নেওয়া উভয়ই শাস্তিযোগ্য অপরাধ। যৌতুকের জন্য নির্যাতনের শিকার হলে থানায় অভিযোগ করুন।",
        audio: "যৌতুক দেওয়া ও নেওয়া উভয়ই বেআইনি। যৌতুকের জন্য নির্যাতনের শিকার হলে থানায় অভিযোগ করুন বা জাতীয় হেল্পলাইন ১০৯ তে ফোন করুন।",
      },
      {
        icon: Phone,
        heading: "নির্যাতনের শিকার হলে",
        body: "জাতীয় হেল্পলাইন: ১০৯ (বিনামূল্যে, ২৪ ঘণ্টা)। পুলিশ: ৯৯৯। মহিলা ও শিশু বিষয়ক মন্ত্রণালয়ের আশ্রয় কেন্দ্র।",
        audio: "নির্যাতনের শিকার হলে জাতীয় হেল্পলাইন ১০৯ এ ফোন করুন। এটি বিনামূল্যে এবং ২৪ ঘণ্টা চালু থাকে।",
      },
    ],
  },
  borrower: {
    title: "ঋণগ্রহীতার আইনি অধিকার",
    items: [
      {
        icon: FileText,
        heading: "লিখিত চুক্তি পাওয়ার অধিকার",
        body: "যেকোনো ঋণের জন্য লিখিত চুক্তিপত্র পাওয়ার অধিকার আপনার আছে। সুদের হার, কিস্তির পরিমাণ, মেয়াদ এবং জরিমানার শর্ত স্পষ্টভাবে লেখা থাকতে হবে।",
        audio: "যেকোনো ঋণের জন্য লিখিত চুক্তি চাইতে পারেন। সুদের হার ও কিস্তির শর্ত চুক্তিতে স্পষ্ট থাকা জরুরি।",
      },
      {
        icon: Banknote,
        heading: "প্রকৃত সুদের হার জানার অধিকার",
        body: "MFI বা NGO ফ্ল্যাট রেটে সুদ চাইলেও তারা প্রকৃত বার্ষিক হার (APR) জানাতে বাধ্য। প্রকৃত হার অনেক বেশি হতে পারে — এই প্ল্যাটফর্মের ঋণ পরীক্ষা দিয়ে যাচাই করুন।",
        audio: "যেকোনো ঋণের প্রকৃত বার্ষিক সুদের হার জানার অধিকার আপনার আছে। এই প্ল্যাটফর্মের ঋণ পরীক্ষা দিয়ে আপনার ঋণের প্রকৃত খরচ জানুন।",
      },
      {
        icon: Building2,
        heading: "ব্যাংকের বিরুদ্ধে অভিযোগ",
        body: "যেকোনো ব্যাংক বা আর্থিক প্রতিষ্ঠানের বিরুদ্ধে অভিযোগ করতে পারেন: বাংলাদেশ ব্যাংক হেল্পলাইন ১৬২৩৬।",
        audio: "ব্যাংক বা আর্থিক প্রতিষ্ঠানের বিরুদ্ধে অভিযোগ করতে বাংলাদেশ ব্যাংকের হেল্পলাইন ১৬২৩৬ এ ফোন করুন।",
      },
      {
        icon: History,
        heading: "MFI ঋণ পূর্ব পরিশোধের অধিকার",
        body: "নিয়ন্ত্রিত MFI-এর ঋণ যেকোনো সময় আগে পরিশোধ করতে পারবেন। অতিরিক্ত জরিমানা চাওয়া নিয়মবিরুদ্ধ। মাইক্রোক্রেডিট রেগুলেটরি অথরিটি (MRA): ০২-৪৮৩১১৪৮৫।",
        audio: "নিয়ন্ত্রিত এমএফআই এর ঋণ যেকোনো সময় আগে পরিশোধ করতে পারবেন। সমস্যায় মাইক্রোক্রেডিট রেগুলেটরি অথরিটিতে যোগাযোগ করুন।",
      },
    ],
  },
  legalaid: {
    title: "বিনামূল্যে আইনি সহায়তা",
    items: [
      {
        icon: Building2,
        heading: "জেলা লিগ্যাল এইড অফিস",
        body: "প্রতিটি জেলায় জেলা লিগ্যাল এইড কমিটি আছে। দরিদ্র নাগরিকরা বিনামূল্যে আইনজীবী ও আদালতের সহায়তা পেতে পারেন। জেলা জজ আদালতে যোগাযোগ করুন।",
        audio: "প্রতিটি জেলায় লিগ্যাল এইড কমিটি আছে। দরিদ্র নাগরিকরা বিনামূল্যে আইনজীবী পেতে জেলা জজ আদালতে যোগাযোগ করুন।",
      },
      {
        icon: Scale,
        heading: "BLAST (বাংলাদেশ লিগ্যাল এইড সার্ভিসেস ট্রাস্ট)",
        body: "BLAST সারাদেশে দরিদ্র মানুষকে বিনামূল্যে আইনি সহায়তা দেয়। বিশেষত নারী, শিশু, শ্রমিকদের মামলায় সহায়তা পাওয়া যায়। ফোন: ০২-৯৩৫৩৮৩৯",
        audio: "ব্লাস্ট সংস্থা দরিদ্র মানুষকে বিনামূল্যে আইনি সহায়তা দেয়। ফোন করুন: শূন্য দুই নয় তিন পাঁচ তিন আট তিন নয়।",
      },
      {
        icon: Handshake,
        heading: "BRAC আইন সহায়তা",
        body: "BRAC-এর মাধ্যমে গ্রামীণ নারী ও দরিদ্র পরিবার পারিবারিক আইন, জমির বিরোধ এবং শ্রম মামলায় সহায়তা পান।",
        audio: "ব্র্যাক গ্রামীণ নারী ও দরিদ্র পরিবারকে পারিবারিক আইন ও জমির বিরোধে সহায়তা করে। স্থানীয় ব্র্যাক অফিসে যোগাযোগ করুন।",
      },
      {
        icon: Phone,
        heading: "জাতীয় হেল্পলাইন নম্বর",
        body: "নারী ও শিশু নির্যাতন: ১০৯ | পুলিশ: ৯৯৯ | বাংলাদেশ ব্যাংক অভিযোগ: ১৬২৩৬ | ভূমি অভিযোগ: ১৬১২২",
        audio: "গুরুত্বপূর্ণ নম্বর: নারী ও শিশু নির্যাতন ১০৯, police ৯৯৯, বাংলাদেশ ব্যাংক ১৬২৩৬, ভূমি অভিযোগ ১৬১২২।",
      },
    ],
  },
};

export default function RightsPage() {
  const [activeTab, setActiveTab] = useState("land");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const section = CONTENT[activeTab];

  return (
    <>
      <div className="section-header">
        <h1 className="section-title flex items-center justify-center gap-2">
          <Scale className="w-8 h-8 text-primary" />
          <span>আপনার অধিকার</span>
        </h1>
        <p className="section-subtitle">জমি, নারীর অধিকার, ঋণ, এবং আইনি সহায়তা — সহজ বাংলায়</p>
      </div>

      <div className="p-4 max-w-xl mx-auto flex flex-col gap-4">
        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="বিষয় বেছে নিন"
          className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin"
        >
          {TABS.map(t => {
            const TabIcon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => { setActiveTab(t.key); setExpandedIndex(null); }}
                className={`flex flex-col items-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold whitespace-nowrap min-w-[90px] cursor-pointer transition-all ${
                  isActive 
                    ? "bg-primary border-primary text-white" 
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <TabIcon className="w-5 h-5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3">
          <h2 className="text-md font-bold text-slate-800 mb-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>{section.title}</span>
          </h2>
          {section.items.map((item, i) => {
            const isExpanded = expandedIndex === i;
            const ItemIcon = item.icon;
            return (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div 
                  className="flex justify-between items-center gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 text-slate-600 rounded-lg shrink-0">
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">{item.heading}</p>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <AudioAssist text={item.audio} size="sm" />
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4 mt-4" role="note">
          এই পাতার তথ্য সচেতনতার জন্য — চূড়ান্ত আইনি পরামর্শের জন্য নিবন্ধিত আইনজীবীর সাথে যোগাযোগ করুন।
        </div>
      </div>
    </>
  );
}
