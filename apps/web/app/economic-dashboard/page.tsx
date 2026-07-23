import Link from "next/link";
import type { Metadata } from "next";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Landmark, 
  ArrowRight, 
  FileText, 
  DollarSign, 
  PieChart, 
  Info,
  Scale
} from "lucide-react";
import AudioAssist from "../components/AudioAssist";

export const metadata: Metadata = {
  title: "অর্থনৈতিক প্রভাব ড্যাশবোর্ড — বাংলাদেশ ব্যাংক ও পলিসি আপডেট",
  description:
    "বাংলাদেশ ব্যাংকের পলিসি রেট, মূল্যস্ফীতি, রেমিট্যান্স ও ব্যাংকিং সার্কুলারের সহজ বাংলা ব্যাখ্যা। আপনার সঞ্চয় ও ঋণে কী প্রভাব পড়বে জানুন।",
};

const MACRO_CARDS = [
  {
    id: "repo",
    title_bn: "বাংলাদেশ ব্যাংক পলিসি রেট (Repo Rate)",
    title_en: "BB Policy Rate",
    value: "৮.৫০%",
    change_bn: "+০.৫০% সাম্প্রতিক বৃদ্ধি",
    impact_bn: "পলিসি রেট বাড়ায় ব্যাংক সুদের হার বৃদ্ধি পাচ্ছে। ফলে নতুন ঋণে খরচ বাড়বে এবং সঞ্চয়ে (FDR/DPS) বেশি মুনাফা মিলবে।",
    badge: "উচ্চ মুনাফা ও ঋণের চাপ",
    trend: "up",
    link: "/compare?category=fd"
  },
  {
    id: "smart",
    title_bn: "SMART রেফারেন্স সুদের হার",
    title_en: "SMART Reference Rate",
    value: "১৩.৫৫%",
    change_bn: "৬ মাসের ট্রেজারি বিলভিত্তিক",
    impact_bn: "স্মার্ট রেট হল ব্যাংক ঋণের মূল ভিত্তি। এটি বাড়লে আপনার রানিং বা নতুন ঋণের কিস্তি (EMI) বৃদ্ধি পাবে।",
    badge: "ঋণ কিস্তি বৃদ্ধি",
    trend: "up",
    link: "/check-loan"
  },
  {
    id: "inflation",
    title_bn: "জাতীয় মূল্যস্ফীতি (Inflation)",
    title_en: "Inflation Rate",
    value: "৯.৭২%",
    change_bn: "বাংলাদেশ পরিসংখ্যান ব্যুরো",
    impact_bn: "মূল্যস্ফীতি ৯.৭২% থাকায় যেসব ব্যাংক ডিপিএস বা এফডিআর ৯.৫% এর নিচে মুনাফা দেয়, সেখানে টাকা রাখলে প্রকৃত ক্রয়ক্ষমতা হ্রাস পায়।",
    badge: "সঞ্চয়ের মান সুরক্ষা",
    trend: "up",
    link: "/compare?category=dps"
  },
  {
    id: "forex",
    title_bn: "রেমিট্যান্স ও সরকারি প্রণোদনা",
    title_en: "Remittance Rate",
    value: "৳ ১১৭.৫০",
    change_bn: "+২.৫০% সরকারি ক্যাশ বোনাস",
    impact_bn: "বৈধ ব্যাংকিং বা বিকাশ/নগদ চ্যানেলে প্রবাসী আয় পাঠালে প্রতি ১০০ টাকায় সরকার ২.৫০ টাকা অতিরিক্ত নগদ সহায়তা প্রদান করছে।",
    badge: "প্রবাসী ভাইদের লাভ",
    trend: "up",
    link: "/remittance"
  }
];

