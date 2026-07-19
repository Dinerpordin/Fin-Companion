"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("placeholder");
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

const API_BASE = "http://localhost:8000/api";

type SavedScenario = {
  id: string;
  scenario_type: string;
  input_data: any;
  results: any;
  created_at: string;
};

export default function ScenariosPage() {
  const router = useRouter();
  const [loanAmount, setLoanAmount] = useState("");
  const [currentInstalment, setCurrentInstalment] = useState("");
  const [extraAmount, setExtraAmount] = useState("500");
  
  const [scenarioResult, setScenarioResult] = useState<{
    monthsSaved: number;
    moneySaved: number;
  } | null>(null);

  const [user, setUser] = useState<any>(null);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(false);

  // Check auth state and fetch scenarios
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser) {
        fetchSavedScenarios(activeUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser) {
        fetchSavedScenarios(activeUser.id);
      } else {
        setSavedScenarios([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSavedScenarios = async (userId: string) => {
    setIsLoadingScenarios(true);
    try {
      const res = await fetch(`${API_BASE}/scenarios?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSavedScenarios(data);
      }
    } catch (err) {
      console.error("Failed to fetch scenarios", err);
    } finally {
      setIsLoadingScenarios(false);
    }
  };

  const calculateScenario = () => {
    const loan = parseFloat(loanAmount);
    const inst = parseFloat(currentInstalment);
    const extra = parseFloat(extraAmount);
    
    if (!loan || !inst || !extra || inst <= 0) return;
    
    const currentMonths = loan / inst;
    const newMonths = loan / (inst + extra);
    const monthsSaved = Math.max(0, currentMonths - newMonths);
    const moneySaved = Math.max(0, extra * monthsSaved * 0.1);

    setScenarioResult({
      monthsSaved: Math.round(monthsSaved),
      moneySaved: Math.round(moneySaved)
    });
  };

  const saveScenario = async () => {
    if (!user || !scenarioResult) return;
    setIsSaving(true);
    
    try {
      const res = await fetch(`${API_BASE}/scenarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          scenario_type: "loan_acceleration",
          input_data: { loanAmount, currentInstalment, extraAmount },
          results: scenarioResult
        })
      });
      
      if (res.ok) {
        const newScenario = await res.json();
        setSavedScenarios([newScenario, ...savedScenarios]);
      }
    } catch (err) {
      console.error("Failed to save scenario", err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteScenario = async (id: string) => {
    if (!user) return;
    try {
      await fetch(`${API_BASE}/scenarios/${id}?user_id=${user.id}`, {
        method: "DELETE",
      });
      setSavedScenarios(savedScenarios.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete scenario", err);
    }
  };

  return (
    <>
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="section-title">যদি-তাহলে পরিকল্পনা</h1>
          <p className="section-subtitle">
            বিভিন্ন পরিস্থিতি হিসাব করুন — সিদ্ধান্ত আপনার
          </p>
        </div>
        {!user ? (
          <button onClick={() => router.push("/login")} className="btn btn--outline" style={{ padding: "8px 12px", fontSize: "12px" }}>লগইন করুন</button>
        ) : (
          <button onClick={() => supabase?.auth.signOut()} className="btn btn--ghost" style={{ padding: "8px", fontSize: "12px" }}>লগআউট</button>
        )}
      </div>

      <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        
        {!user && (
          <div className="privacy-notice" role="note" onClick={() => router.push("/login")} style={{ cursor: "pointer", marginBottom: "-8px" }}>
            <span className="privacy-notice__icon" aria-hidden="true">🔒</span>
            <span>
              আপনার হিসাবগুলো সংরক্ষণ করতে লগইন করুন।
            </span>
          </div>
        )}

        {/* Pilot walkthrough banner — for partner demos */}
        <button
          className="pilot-banner"
          onClick={() => router.push("/companion?q=" + encodeURIComponent("পাইলট ওয়ালকথ্রু শুরু করুন"))}
          aria-label="পাইলট ওয়ালকথ্রু শুরু করুন — AI সহায়কে যান"
        >
          <span className="pilot-banner__icon" aria-hidden="true">🎯</span>
          <div>
            <p className="pilot-banner__title">পাইলট ওয়ালকথ্রু শুরু করুন</p>
            <p className="pilot-banner__desc">
              একজন ছোট ব্যবসায়ীর পার্শ্ব দিয়ে সম্পূর্ণ প্ল্যাটফর্মের সেবা বুঝুন — ঃণ পরীক্ষা, পণ্য তুলনা, ক্যাশবুক, এবং AI সহায়ক।
            </p>
          </div>
        </button>

        <div className="card" style={{ padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "24px" }} aria-hidden="true">⬆️</span>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700" }}>বেশি কিস্তি দিলে কী হবে?</h3>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>মাসে সামান্য বেশি দিলে কতটুকু সাশ্রয় হবে হিসাব করুন।</p>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
            <input type="number" className="input-field" placeholder="বাকি ঋণের পরিমাণ (উদা: ৫০০০০)" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} />
            <input type="number" className="input-field" placeholder="বর্তমান মাসিক কিস্তি (উদা: ৫০০০)" value={currentInstalment} onChange={e => setCurrentInstalment(e.target.value)} />
            <input type="number" className="input-field" placeholder="অতিরিক্ত কত দেবেন? (উদা: ৫০০)" value={extraAmount} onChange={e => setExtraAmount(e.target.value)} />
            <button className="btn btn--primary" style={{ justifyContent: "center" }} onClick={calculateScenario}>হিসাব করুন</button>
          </div>

          {scenarioResult && (
            <div style={{ padding: "16px", borderRadius: "8px", background: "var(--color-surface-2)", marginTop: "8px" }}>
              <p style={{ fontSize: "14px", marginBottom: "8px" }}>যদি প্রতি মাসে <strong>৳{extraAmount}</strong> বেশি দেন, তাহলে:</p>
              <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <div style={{ flex: 1, padding: "12px", background: "white", borderRadius: "8px", textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>সময় বাঁচবে</p>
                  <p style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-primary)" }}>{scenarioResult.monthsSaved} মাস</p>
                </div>
                <div style={{ flex: 1, padding: "12px", background: "white", borderRadius: "8px", textAlign: "center", border: "1px solid var(--color-primary)" }}>
                  <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>খরচ বাঁচবে (আনুমানিক)</p>
                  <p style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-primary)" }}>৳ {scenarioResult.moneySaved}</p>
                </div>
              </div>
              {user && (
                <button 
                  className="btn btn--outline" 
                  style={{ width: "100%", justifyContent: "center", background: "white" }} 
                  onClick={saveScenario}
                  disabled={isSaving}
                >
                  {isSaving ? "সংরক্ষণ করা হচ্ছে..." : "💾 প্রোফাইলে সেভ করুন"}
                </button>
              )}
            </div>
          )}
        </div>

        {user && savedScenarios.length > 0 && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>আপনার সংরক্ষিত হিসাব</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {savedScenarios.map(scenario => (
                <div key={scenario.id} className="card" style={{ padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "14px" }}>অতিরিক্ত ৳{scenario.input_data.extraAmount}/মাস</p>
                    <p style={{ fontSize: "12px", color: "var(--color-primary)" }}>
                      {scenario.results.monthsSaved} মাস ও ৳{scenario.results.moneySaved} সাশ্রয়
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                      ঋণ: ৳{scenario.input_data.loanAmount} | কিস্তি: ৳{scenario.input_data.currentInstalment}
                    </p>
                  </div>
                  <button onClick={() => deleteScenario(scenario.id)} aria-label="মুছে ফেলুন" style={{ background: "none", border: "none", color: "var(--color-text-tertiary)", padding: "8px" }}>❌</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{ padding: "var(--space-3)", opacity: 0.8 }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "24px" }} aria-hidden="true">💰</span>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700" }}>DPS শুরু করলে</h3>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>মাসিক সঞ্চয়ে পরিপক্ব মূল্য কত হবে?</p>
              <Link href="/compare" style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: "600", display: "inline-block", marginTop: "4px" }}>DPS রেট তুলনা করুন →</Link>
            </div>
          </div>
        </div>

        <div className="disclaimer mt-2" role="note">
          সকল হিসাব নিশ্চিত গণনার উপর ভিত্তি করে। এটি আর্থিক পরামর্শ নয়।
        </div>
      </div>
    </>
  );
}
