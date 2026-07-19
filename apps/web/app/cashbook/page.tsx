"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../lib/supabaseClient";
import { API_BASE } from "../lib/apiUrl";
import { formatBDT } from "../utils/formatBDT";
import type { User } from "@supabase/supabase-js";

// Lazy Supabase client — null when env vars are absent or placeholder.
const supabase = getSupabaseClient();

// Icon-driven category definitions (Sprint B)
const PERSONAL_CATEGORIES_IN = [
  { key: "বেতন",         icon: "💼", label: "বেতন"       },
  { key: "ব্যবসা",       icon: "🏪", label: "ব্যবসা"      },
  { key: "রেমিট্যান্স",  icon: "✈️", label: "রেমিট্যান্স" },
  { key: "অন্যান্য আয়", icon: "💰", label: "অন্যান্য"    },
];

const PERSONAL_CATEGORIES_OUT = [
  { key: "খাদ্য",      icon: "🍚", label: "খাবার"     },
  { key: "বাড়ি ভাড়া", icon: "🏠", label: "ভাড়া"      },
  { key: "পরিবহন",    icon: "🚌", label: "যাতায়াত"   },
  { key: "শিক্ষা",    icon: "📚", label: "পড়াশোনা"   },
  { key: "স্বাস্থ্য",  icon: "💊", label: "স্বাস্থ্য"   },
  { key: "ঋণ কিস্তি", icon: "🏦", label: "কিস্তি"     },
  { key: "অন্যান্য",  icon: "📦", label: "অন্যান্য"   },
];

const BUSINESS_CATEGORIES_IN = [
  { key: "বিক্রয়",       icon: "📈", label: "বিক্রয়"      },
  { key: "সেবা প্রদান",  icon: "🛠️", label: "সেবা"        },
  { key: "অন্যান্য আয়", icon: "💰", label: "অন্যান্য"    },
];

const BUSINESS_CATEGORIES_OUT = [
  { key: "মালের খরচ",   icon: "📦", label: "মালের খরচ"  },
  { key: "দোকান ভাড়া",  icon: "🏪", label: "দোকান ভাড়া" },
  { key: "পরিবহন",      icon: "🚚", label: "পরিবহন"     },
  { key: "কর্মচারী বেতন", icon: "👥", label: "বেতন"       },
  { key: "অন্যান্য",    icon: "⚙️", label: "অন্যান্য"     },
];

// BDT quick-entry presets (Sprint A)
const CASHBOOK_PRESETS = [
  { label: "৳১০০",   value: 100  },
  { label: "৳৫০০",   value: 500  },
  { label: "৳১,০০০", value: 1000 },
  { label: "৳২,০০০", value: 2000 },
  { label: "৳৫,০০০", value: 5000 },
];

// Pre-computed flat list of all categories used for icon lookups in the entry list.
// Defined at module scope so it is not re-allocated on every render.
const ALL_CATS = [
  ...PERSONAL_CATEGORIES_IN,
  ...PERSONAL_CATEGORIES_OUT,
  ...BUSINESS_CATEGORIES_IN,
  ...BUSINESS_CATEGORIES_OUT,
];

type Entry = {
  id: string;
  type: "in" | "out";
  amount: number;
  category: string;
  date: string;
  isBusiness?: boolean;
};

// API_BASE is imported from lib/apiUrl — do not redeclare it here.