const BRPD_CIRCULARS = [
  {
    title: "ব্যাংক ঋণের সি-এমএসএমই (CMSME) নতুন ক্রেডিট গাইডলাইন",
    date: "১৮ জুলাই ২০২৪",
    summary: "ক্ষুদ্র ও মাঝারি উদ্যোক্তাদের জন্য জামানতবিহীন ঋণের সীমা বাড়ানো হয়েছে। উদ্যোক্তা নারীদের জন্য বিশেষ ৪% প্রণোদনা হার বলবৎ।",
    category: "ক্ষুদ্র ঋণ ও ব্যবসা",
    link: "/rights"
  },
  {
    title: "সঞ্চয়পত্র ও পোস্ট অফিস জমার জাতীয় আইডি বাধ্যতামূলক আপডেট",
    date: "১০ জুলাই ২০২৪",
    summary: "৫০,০০০ টাকার বেশি সঞ্চয়পত্র মুনাফা উত্তোলনে অনলাইন ই-টিইন (e-TIN) ও সঠিক এনআইডি তথ্য আপডেট করার নির্দেশ।",
    category: "সঞ্চয়পত্র নির্দেশিকা",
    link: "/documents"
  },
  {
    title: "প্রতারণামূলক এমএলএম ও ভুয়া অ্যাপ ট্র্যাকিং সতর্কতা",
    date: "০৫ জুলাই ২০২৪",
    summary: "অননুমোদিত ট্রেডিং অ্যাপ ও অতিরিক্ত মুনাফার প্রলোভন দেখানো স্কিম সম্পর্কে বাংলাদেশ ব্যাংকের বিশেষ জনস্বার্থ বিজ্ঞপ্তি।",
    category: "সুরক্ষা অ্যালার্ট",
    link: "/protect"
  }
];

