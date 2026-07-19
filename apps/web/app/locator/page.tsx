"use client";

import { useState, useEffect } from "react";
import { trackEvent } from "../utils/analytics";

type Location = {
  id: string;
  institution_name_bn: string;
  location_type: string;
  branch_name: string;
  address_text: string;
  district: string;
  upazila: string;
  phone_public: string;
  distance_km: number | null;
  products_supported: string[];
};

export default function LocatorPage() {
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const fetchLocations = async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = new URL(`${apiUrl}/api/locations/search`);
      if (district) url.searchParams.append("district", district);
      if (upazila) url.searchParams.append("upazila", upazila);
      if (lat && lng) {
        url.searchParams.append("lat", lat.toString());
        url.searchParams.append("lng", lng.toString());
      }
      
      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setLocations(data.data);
        // Sprint 9: Track branch locator search
        trackEvent("locator", {
          regionType: district ? "urban" : "unknown"
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [district, upazila]);

  const handleGpsSearch = () => {
    if (!navigator.geolocation) {
      setGpsError("আপনার ডিভার্সে GPS সাপোর্ট নেই।");
      return;
    }
    
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchLocations(pos.coords.latitude, pos.coords.longitude);
        setGpsLoading(false);
      },
      (_err) => {
        setGpsError("ভৌগোলিক অবস্থান পাওয়া যায়নি। নিচে সন্ধানের মাধ্যমে খুঁজুন।");
        setGpsLoading(false);
      }
    );
  };

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">নিকটতম শাখা</h1>
        <p className="section-subtitle">
          আপনার এলাকার ব্যাংক, এজেন্ট ব্যাংকিং ও MFI
        </p>
      </div>

      <div className="p-4">
        <div className="card mb-4" style={{ padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <button 
            onClick={handleGpsSearch} 
            className="btn btn--outline" 
            style={{ width: "100%", justifyContent: "center", marginBottom: "8px" }}
            disabled={gpsLoading}
          >
            {gpsLoading ? "GPS খুঁজছে..." : "📍 আমার কাছের শাখা খুঁজুন"}
          </button>
          
          <div style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "12px", marginBottom: "8px" }}>অথবা ম্যানুয়ালি খুঁজুন</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
            <input
              type="text"
              className="input-field"
              placeholder="জেলা (যেমন: ঢাকা)"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
            <input
              type="text"
              className="input-field"
              placeholder="উপজেলা"
              value={upazila}
              onChange={(e) => setUpazila(e.target.value)}
            />
          </div>
        </div>

        {gpsError && (
          <div className="error-state mb-2" role="alert">
            <span className="error-state__icon" aria-hidden="true">⚠️</span>
            <span className="error-state__text">{gpsError}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-center" role="status" aria-live="polite">
            <span className="spinner spinner--lg" aria-hidden="true" />
            <span>লোড হচ্ছে...</span>
          </div>
        ) : locations.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon" aria-hidden="true">📍</span>
            <p className="empty-state__title">শাখা পাওয়া যায়নি</p>
            <p className="empty-state__text">অনুসন্ধানের স্থান পরিবর্তন করে আবার চেষ্টা করুন।</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {locations.map((loc) => (
              <div key={loc.id} className="card" style={{ padding: "var(--space-3)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{loc.institution_name_bn}</h3>
                  {loc.distance_km !== null && (
                    <span style={{ fontSize: "12px", background: "var(--color-primary)", color: "white", padding: "2px 8px", borderRadius: "12px" }}>
                      {loc.distance_km.toFixed(1)} কিমি
                    </span>
                  )}
                </div>
                
                <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                  {loc.branch_name} ({loc.location_type === "agent_banking" ? "এজেন্ট ব্যাংকিং" : "শাখা"})
                </p>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "8px" }}>
                  {loc.address_text}
                </p>
                
                {loc.phone_public && (
                  <p style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: "600" }}>
                    📞 {loc.phone_public}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
