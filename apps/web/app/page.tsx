import Link from "next/link";
import type { Metadata } from "next";
import { 
  Calculator, 
  Landmark, 
  PieChart, 
  ShieldCheck, 
  Scale, 
  Mic, 
  MapPin, 
  FileText, 
  HeartPulse, 
  Lock, 
  PhoneCall, 
  Smartphone, 
  MessageSquare, 
  ChevronRight,
  Shield
} from "lucide-react";

export const metadata: Metadata = {
  title: "আর্থিক সহায়ক — আপনার আর্থিক সিদ্ধান্তে বিশ্বস্ত সহচর",
  description:
    "ঋণ, সঞ্চয়, ব্যাংক তুলনা ও দৈনিক হিসাব — সহজ বাংলায়। বিশ্বস্ত তথ্য ও স্মার্ট টুলসের মাধ্যমে আপনার আর্থিক সিদ্ধান্ত হোক সহজ ও নিরাপদ।",
};

export default function HomePage() {
  return (
    <div style={{ background: "#f4f6f8", minHeight: "100vh" }}>
      {/* 1. Top Slogan Banner (Mockup Header) */}
      <div className="top-slogan-banner">
        <div className="top-slogan-banner__title">
          আপনার আর্থিক সিদ্ধান্তে বিশ্বস্ত সহচর
        </div>
        <div className="top-slogan-banner__badges">
          <span className="top-slogan-badge">
            <span className="top-slogan-badge__check">✓</span> নিরাপদ
          </span>
          <span className="top-slogan-badge">
            <span className="top-slogan-badge__check">✓</span> বিশ্বস্ত
          </span>
          <span className="top-slogan-badge">
            <span className="top-slogan-badge__check">✓</span> সহজ
          </span>
          <span className="top-slogan-badge">
            <span className="top-slogan-badge__check">✓</span> বাংলার জন্য
          </span>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1rem" }}>
        {/* 2. Hero Section */}
        <section 
          style={{ 
            background: "#ffffff", 
            borderRadius: "24px", 
            border: "1px solid #e2e8f0", 
            padding: "2rem 1.5rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.03)"
          }} 
          aria-labelledby="hero-title"
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", alignItems: "center" }} className="lg:grid-cols-12">
            
            {/* Left Hero Text & CTAs */}
            <div className="lg:col-span-7" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h1 
                id="hero-title" 
                style={{ 
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", 
                  fontWeight: "800", 
                  color: "#0f172a", 
                  lineHeight: "1.25", 
                  letterSpacing: "-0.02em" 
                }}
              >
                ঋণ, সঞ্চয়, ব্যাংক তুলনা<br />
                ও দৈনিক হিসাব — <span style={{ color: "#064e3b" }}>সহজ বাংলায়</span>
              </h1>
              
              <p style={{ fontSize: "1rem", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>
                বিশ্বস্ত তথ্য ও স্মার্ট টুলসের মাধ্যমে আপনার আর্থিক সিদ্ধান্ত হোক সহজ ও নিরাপদ।
              </p>

              {/* Action CTA Buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.875rem", marginTop: "0.5rem" }}>
                <Link
                  href="/cashbook"
                  id="home-cta-cashbook"
                  style={{
                    background: "#064e3b",
                    color: "#ffffff",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(6, 78, 59, 0.25)",
                    transition: "all 0.15s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  হিসাব শুরু করুন
                </Link>

                <Link
                  href="/compare"
                  id="home-cta-compare"
                  style={{
                    background: "#ffffff",
                    color: "#064e3b",
                    border: "1.5px solid #064e3b",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  ব্যাংক তুলনা করুন
                </Link>
              </div>
            </div>

            {/* Right Hero Phone Mockup & Trust Showcase */}
            <div className="lg:col-span-5" style={{ display: "flex", justifyContent: "center" }}>
              <div className="hero-mockup-wrapper" style={{ flexWrap: "wrap", justifyContent: "center" }}>
                
                {/* Phone Graphic with Pie Chart */}
                <div className="phone-mockup">
                  <div className="phone-mockup__notch"></div>
                  <div className="phone-mockup__screen">
                    <div className="phone-mockup__title">মাসিক সারসংক্ষেপ</div>
                    <div className="phone-mockup__date">জুলাই ২০২৪</div>
                    
                    <div className="phone-mockup__amount-label">মোট ব্যয়</div>
                    <div className="phone-mockup__amount">৳ ১৮,৪৫০</div>

                    {/* Donut Pie Chart & Legend */}
                    <div className="donut-chart-container">
                      <svg className="donut-chart-svg" viewBox="0 0 36 36">
                        {/* Background circle */}
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="3.8"
                        />
                        {/* Slice 1 - Rent (45%) */}
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#0f172a"
                          strokeWidth="4"
                          strokeDasharray="45, 100"
                        />
                        {/* Slice 2 - Utilities (30%) */}
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#064e3b"
                          strokeWidth="4"
                          strokeDasharray="30, 100"
                          strokeDashoffset="-45"
                        />
                        {/* Slice 3 - Transport (15%) */}
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="4"
                          strokeDasharray="15, 100"
                          strokeDashoffset="-75"
                        />
                      </svg>

                      <div className="donut-chart-legend">
                        <div className="donut-legend-item">
                          <span className="legend-dot" style={{ background: "#0f172a" }}></span>
                          <span>ভাড়া</span>
                        </div>
                        <div className="donut-legend-item">
                          <span className="legend-dot" style={{ background: "#064e3b" }}></span>
                          <span>বাসা খরচ</span>
                        </div>
                        <div className="donut-legend-item">
                          <span className="legend-dot" style={{ background: "#10b981" }}></span>
                          <span>যাতায়াত</span>
                        </div>
                        <div className="donut-legend-item">
                          <span className="legend-dot" style={{ background: "#94a3b8" }}></span>
                          <span>অন্যান্য</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Card beside Phone */}
                <div className="hero-privacy-card" style={{ maxWidth: "180px" }}>
                  <div 
                    style={{ 
                      width: "48px", 
                      height: "48px", 
                      borderRadius: "12px", 
                      background: "#f0fdf4", 
                      color: "#064e3b", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      marginBottom: "12px" 
                    }}
                  >
                    <Shield className="w-6 h-6" />
                  </div>
                  <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
                    আপনার তথ্য নিরাপদ ও সুরক্ষিত
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>We protect your data with bank-grade security</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 3. Trust Strip Row */}
        <section className="trust-strip" aria-label="প্ল্যাটফর্মের বৈশিষ্ট্যসমূহ">
          <div className="trust-item">
            <div className="trust-item__icon"><Smartphone className="w-5 h-5" /></div>
            <div className="trust-item__text">তথ্য আপনার ফোনেই থাকে</div>
          </div>
          <div className="trust-item">
            <div className="trust-item__icon"><Landmark className="w-5 h-5" /></div>
            <div className="trust-item__text">অফিশিয়াল উৎসভিত্তিক</div>
          </div>
          <div className="trust-item">
            <div className="trust-item__icon">🇧🇩</div>
            <div className="trust-item__text">বাংলাদেশের জন্য</div>
          </div>
          <div className="trust-item">
            <div className="trust-item__icon"><MessageSquare className="w-5 h-5" /></div>
            <div className="trust-item__text">সহজ বাংলা</div>
          </div>
        </section>

        {/* 4. Section 1: "প্রধান টুলসমূহ" */}
        <section id="tools" style={{ marginBottom: "2rem" }} aria-labelledby="main-tools-title">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 id="main-tools-title" style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>
              প্রধান টুলসমূহ
            </h2>
            <Link href="/compare" style={{ fontSize: "0.875rem", fontWeight: "600", color: "#064e3b", textDecoration: "none" }}>
              সব দেখুন &gt;
            </Link>
          </div>

          <div className="tools-3grid">
            {/* Loan Calculator */}
            <Link href="/check-loan" className="tool-card" id="home-card-loan">
              <div className="tool-card__icon-box">
                <Calculator className="w-6 h-6" />
              </div>
              <div className="tool-card__title">Loan Calculator</div>
              <div className="tool-card__desc">
                মাসিক কিস্তি, সুদ ও মোট পরিশোধ সহজেই হিসাব করুন।
              </div>
              <div className="tool-card__action">
                ব্যবহার করুন &gt;
              </div>
            </Link>

            {/* Bank Comparison */}
            <Link href="/compare" className="tool-card" id="home-card-compare">
              <div className="tool-card__icon-box">
                <Landmark className="w-6 h-6" />
              </div>
              <div className="tool-card__title">Bank Comparison</div>
              <div className="tool-card__desc">
                সুদের হার, চার্জ ও সেবা তুলনা করে সেরা ব্যাংক বেছে নিন।
              </div>
              <div className="tool-card__action">
                ব্যবহার করুন &gt;
              </div>
            </Link>

            {/* Budget Tracker */}
            <Link href="/cashbook" className="tool-card" id="home-card-cashbook">
              <div className="tool-card__icon-box">
                <PieChart className="w-6 h-6" />
              </div>
              <div className="tool-card__title">Budget Tracker</div>
              <div className="tool-card__desc">
                আয়-ব্যয় ট্র্যাক করুন এবং সঞ্চয়ের লক্ষ্য পূরণ করুন।
              </div>
              <div className="tool-card__action">
                ব্যবহার করুন &gt;
              </div>
            </Link>
          </div>
        </section>

        {/* 5. Dual Column Section: "সুরক্ষা ও সহায়তা" & "আরও সেবা" */}
        <div className="dual-section-grid">
          
          {/* Left Column: সুরক্ষা ও সহায়তা */}
          <section id="support" aria-labelledby="security-support-title">
            <h2 id="security-support-title" style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0f172a", marginBottom: "1rem" }}>
              সুরক্ষা ও সহায়তা
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              <Link href="/protect" className="support-card" id="home-card-protect">
                <div className="support-card__left">
                  <div className="support-card__icon"><ShieldCheck className="w-5 h-5" /></div>
                  <div>
                    <div className="support-card__title">প্রতারণা সচেতনতা</div>
                    <div className="support-card__desc">সাধারণ প্রতারণার ধারণা ও সতর্ক থাকার উপায়</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>

              <Link href="/rights" className="support-card" id="home-card-rights">
                <div className="support-card__left">
                  <div className="support-card__icon"><Scale className="w-5 h-5" /></div>
                  <div>
                    <div className="support-card__title">আইনি অধিকার</div>
                    <div className="support-card__desc">ব্যাংক অধিকার ও আর্থিক সেবা সম্পর্কিত তথ্য</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>

              <Link href="/emergency" className="support-card" id="home-card-emergency">
                <div className="support-card__left">
                  <div className="support-card__icon"><PhoneCall className="w-5 h-5" /></div>
                  <div>
                    <div className="support-card__title">জরুরি সহায়তা গাইড</div>
                    <div className="support-card__desc">জরুরি নম্বর ও করণীয় এক নজরে</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>

            </div>
          </section>

          {/* Right Column: আরও সেবা */}
          <section id="services" aria-labelledby="more-services-title">
            <h2 id="more-services-title" style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0f172a", marginBottom: "1rem" }}>
              আরও সেবা
            </h2>
            <div className="more-services-grid">
              
              <Link href="/companion" className="service-tile" id="home-card-companion">
                <div className="service-tile__icon"><Mic className="w-5 h-5" /></div>
                <div className="service-tile__title">ভয়েস সহকারী</div>
                <div className="service-tile__desc">কথায় জিজ্ঞাসা, তথ্য পান</div>
              </Link>

              <Link href="/locator" className="service-tile" id="home-card-locator">
                <div className="service-tile__icon"><MapPin className="w-5 h-5" /></div>
                <div className="service-tile__title">শাখা লোকোটর</div>
                <div className="service-tile__desc">আপনার কাছাকাছি শাখা খুঁজুন</div>
              </Link>

              <Link href="/documents" className="service-tile" id="home-card-documents">
                <div className="service-tile__icon"><FileText className="w-5 h-5" /></div>
                <div className="service-tile__title">প্রয়োজনীয় ডকুমেন্টস</div>
                <div className="service-tile__desc">কোন সেবায় কোন ডকুমেন্ট লাগবে</div>
              </Link>

              <Link href="/health" className="service-tile" id="home-card-health">
                <div className="service-tile__icon"><HeartPulse className="w-5 h-5" /></div>
                <div className="service-tile__title">স্বাস্থ্য কুইজ</div>
                <div className="service-tile__desc">আপনার স্বাস্থ্য ঝুঁকি জানুন</div>
              </Link>

            </div>
          </section>

        </div>

        {/* 6. Bottom Trust Footer */}
        <footer className="bottom-trust-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Lock className="w-4 h-4 text-emerald-800" />
            <span>আপনার গোপনীয়তা আমাদের অগ্রাধিকার</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Landmark className="w-4 h-4 text-slate-500" />
            <span>Powered by trusted data sources</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
