"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("placeholder");
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    if (!supabase) {
      setError("লগইন সিস্টেম এই মুহূর্তে অফলাইনে আছে (স্থানীয়ভাবে কাজ করছে)।");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const formattedPhone = phone.startsWith("+88") ? phone : `+88${phone}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      
      if (error) throw error;
      
      setStep("otp");
    } catch (err: any) {
      console.error(err);
      setError("দুঃখিত, কোনো একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    
    if (!supabase) {
      setError("লগইন সিস্টেম এই মুহূর্তে অফলাইনে আছে (স্থানীয়ভাবে কাজ করছে)।");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const formattedPhone = phone.startsWith("+88") ? phone : `+88${phone}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });
      
      if (error) throw error;
      
      router.push("/cashbook");
    } catch (err: any) {
      console.error(err);
      setError("সঠিক OTP প্রদান করুন। (Invalid OTP)");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "var(--space-4)" }}>
      <div className="section-header" style={{ paddingBottom: "var(--space-4)" }}>
        <h1 className="section-title">লগইন</h1>
        <p className="section-subtitle">
          আপনার তথ্য ক্লাউডে সুরক্ষিত রাখতে লগইন করুন
        </p>
      </div>

      <div className="card" style={{ maxWidth: "400px", margin: "0 auto", width: "100%" }}>
        {error && (
          <div className="error-state mb-4">
            <span className="error-state__icon" aria-hidden="true">⚠️</span>
            <span className="error-state__text">{error}</span>
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="form-group">
            <label className="form-label" htmlFor="phone">মোবাইল নম্বর</label>
            <input
              id="phone"
              type="tel"
              className="form-input"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              dir="ltr"
            />
            <p className="form-hint">আপনার নম্বরে একটি SMS কোড পাঠানো হবে।</p>
            
            <button
              type="submit"
              className="btn btn--primary mt-4"
              disabled={isLoading || phone.length < 11}
            >
              {isLoading ? "অপেক্ষা করুন..." : "OTP পাঠান"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="form-group">
            <label className="form-label" htmlFor="otp">OTP কোড</label>
            <input
              id="otp"
              type="text"
              className="form-input"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isLoading}
              maxLength={6}
              style={{ textAlign: "center", letterSpacing: "8px", fontSize: "24px" }}
              dir="ltr"
            />
            
            <button
              type="submit"
              className="btn btn--primary mt-4"
              disabled={isLoading || otp.length < 6}
            >
              {isLoading ? "যাচাই হচ্ছে..." : "যাচাই করুন"}
            </button>
            
            <button
              type="button"
              className="btn btn--ghost mt-2"
              onClick={() => setStep("phone")}
              disabled={isLoading}
            >
              নম্বর পরিবর্তন করুন
            </button>
          </form>
        )}
      </div>
      
      <div style={{ marginTop: "auto", textAlign: "center", padding: "var(--space-4)" }}>
        <div className="privacy-notice" style={{ display: "inline-flex", textAlign: "left" }}>
          <span className="privacy-notice__icon">🔒</span>
          <span>আপনার তথ্য সম্পূর্ণ সুরক্ষিত। আমরা আপনার অনুমতি ছাড়া কাউকে তথ্য দিই না।</span>
        </div>
      </div>
    </div>
  );
}
