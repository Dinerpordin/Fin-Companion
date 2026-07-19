import Link from "next/link";
import type { Metadata } from "next";
import AudioAssist from "./components/AudioAssist";

export const metadata: Metadata = {
  title: "আর্থিক সহায়ক — বাংলাদেশের সম্পূর্ণ আর্থিক প্ল্যাটফর্ম",
  description:
    "ঋণ পরীক্ষা, সঞ্চয় তুলনা, বীমা, সরকারি সাহায্য, প্রতারণা থেকে সুরক্ষা — সম্পূর্ণ বিনামূল্যে, লগইন ছাড়াই।",
};

const CORE_SERVICES = [
  { href: "/check-loan",    icon: "💵", title: "ঋণ যাচাইকারী",       desc: "সুদের প্রকৃত হার ও কিস্তির হিসাব",   id: "home-card-loan"      },
  { href: "/compare",       icon: "📊", title: "ব্যাংক পণ্য তুলনা",        desc: "FDR ও DPS স্কিম তুলনা করুন",        id: "home-card-compare"   },
  { href: "/cashbook",      icon: "📓", title: "আয়-ব্যয় হিসাব",    desc: "দৈনিক আয় ও ব্যয়ের লেজার খাতা",        id: "home-card-cashbook"  },
  { href: "/companion",     icon: "🤖", title: "AI ভয়েস সহকারী",          desc: "সহজ বাংলায় আর্থিক প্রশ্নোত্তর",         id: "home-card-companion" },
];

const GUIDES = [
  { href: "/protect",       icon: "🛡️", title: "প্রতারণা সচেতনতা",    desc: "ভুয়া স্কিম চেনা ও সুরক্ষার উপায়",   id: "home-card-protect"   },
  { href: "/rights",         icon: "⚖️", title: "আপনার আইনি অধিকার",     desc: "জমি ও ঋণের আইনি গাইডলাইন",   id: "home-card-rights"    },
  { href: "/emergency",      icon: "🆘", title: "জরুরি আর্থিক গাইড",        desc: "দুর্যোগকালীন সরকারি সহায়তার তথ্য",   id: "home-card-emergency" },
];

const UTILITIES = [
  { href: "/health",         icon: "💚", title: "আর্থিক স্বাস্থ্য কুইজ",  desc: "ঋণের চাপ ও সঞ্চয়ের অনুপাত পরিমাপ",   id: "home-card-health"    },
  { href: "/locator",        icon: "📍", title: "নিকটতম শাখা ও এজেন্ট",       desc: "GPS বা জেলা ভিত্তিক ব্যাংক সন্ধান",   id: "home-card-locator"   },
  { href: "/documents",      icon: "📄", title: "প্রয়োজনীয় নথি তালিকা",   desc: "ঋণ বা হিসাব খুলতে যা যা লাগবে",   id: "home-card-documents" },
];