export default function CashbookPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"in" | "out">("out");
  const [mode, setMode] = useState<"personal" | "business">("personal");
  const [category, setCategory] = useState(PERSONAL_CATEGORIES_OUT[0].key);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth state
  useEffect(() => {
    if (!supabase) {
      setUser(null);
      const saved = localStorage.getItem("fc_cashbook");
      if (saved) setEntries(JSON.parse(saved));
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        const saved = localStorage.getItem("fc_cashbook");
        if (saved) setEntries(JSON.parse(saved));
        setIsLoading(false);
      } else {
        fetchCloudEntries(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCloudEntries(session.user.id);
      } else {
        setEntries([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCloudEntries = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE}/cashbook/entries?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((d: any) => ({
          id: d.id,
          type: d.entry_type === "income" ? "in" : "out",
          amount: d.amount,
          category: d.category,
          date: d.date,
          isBusiness: d.is_business || false,
        }));
        setEntries(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch cloud entries", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntry = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    const newEntry: Entry = {
      id: Date.now().toString(),
      type,
      amount: val,
      category,
      date: new Date().toISOString(),
      isBusiness: mode === "business",
    };

    if (user) {
      try {
        const res = await fetch(`${API_BASE}/cashbook/entries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            amount: val,
            entry_type: type === "in" ? "income" : "expense",
            category,
            date: newEntry.date,
            is_business: mode === "business",
          }),
        });
        if (res.ok) {
          const savedData = await res.json();
          newEntry.id = savedData.id;
          setEntries([newEntry, ...entries]);
          setAmount("");
        }
      } catch (err) {
        console.error("Error saving to cloud", err);
      }
    } else {
      const newEntries = [newEntry, ...entries];
      setEntries(newEntries);
      localStorage.setItem("fc_cashbook", JSON.stringify(newEntries));
      setAmount("");
    }
  };

  const deleteEntry = async (id: string) => {
    if (user) {
      try {
        await fetch(`${API_BASE}/cashbook/entries/${id}?user_id=${user.id}`, { method: "DELETE" });
        setEntries(entries.filter(e => e.id !== id));
      } catch (err) {
        console.error("Error deleting cloud entry", err);
      }
    } else {
      const newEntries = entries.filter(e => e.id !== id);
      setEntries(newEntries);
      localStorage.setItem("fc_cashbook", JSON.stringify(newEntries));
    }
  };

  // When switching type, reset category to first of that type
  const handleTypeChange = (newType: "in" | "out") => {
    setType(newType);
    const cats = mode === "personal" 
      ? (newType === "in" ? PERSONAL_CATEGORIES_IN : PERSONAL_CATEGORIES_OUT)
      : (newType === "in" ? BUSINESS_CATEGORIES_IN : BUSINESS_CATEGORIES_OUT);
    setCategory(cats[0].key);
  };

  const handleModeChange = (newMode: "personal" | "business") => {
    setMode(newMode);
    const cats = newMode === "personal"
      ? (type === "in" ? PERSONAL_CATEGORIES_IN : PERSONAL_CATEGORIES_OUT)
      : (type === "in" ? BUSINESS_CATEGORIES_IN : BUSINESS_CATEGORIES_OUT);
    setCategory(cats[0].key);
  };

  // Calculate totals filtered by current mode
  const filteredEntries = entries.filter(e => mode === "business" ? e.isBusiness : !e.isBusiness);
  const totalIn  = filteredEntries.filter(e => e.type === "in").reduce((sum, e) => sum + e.amount, 0);
  const totalOut = filteredEntries.filter(e => e.type === "out").reduce((sum, e) => sum + e.amount, 0);
  const balance  = totalIn - totalOut;

  const currentCats = mode === "personal"
    ? (type === "in" ? PERSONAL_CATEGORIES_IN : PERSONAL_CATEGORIES_OUT)
    : (type === "in" ? BUSINESS_CATEGORIES_IN : BUSINESS_CATEGORIES_OUT);

  // Ensure selected category is always valid for current type/mode
  const activeCat = currentCats.find(c => c.key === category) ? category : currentCats[0].key;

  // Calculate weekly stats
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklyEntries = filteredEntries.filter(e => new Date(e.date) >= oneWeekAgo);
  const weeklyIn = weeklyEntries.filter(e => e.type === "in").reduce((sum, e) => sum + e.amount, 0);
  const weeklyOut = weeklyEntries.filter(e => e.type === "out").reduce((sum, e) => sum + e.amount, 0);
  const weeklyBalance = weeklyIn - weeklyOut;

  // Calculate break-even for today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayEntries = filteredEntries.filter(e => new Date(e.date) >= startOfToday);
  const todayIn = todayEntries.filter(e => e.type === "in").reduce((sum, e) => sum + e.amount, 0);
  const todayOut = todayEntries.filter(e => e.type === "out").reduce((sum, e) => sum + e.amount, 0);
  const isBreakEven = todayIn >= todayOut;

  return (
    <>
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="section-title">ক্যাশবুক</h1>
          <p className="section-subtitle">
            {user ? "আপনার ক্লাউড ক্যাশবুক" : "শুধুমাত্র আপনার ডিভাইসে"}
          </p>
        </div>
        {!user ? (
          <button onClick={() => router.push("/login")} className="btn btn--outline btn--sm">লগইন করুন</button>
        ) : (
          <button onClick={() => supabase?.auth.signOut()} className="btn btn--ghost btn--sm">লগআউট</button>
        )}
      </div>

      <div className="p-4">
        {/* Personal vs Business Mode Toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button
            className={`btn ${mode === "personal" ? "btn--primary" : "btn--outline"}`}
            style={{ flex: 1, justifyContent: "center", fontSize: "15px", padding: "10px" }}
            onClick={() => handleModeChange("personal")}
          >
            👤 ব্যক্তিগত হিসাব
          </button>
          <button
            className={`btn ${mode === "business" ? "btn--primary" : "btn--outline"}`}
            style={{ flex: 1, justifyContent: "center", fontSize: "15px", padding: "10px" }}
            onClick={() => handleModeChange("business")}
          >
            🏪 ব্যবসার হিসাব
          </button>
        </div>

        {!user && (
          <div className="privacy-notice mb-4" role="note" onClick={() => router.push("/login")} style={{ cursor: "pointer" }}>
            <span className="privacy-notice__icon" aria-hidden="true">☁️</span>
            <span>ক্লাউডে সংরক্ষণ করতে লগইন করুন। ফোন হারালেও তথ্য থাকবে।</span>
          </div>
        )}

        {/* Weekly Profit/Loss Summary Card (for Business Mode) */}
        {mode === "business" && filteredEntries.length > 0 && (
          <div className="card mb-4" style={{ padding: "12px", background: "var(--color-bg-alt, #f9fafb)", borderLeft: "4px solid var(--color-primary)" }}>
            <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "4px", color: "var(--color-text-secondary)" }}>📊 বিগত ৭ দিনের ব্যবসার অবস্থা</h4>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px" }}>মোট বিক্রি ও আয়: <strong>{formatBDT(weeklyIn)}</strong></span>
              <span style={{ fontSize: "13px" }}>মোট খরচ: <strong>{formatBDT(weeklyOut)}</strong></span>
            </div>
            <p style={{ fontSize: "13px", marginTop: "4px", fontWeight: "600", color: weeklyBalance >= 0 ? "var(--color-primary)" : "var(--color-danger, #dc2626)" }}>
              {weeklyBalance >= 0 ? `✓ লাভ: ${formatBDT(weeklyBalance)}` : `⚠️ লোকসান: ${formatBDT(Math.abs(weeklyBalance))}`}
            </p>
          </div>
        )}

        {/* Break-even Indicator (for Business Mode today) */}
        {mode === "business" && todayOut > 0 && (
          <div className="card mb-4" style={{ padding: "12px", background: isBreakEven ? "#e6f4ea" : "#fce8e6", border: isBreakEven ? "1px solid #137333" : "1px solid #c5221f" }}>
            <p style={{ fontSize: "13px", fontWeight: "700", color: isBreakEven ? "#137333" : "#c5221f" }}>
              {isBreakEven 
                ? `🎉 আজ আপনি খরচের চেয়ে বেশি আয় করেছেন! (আজকের খরচ ${formatBDT(todayOut)} ঢাকা পড়েছে)` 
                : `⚠️ আজ এখনো লাভ স্পর্শ করতে পারেননি (খরচ মেটাতে আরও ${formatBDT(todayOut - todayIn)} আয় প্রয়োজন)`}
            </p>
          </div>
        )}

        {/* Balance summary card */}
        <div className="card mb-4" style={{ padding: "var(--space-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
            <div>
              <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "2px" }}>মোট আয়</p>
              <p style={{ fontSize: "18px", fontWeight: "800", color: "var(--color-primary)" }}>{formatBDT(totalIn)}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "2px" }}>মোট ব্যয়</p>
              <p style={{ fontSize: "18px", fontWeight: "800", color: "var(--color-danger, #dc2626)" }}>{formatBDT(totalOut)}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "2px" }}>ব্যালেন্স</p>
              <p style={{ fontSize: "22px", fontWeight: "800", color: balance >= 0 ? "var(--color-primary)" : "var(--color-danger, #dc2626)" }}>{formatBDT(balance)}</p>
            </div>
          </div>

          {/* Income / Expense toggle */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "var(--space-4)" }}>
            <button
              className={`btn ${type === "in" ? "btn--primary" : "btn--outline"}`}
              style={{ flex: 1, justifyContent: "center", fontSize: "16px" }}
              onClick={() => handleTypeChange("in")}
            >
              ✅ আয় (+)
            </button>
            <button
              className={`btn ${type === "out" ? "btn--primary" : "btn--outline"}`}
              style={{
                flex: 1, justifyContent: "center", fontSize: "16px",
                borderColor: type === "out" ? "var(--color-danger, #dc2626)" : "",
                backgroundColor: type === "out" ? "var(--color-danger, #dc2626)" : "",
              }}
              onClick={() => handleTypeChange("out")}
            >
              ❌ ব্যয় (-)
            </button>
          </div>

          {/* Amount input + BDT presets (Sprint A) */}
          <div style={{ marginBottom: "var(--space-4)" }}>
            <label htmlFor="cashbook-amount" style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
              টাকার পরিমাণ
            </label>
            <input
              id="cashbook-amount"
              type="number"
              className="input-field"
              placeholder="টাকার পরিমাণ লিখুন (যেমন: ১০০০)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={isLoading}
              style={{ fontSize: "18px" }}
            />
            <div className="preset-btn-row" role="group" aria-label="পরিমাণ দ্রুত বেছে নিন">
              {CASHBOOK_PRESETS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  className={`preset-btn ${amount === String(p.value) ? "active" : ""}`}
                  aria-pressed={amount === String(p.value)}
                  onClick={() => setAmount(String(p.value))}
                  disabled={isLoading}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Icon-driven category picker (Sprint B) */}
          <div style={{ marginBottom: "var(--space-4)" }}>
            <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
              বিভাগ বেছে নিন
            </p>
            <div className="category-grid" role="group" aria-label="বিভাগ">
              {currentCats.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  className={`category-tile ${activeCat === cat.key ? "active" : ""}`}
                  aria-pressed={activeCat === cat.key}
                  onClick={() => setCategory(cat.key)}
                  disabled={isLoading}
                >
                  <span className="category-tile__icon">{cat.icon}</span>
                  <span className="category-tile__label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            className="btn btn--primary"
            style={{ width: "100%", justifyContent: "center", fontSize: "16px" }}
            onClick={saveEntry}
            disabled={isLoading || !amount}
          >
            {isLoading ? "লোড হচ্ছে..." : "✓ সংরক্ষণ করুন"}
          </button>
        </div>

        {/* Entry list — Sprint E: copy "সাম্প্রতিক এন্ট্রি" → "আপনার হিসাব" */}
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>আপনার হিসাব</h3>
        {isLoading ? (
          <p style={{ textAlign: "center", padding: "20px", color: "var(--color-text-secondary)" }}>লোড হচ্ছে...</p>
        ) : filteredEntries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📒</div>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>এখনো কোনো হিসাব নেই</p>
            <p style={{ color: "var(--color-text-tertiary)", fontSize: "13px", marginTop: "4px" }}>প্রথম এন্ট্রি যোগ করুন উপরের ফর্ম থেকে</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "24px" }}>
            {filteredEntries.slice(0, 50).map(entry => {
              // Find icon for this category using the module-level ALL_CATS lookup.
              const catInfo = ALL_CATS.find(c => c.key === entry.category);

              return (
                <div key={entry.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }}>{catInfo?.icon ?? "💬"}</span>
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "14px" }}>{entry.category}</p>
                      <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                        {new Date(entry.date).toLocaleDateString("bn-BD")}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <p style={{ fontWeight: "800", fontSize: "16px", color: entry.type === "in" ? "var(--color-primary)" : "var(--color-danger, #dc2626)" }}>
                      {entry.type === "in" ? "+" : "-"} {formatBDT(entry.amount)}
                    </p>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      aria-label={`${entry.category} এন্ট্রি মুছুন`}
                      style={{
                        background: "none",
                        border: "1px solid var(--color-border-light)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--color-text-tertiary)",
                        padding: "4px 8px",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      মুছুন
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

