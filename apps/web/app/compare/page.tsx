"use client";

import { useState, useEffect } from "react";
import { trackEvent } from "../utils/analytics";
import AudioAssist from "../components/AudioAssist";
import { API_BASE } from "../lib/apiUrl";

const CATEGORIES = [
  { id: "fd",            label: "এফডিআর / স্থায়ী আমানত", icon: "🏦" },
  { id: "dps",           label: "ডিপিএস (DPS)",               icon: "📅" },
  { id: "sanchayapatra", label: "সঞ্চয়পত্র স্কিম",        icon: "📜" },
  { id: "savings",       label: "সঞ্চয় হিসাব",       icon: "💰" },
  { id: "personal_loan", label: "ব্যক্তিগত লোন",     icon: "💳" },
  { id: "credit_card",   label: "ক্রেডিট কার্ড",     icon: "💳" },
];

type Product = {
  id: string;
  institution_name_en: string;
  institution_name_bn: string;
  product_name_en: string;
  product_name_bn: string;
  category: string;
  islamic_flag: boolean;
  nominal_rate: number;
  rate_type: string;
  effective_notes: string;
  verified_at: string;
  official_url: string;
  is_featured: boolean;
};

export default function ComparePage() {
  const [category, setCategory] = useState("fd");
  const [amount, setAmount] = useState("");
  const [islamicOnly, setIslamicOnly] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Lead Gen State
  const [leadProduct, setLeadProduct] = useState<Product | null>(null);
  const [leadPhone, setLeadPhone] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setFetchError(false);
      try {
        const url = new URL(`${API_BASE}/products/compare`);
        url.searchParams.append("category", category);
        if (amount) url.searchParams.append("amount", amount);
        if (islamicOnly) url.searchParams.append("islamic_only", "true");
        
        const res = await fetch(url.toString());
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
          // Sprint 9: Track comparison query with privacy-safe binned parameters
          trackEvent("product_compare", {
            amount: amount ? Number(amount) : undefined
          });
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }
    
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [category, amount, islamicOnly]);

  const submitLead = async () => {
    if (!leadProduct || !leadPhone) return;

    // Strict 11-digit BD mobile validation (013-019 followed by 8 digits)
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(leadPhone)) {
      setPhoneError("সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)");
      return;
    }

    setPhoneError("");
    setSubmittingLead(true);
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: leadProduct.id,
          contact_phone: leadPhone
        })
      });
      if (res.ok) {
        setLeadSuccess(true);
      }
    } catch (err) {
      console.error("Lead submission failed", err);
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">পণ্য তুলনা</h1>
        <p className="section-subtitle">
          সরকারি উৎস থেকে সর্বশেষ যাচাইকৃত তথ্য
        </p>
      </div>

      {/* Category selector */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          overflowX: "auto",
          padding: "0 var(--space-4) var(--space-3)",
          scrollbarWidth: "none",
        }}
        role="tablist"
      >
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === category;
          return (
            <button
              key={cat.id}
              role="tab"
              onClick={() => setCategory(cat.id)}
              className={`chip${isActive ? " btn--primary" : ""}`}
              aria-selected={isActive}
              style={isActive ? { background: "var(--color-primary)", color: "white", border: "none" } : {}}
            >
              {cat.icon} {cat.label}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {/* Filter row */}
        <div className="card mb-4" style={{ padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label htmlFor="amount" style={{ fontSize: "14px", fontWeight: "600" }}>পরিমাণ (টাকা)</label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
              <input 
                type="checkbox" 
                checked={islamicOnly} 
                onChange={(e) => setIslamicOnly(e.target.checked)} 
              />
              শুধুমাত্র ইসলামী
            </label>
          </div>
          <input
            id="amount"
            type="number"
            className="input-field"
            placeholder="যেমন: ৫০০০০"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="loading-center" role="status" aria-live="polite">
            <span className="spinner spinner--lg" aria-hidden="true" />
            <span>পণ্য লোড হচ্ছে...</span>
          </div>
        ) : fetchError ? (
          <div className="error-state" role="alert">
            <span className="error-state__icon" aria-hidden="true">⚠️</span>
            <p className="error-state__text">সার্ভারের সাথে যোগাযোগ হচ্ছে না। একটু পরে আবার চেষ্টা করুন।</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon" aria-hidden="true">🔍</span>
            <p className="empty-state__title">কোনো পণ্য পাওয়া যায়নি</p>
            <p className="empty-state__text">আপনার ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <div key={p.id} className="card" style={{ padding: "var(--space-3)", border: p.is_featured ? "2px solid var(--color-primary)" : "1px solid var(--color-gray-200)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: "bold" }}>
                      {p.institution_name_bn} {p.islamic_flag ? "(ইসলামী)" : ""}
                    </span>
                    {p.is_featured && (
                      <div style={{ fontSize: "10px", background: "var(--color-primary)", color: "white", padding: "2px 6px", borderRadius: "12px", display: "inline-block", marginLeft: "8px", fontWeight: "600" }}>
                        বিজ্ঞাপন
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span className="freshness-dot freshness-dot--fresh" aria-hidden="true" title="সম্প্রতি যাচাইকৃত" />
                    <span style={{ fontSize: "10px", color: "var(--color-gray-500)" }}>
                      {new Date(p.verified_at).toLocaleDateString("bn-BD")}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "8px" }}>
                  <h3 style={{ fontSize: "16px", margin: 0 }}>{p.product_name_bn}</h3>
                  <AudioAssist 
                    text={`${p.institution_name_bn} এর ${p.product_name_bn}। ${p.rate_type === "profit_provisional" ? "মুনাফার হার" : "সুদের হার"} শতকরা ${p.nominal_rate} ভাগ।`}
                    size="sm"
                  />
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--color-text)" }}>
                      {p.nominal_rate}%
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--color-gray-500)" }}>
                      {p.rate_type === "profit_provisional" ? "সাময়িক মুনাফা" : "সুদের হার"}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setLeadProduct(p);
                      setLeadSuccess(false);
                      setLeadPhone("");
                      setPhoneError("");
                    }}
                    className="btn btn--primary"
                    style={{ padding: "6px 16px", fontSize: "14px" }}
                  >
                    আবেদন করুন
                  </button>
                </div>
                
                {p.effective_notes && (
                  <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--color-gray-600)", borderTop: "1px solid var(--color-gray-200)", paddingTop: "8px" }}>
                    {p.effective_notes}
                  </div>
                )}

                {p.official_url && (
                  <div style={{ marginTop: "8px", fontSize: "11px", display: "flex", justifyContent: "flex-start" }}>
                    <a 
                      href={p.official_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: "var(--color-primary)", textDecoration: "underline", fontWeight: "500" }}
                      id={`compare-source-${p.id}`}
                    >
                      উৎস ওয়েবসাইট দেখুন ↗
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="disclaimer mt-4" role="note">
          সকল তথ্যে উৎস ও সর্বশেষ যাচাইয়ের তারিখ দেওয়া থাকবে।
          এটি তথ্য সেবা, আর্থিক পরামর্শ নয়।
        </div>
      </div>

      {/* Lead Modal */}
      {leadProduct && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", zIndex: 1000
        }}>
          <div style={{
            background: "var(--color-surface)", width: "100%", padding: "24px",
            borderTopLeftRadius: "16px", borderTopRightRadius: "16px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>আবেদন করুন</h3>
              <button onClick={() => setLeadProduct(null)} style={{ background: "none", border: "none", fontSize: "20px" }}>✕</button>
            </div>
            
            {leadSuccess ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                <h4 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>ধন্যবাদ!</h4>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
                  আপনার আবেদনটি {leadProduct.institution_name_bn} এ পাঠানো হয়েছে। তারা শীঘ্রই আপনার সাথে যোগাযোগ করবে।
                </p>
                <button onClick={() => setLeadProduct(null)} className="btn btn--outline" style={{ marginTop: "24px", width: "100%", justifyContent: "center" }}>বন্ধ করুন</button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
                  <strong>{leadProduct.product_name_bn}</strong> ({leadProduct.institution_name_bn}) এর জন্য আবেদন করতে আপনার মোবাইল নম্বর দিন।
                </p>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>মোবাইল নম্বর</label>
                <input 
                  type="tel" 
                  className="input-field mb-2" 
                  placeholder="01XXXXXXXXX" 
                  value={leadPhone}
                  onChange={(e) => {
                    setLeadPhone(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                />
                {phoneError && (
                  <div className="form-error mb-4" role="alert">
                    <span aria-hidden="true">⚠️</span> {phoneError}
                  </div>
                )}
                <button 
                  onClick={submitLead} 
                  className="btn btn--primary" 
                  style={{ width: "100%", justifyContent: "center" }}
                  disabled={!leadPhone || submittingLead}
                >
                  {submittingLead ? "অপেক্ষা করুন..." : "সাবমিট করুন"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