const EXAMPLE_QUESTIONS = [
  "আমার ঋণ আসলে কত পড়ছে?",
  "ভাতার জন্য আবেদন কীভাবে করব?",
  "বীমা কী ও এর গুরুত্ব কী?",
  "কোন ব্যাংকে ভালো এফডিআর রেট আছে?",
  "বন্যায় কী করব?",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero fade-in" aria-labelledby="hero-title">
        <h1 className="hero__title" id="hero-title">
          আপনার আর্থিক সিদ্ধান্তে<br />
          <span style={{ opacity: 0.9 }}>আপনার পাশে আছি</span>
        </h1>
        <p className="hero__subtitle">
          ঋণ থেকে বীমা, সঞ্চয় থেকে অধিকার — সব বিষয়ে সহজ বাংলায়।
        </p>

        {/* Voice CTA */}
        <div style={{ marginTop: "var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <AudioAssist
            text="আর্থিক সহায়ক। ঋণ থেকে বীমা, সঞ্চয় থেকে অধিকার। সব বিষয়ে সহজ বাংলায়। সম্পূর্ণ বিনামূল্যে।"
            label="পড়ে শুনুন"
          />
          <Link
            href="/companion?voice=true"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "24px",
              background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.4)",
              color: "white", textDecoration: "none", fontSize: "15px", fontWeight: "600",
            }}
            id="home-voice-cta"
          >
            🎙️ বলুন, আমরা বুঝব
          </Link>
        </div>

        {/* Privacy trust note */}
        <div
          className="privacy-notice"
          style={{ marginTop: "var(--space-4)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)" }}
          role="note"
          aria-label="গোপনীয়তা তথ্য"
        >
          <span className="privacy-notice__icon" aria-hidden="true">🔒</span>
          <span>আপনার সংখ্যাগুলো আপনার ফোনেই থাকে। কোনো ব্যক্তিগত তথ্য সার্ভারে সংরক্ষণ করা হয় না।</span>
        </div>
      </section>

      {/* Core Services Section */}
      <section aria-labelledby="core-title" style={{ padding: "var(--space-2) 0" }}>
        <h2 id="core-title" style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)", padding: "var(--space-4) var(--space-4) var(--space-2)"}}>
          প্রধান সেবাসমূহ
        </h2>
        <div className="product-grid" style={{ padding: "0 var(--space-4)" }}>
          {CORE_SERVICES.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="action-card"
              id={card.id}
              aria-label={`${card.title}: ${card.desc}`}
              style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", padding: "16px", borderRadius: "12px", background: "var(--color-surface)", border: "1px solid var(--color-border-light)", transition: "all 0.15s" }}
            >
              <span className="action-card__icon" aria-hidden="true" style={{ fontSize: "28px", marginBottom: "8px" }}>{card.icon}</span>
              <span className="action-card__title" style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>{card.title}</span>
              <span className="action-card__desc" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{card.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Guides Section */}
      <section aria-labelledby="guides-title" style={{ padding: "var(--space-2) 0" }}>
        <h2 id="guides-title" style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)", padding: "var(--space-4) var(--space-4) var(--space-2)"}}>
          সুরক্ষা ও অধিকার নির্দেশিকা
        </h2>
        <div className="product-grid" style={{ padding: "0 var(--space-4)" }}>
          {GUIDES.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="action-card"
              id={card.id}
              aria-label={`${card.title}: ${card.desc}`}
              style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", padding: "16px", borderRadius: "12px", background: "var(--color-surface)", border: "1px solid var(--color-border-light)", transition: "all 0.15s" }}
            >
              <span className="action-card__icon" aria-hidden="true" style={{ fontSize: "28px", marginBottom: "8px" }}>{card.icon}</span>
              <span className="action-card__title" style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>{card.title}</span>
              <span className="action-card__desc" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{card.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Utilities Section */}
      <section aria-labelledby="utilities-title" style={{ padding: "var(--space-2) 0" }}>
        <h2 id="utilities-title" style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)", padding: "var(--space-4) var(--space-4) var(--space-2)"}}>
          অন্যান্য আর্থিক সেবা ও কুইজ
        </h2>
        <div className="product-grid" style={{ padding: "0 var(--space-4)" }}>
          {UTILITIES.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="action-card"
              id={card.id}
              aria-label={`${card.title}: ${card.desc}`}
              style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", padding: "16px", borderRadius: "12px", background: "var(--color-surface)", border: "1px solid var(--color-border-light)", transition: "all 0.15s" }}
            >
              <span className="action-card__icon" aria-hidden="true" style={{ fontSize: "28px", marginBottom: "8px" }}>{card.icon}</span>
              <span className="action-card__title" style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>{card.title}</span>
              <span className="action-card__desc" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{card.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Example questions */}
      <section style={{ padding: "var(--space-4) var(--space-4)" }} aria-labelledby="examples-title">
        <h2
          id="examples-title"
          style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)", marginBottom: "var(--space-3)" }}
        >
          সাধারণ জিজ্ঞাসিত প্রশ্নসমূহ
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {EXAMPLE_QUESTIONS.map((q, i) => (
            <Link
              key={i}
              href={`/companion?q=${encodeURIComponent(q)}`}
              className="card"
              id={`home-example-${i}`}
              style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", textDecoration: "none", color: "var(--color-text-primary)", padding: "var(--space-3) var(--space-4)", transition: "all var(--transition-fast)" }}
              aria-label={`প্রশ্ন করুন: ${q}`}
            >
              <span style={{ color: "var(--color-primary)", fontSize: "var(--font-size-lg)" }} aria-hidden="true">💬</span>
              <span style={{ fontSize: "var(--font-size-sm)" }}>{q}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Source trust note */}
      <section style={{ padding: "var(--space-2) var(--space-4) var(--space-6)" }} aria-label="তথ্যের উৎস সম্পর্কে">
        <div className="disclaimer" role="note">
          <strong>তথ্যের উৎস:</strong> সকল পণ্যের তথ্য বাংলাদেশ ব্যাংক ও বাণিজ্যিক ব্যাংকের অফিসিয়াল ওয়েবসাইট থেকে সংগৃহীত। প্রতিটি তথ্যে সর্বশেষ যাচাইয়ের তারিখ দেওয়া আছে। এটি একটি তথ্য সেবা, আর্থিক পরামর্শ নয়।
        </div>
      </section>
    </>
  );
}
