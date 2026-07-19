"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

const API_BASE = "http://localhost:8000/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      if (!activeUser) {
        router.push("/login");
      } else {
        setUser(activeUser);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      if (!activeUser) {
        router.push("/login");
      } else {
        setUser(activeUser);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const generateApiKey = async () => {
    if (!user) return;
    setGeneratingKey(true);
    try {
      const res = await fetch(`${API_BASE}/enterprise/generate-key?user_id=${user.id}`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.api_key);
      }
    } catch (err) {
      console.error("Failed to generate API Key", err);
    } finally {
      setGeneratingKey(false);
    }
  };

  if (loading) return <div className="p-4">লোড হচ্ছে...</div>;
  if (!user) return null;

  return (
    <>
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="section-title">প্রোফাইল</h1>
          <p className="section-subtitle">
            আপনার একাউন্ট ও সেটিংস পরিচালনা করুন
          </p>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="btn btn--ghost" style={{ padding: "8px", fontSize: "12px" }}>লগআউট</button>
      </div>

      <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        
        <div className="card" style={{ padding: "var(--space-3)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>ব্যক্তিগত তথ্য</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>
              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>মোবাইল নম্বর</span>
              <p style={{ fontWeight: "600" }}>{user.phone || user.user_metadata?.phone || "Not set"}</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "24px" }} aria-hidden="true">🏢</span>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700" }}>এন্টারপ্রাইজ API</h3>
              <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>পার্টনার হিসেবে লিড ডাটা পেতে API ব্যবহার করুন</p>
            </div>
          </div>

          {!apiKey ? (
            <button 
              className="btn btn--outline" 
              onClick={generateApiKey} 
              disabled={generatingKey}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {generatingKey ? "তৈরি হচ্ছে..." : "নতুন API Key তৈরি করুন"}
            </button>
          ) : (
            <div style={{ background: "var(--color-surface-2)", padding: "12px", borderRadius: "8px" }}>
              <p style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: "600", marginBottom: "8px" }}>
                আপনার নতুন API Key তৈরি হয়েছে:
              </p>
              <code style={{ wordBreak: "break-all", fontSize: "13px", background: "white", padding: "8px", borderRadius: "4px", display: "block" }}>
                {apiKey}
              </code>
              <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "8px" }}>
                সাবধান! এই কী (key) অন্য কারো সাথে শেয়ার করবেন না।
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
