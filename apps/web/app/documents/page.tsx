"use client";

import { useState, useEffect } from "react";

type Checklist = {
  id: string;
  institution_name_bn: string;
  product_category: string;
  checklist_bn: string[];
  verified_at: string;
};

export default function DocumentsPage() {
  const [institution, setInstitution] = useState("");
  const [category, setCategory] = useState("personal_loan");
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchChecklists() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const url = new URL(`${apiUrl}/api/checklists`);
        if (institution) url.searchParams.append("institution_id", institution);
        if (category) url.searchParams.append("product_category", category);
        
        const res = await fetch(url.toString());
        const data = await res.json();
        if (data.success) {
          setChecklists(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchChecklists();
  }, [institution, category]);

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">প্রয়োজনীয় নথি</h1>
        <p className="section-subtitle">
          আবেদনের আগে কী কী তৈরি রাখতে হবে
        </p>
      </div>

      <div className="p-4">
        <div className="card mb-4" style={{ padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <select
            className="input-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="personal_loan">ব্যক্তিগত লোন</option>
            <option value="fd">ফিক্সড ডিপোজিট (FD)</option>
            <option value="dps">ডিপিএস (DPS)</option>
            <option value="savings">সঞ্চয় হিসাব</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>লোড হচ্ছে...</p>
          </div>
        ) : checklists.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon" aria-hidden="true">📄</span>
            <p className="empty-state__title">নথি পাওয়া যায়নি</p>
            <p className="empty-state__text">অনুগ্রহ করে অন্য ক্যাটাগরি বেছে নিন।</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {checklists.map((checklist) => (
              <div key={checklist.id} className="card" style={{ padding: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700" }}>
                    {checklist.institution_name_bn}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span className="freshness-dot freshness-dot--fresh" aria-hidden="true" title="সম্প্রতি যাচাইকৃত" />
                  </div>
                </div>
                
                <ul style={{ paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                  {checklist.checklist_bn.map((item, idx) => (
                    <li key={idx} style={{ color: "var(--color-text)" }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="disclaimer mt-4" role="note">
          সকল তালিকা ব্যাংকের সরকারি তথ্যের ভিত্তিতে তৈরি। নিরপেক্ষ তথ্য মাত্র।
        </div>
      </div>
    </>
  );
}