export default function EconomicDashboardPage() {
  return (
    <div style={{ background: "#f4f6f8", minHeight: "100vh", padding: "1.5rem 1rem 4rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Top Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#064e3b", fontWeight: "700", fontSize: "0.875rem", marginBottom: "4px" }}>
            <Landmark className="w-5 h-5" />
            <span>অফিশিয়াল বাংলাদেশ ব্যাংক তথ্য ড্যাশবোর্ড</span>
          </div>
          
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: "800", color: "#0f172a", lineHeight: "1.3" }}>
            অর্থনৈতিক প্রভাব ড্যাশবোর্ড — আপনার পকেটে কী প্রভাব?
          </h1>
          
          <p style={{ color: "#475569", fontSize: "0.95rem", marginTop: "6px" }}>
            বাংলাদেশ ব্যাংক ও অর্থ মন্ত্রণালয়ের সর্বশেষ তথ্য বিশ্লেষণ করে আপনার সঞ্চয় ও ঋণের প্রকৃত হিসাব এক নজরে উপস্থাপন।
          </p>

          {/* Audio Assist */}
          <div style={{ marginTop: "1rem" }}>
            <AudioAssist
              text="অর্থনৈতিক প্রভাব ড্যাশবোর্ডে আপনাকে স্বাগতম। এখানে বাংলাদেশ ব্যাংকের পলিসি রেট, মূল্যস্ফীতি ও ব্যাংকিং হারের সহজ বিশ্লেষণ দেওয়া হয়েছে।"
              label="ড্যাশবোর্ড পরিচিতি শুনুন"
            />
          </div>
        </div>

        {/* 4 Macro Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          {MACRO_CARDS.map((card) => (
            <div 
              key={card.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                position: "relative"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", background: "#f0fdf4", color: "#064e3b", padding: "4px 10px", borderRadius: "999px" }}>
                  {card.badge}
                </span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>

              <div>
                <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: "600" }}>{card.title_bn}</div>
                <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>{card.value}</div>
                <div style={{ fontSize: "0.75rem", color: "#0d9488", fontWeight: "700" }}>{card.change_bn}</div>
              </div>

              <div style={{ fontSize: "0.8125rem", color: "#334155", lineHeight: "1.4", flex: 1, background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                {card.impact_bn}
              </div>

              <Link 
                href={card.link}
                style={{ 
                  fontSize: "0.8125rem", 
                  fontWeight: "700", 
                  color: "#064e3b", 
                  textDecoration: "none", 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "4px",
                  marginTop: "4px"
                }}
              >
                টুলে প্রভাব দেখুন <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Real Purchasing Power Calculator Widget */}
        <section 
          style={{
            background: "#032B20",
            color: "#ffffff",
            borderRadius: "20px",
            padding: "1.75rem 1.5rem",
            marginBottom: "2.5rem",
            boxShadow: "0 10px 25px -5px rgba(3, 43, 32, 0.2)"
          }}
          aria-labelledby="purchasing-power-title"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Scale className="w-6 h-6 text-emerald-400" />
            <h2 id="purchasing-power-title" style={{ fontSize: "1.25rem", fontWeight: "800", color: "#ffffff" }}>
              সঞ্চয়ের প্রকৃত মান ক্যালকুলেটর (Inflation Vs Return)
            </h2>
          </div>
          
          <p style={{ fontSize: "0.875rem", color: "#cbd5e1", lineHeight: "1.5", marginBottom: "1.25rem" }}>
            আপনার জমাকৃত টাকার সুদের হার যদি দেশের মূল্যস্ফীতির (৯.৭২%) চেয়ে কম হয়, তবে ব্যাংক ব্যালেন্স বাড়লেও প্রকৃত কেনাকাটার ক্ষমতা কমে যায়।
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <div style={{ background: "rgba(255,255,255,0.08)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>সাধারণ ব্যাংক সেভিংস (৪.৫০%)</div>
              <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f87171", marginTop: "4px" }}>-৫.২২% কতি (Loss)</div>
              <div style={{ fontSize: "0.75rem", color: "#cbd5e1", marginTop: "4px" }}>মূল্যস্ফীতি কাটলে প্রকৃত টাকা কমে</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.08)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>সেরা ব্যাংক FDR / DPS (১০.৫০%)</div>
              <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#34d399", marginTop: "4px" }}>+০.ea৮% লাভ (Gain)</div>
              <div style={{ fontSize: "0.75rem", color: "#cbd5e1", marginTop: "4px" }}>মূল্যস্ফীতি ছাপিয়ে প্রকৃত লাভ থাকে</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.08)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>পরিবার সঞ্চয়পত্র (১১.৫২%)</div>
              <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#34d399", marginTop: "4px" }}>+১.৮০% উচ্চ লাভ</div>
              <div style={{ fontSize: "0.75rem", color: "#cbd5e1", marginTop: "4px" }}>সর্বোচ্চ নিরাপদ সুরক্ষিত লাভ</div>
            </div>
          </div>

          <div style={{ marginTop: "1.25rem", textAlign: "right" }}>
            <Link 
              href="/compare"
              style={{
                background: "#10b981",
                color: "#ffffff",
                padding: "0.6rem 1.25rem",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "0.875rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              উচ্চ সুদের সঞ্চয় স্কিম খুঁজুন <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Official Circulars Breakdown */}
        <section aria-labelledby="circulars-title">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 id="circulars-title" style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>
              সর্বশেষ বাংলাদেশ ব্যাংক BRPD সার্কুলার ও গাইডলাইন
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {BRPD_CIRCULARS.map((circ, idx) => (
              <div 
                key={idx}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#064e3b", background: "#f0fdf4", padding: "2px 8px", borderRadius: "4px" }}>
                    {circ.category}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{circ.date}</span>
                </div>

                <div style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a" }}>
                  {circ.title}
                </div>

                <div style={{ fontSize: "0.875rem", color: "#475569", lineHeight: "1.5" }}>
                  {circ.summary}
                </div>

                <div style={{ marginTop: "6px" }}>
                  <Link 
                    href={circ.link}
                    style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#064e3b", textDecoration: "none" }}
                  >
                    বিস্তারিত গাইডলাইন দেখুন &gt;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
