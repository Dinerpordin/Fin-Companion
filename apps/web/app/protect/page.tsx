"use client";

import { useState } from "react";
import AudioAssist from "../components/AudioAssist";

const RED_FLAGS = [
  {
    icon: "ðŸ’¸",
    title: "à¦…à¦¸à§à¦¬à¦¾à¦­à¦¾à¦¬à¦¿à¦• à¦¬à§‡à¦¶à¦¿ à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨à§‡à¦° à¦ªà§à¦°à¦¤à¦¿à¦¶à§à¦°à§à¦¤à¦¿",
    body: "à¦®à¦¾à¦¸à§‡ à§¨à§¦-à§©à§¦% à¦¬à¦¾ à¦¤à¦¾à¦° à¦¬à§‡à¦¶à¦¿ à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨à§‡à¦° à¦•à¦¥à¦¾ à¦¬à¦²à¦²à§‡ à¦à¦Ÿà¦¿ à¦ªà§à¦°à¦¾à¦¯à¦¼ à¦¸à¦¬à¦¸à¦®à¦¯à¦¼ à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾à¥¤ à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨ à¦¬à§à¦¯à¦¾à¦‚à¦• FD à¦°à§‡à¦Ÿ à¦®à¦¾à¦¤à§à¦° à§­-à§®% à¦¬à¦¾à¦°à§à¦·à¦¿à¦•à¥¤",
    audio: "à¦®à¦¾à¦¸à§‡ à§¨à§¦ à¦¥à§‡à¦•à§‡ à§©à§¦ à¦¶à¦¤à¦¾à¦‚à¦¶ à¦¬à¦¾ à¦¤à¦¾à¦° à¦¬à§‡à¦¶à¦¿ à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨à§‡à¦° à¦•à¦¥à¦¾ à¦¬à¦²à¦²à§‡ à¦à¦Ÿà¦¿ à¦ªà§à¦°à¦¾à¦¯à¦¼ à¦¸à¦¬à¦¸à¦®à¦¯à¦¼ à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾à¥¤ à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨ à¦¬à§à¦¯à¦¾à¦‚à¦• à¦°à§‡à¦Ÿ à¦®à¦¾à¦¤à§à¦° à§­ à¦¥à§‡à¦•à§‡ à§® à¦¶à¦¤à¦¾à¦‚à¦¶ à¦¬à¦¾à¦°à§à¦·à¦¿à¦•à¥¤",
  },
  {
    icon: "â°",
    title: "à¦à¦–à¦¨à¦‡ à¦¸à¦¿à¦¦à§à¦§à¦¾à¦¨à§à¦¤ à¦¨à¦¿à¦¤à§‡ à¦šà¦¾à¦ª à¦¦à§‡à¦“à¦¯à¦¼à¦¾",
    body: "à¦¯à§‡ à¦•à§‡à¦‰ à¦¬à¦²à§‡ 'à¦†à¦œà¦•à§‡à¦‡ à¦Ÿà¦¾à¦•à¦¾ à¦¦à¦¿à¦¨, à¦†à¦° à¦¸à§à¦¯à§‹à¦— à¦¨à§‡à¦‡' â€” à¦¸à§‡ à¦ªà§à¦°à¦¤à¦¾à¦°à¦• à¦¹à¦“à¦¯à¦¼à¦¾à¦° à¦¸à¦®à§à¦­à¦¾à¦¬à¦¨à¦¾ à¦¬à§‡à¦¶à¦¿à¥¤ à¦¬à§ˆà¦§ à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨ à¦¸à¦®à¦¯à¦¼ à¦¦à§‡à¦¯à¦¼à¥¤",
    audio: "à¦¯à§‡ à¦•à§‡à¦‰ à¦¬à¦²à§‡ à¦†à¦œà¦•à§‡à¦‡ à¦Ÿà¦¾à¦•à¦¾ à¦¦à¦¿à¦¨, à¦†à¦° à¦¸à§à¦¯à§‹à¦— à¦¨à§‡à¦‡, à¦¸à§‡ à¦ªà§à¦°à¦¤à¦¾à¦°à¦• à¦¹à¦“à¦¯à¦¼à¦¾à¦° à¦¸à¦®à§à¦­à¦¾à¦¬à¦¨à¦¾ à¦¬à§‡à¦¶à¦¿à¥¤ à¦¬à§ˆà¦§ à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨ à¦¸à¦®à¦¯à¦¼ à¦¦à§‡à¦¯à¦¼à¥¤",
  },
  {
    icon: "ðŸ’³",
    title: "à¦†à¦—à§‡ à¦«à¦¿ à¦¬à¦¾ à¦…à§à¦¯à¦¾à¦¡à¦­à¦¾à¦¨à§à¦¸ à¦šà¦¾à¦“à¦¯à¦¼à¦¾",
    body: "'à¦²à§‹à¦¨ à¦ªà§‡à¦¤à§‡ à¦†à¦—à§‡ à§«à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾ à¦ªà§à¦°à¦¸à§‡à¦¸à¦¿à¦‚ à¦«à¦¿ à¦¦à¦¿à¦¨' â€” à¦à¦Ÿà¦¿ à¦ªà§à¦°à¦¾à¦¯à¦¼ à¦¸à¦¬à¦¸à¦®à¦¯à¦¼ à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾à¥¤ à¦¬à§ˆà¦§ à¦¬à§à¦¯à¦¾à¦‚à¦• à¦¬à¦¾ MFI à¦†à¦—à§‡ à¦Ÿà¦¾à¦•à¦¾ à¦¨à§‡à¦¯à¦¼ à¦¨à¦¾à¥¤",
    audio: "à¦²à§‹à¦¨ à¦ªà§‡à¦¤à§‡ à¦†à¦—à§‡ à§«à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾ à¦ªà§à¦°à¦¸à§‡à¦¸à¦¿à¦‚ à¦«à¦¿ à¦¦à¦¿à¦¨à¥¤ à¦à¦Ÿà¦¿ à¦ªà§à¦°à¦¾à¦¯à¦¼ à¦¸à¦¬à¦¸à¦®à¦¯à¦¼ à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾à¥¤ à¦¬à§ˆà¦§ à¦¬à§à¦¯à¦¾à¦‚à¦• à¦¬à¦¾ à¦à¦®à¦à¦«à¦†à¦‡ à¦†à¦—à§‡ à¦Ÿà¦¾à¦•à¦¾ à¦¨à§‡à¦¯à¦¼ à¦¨à¦¾à¥¤",
  },
  {
    icon: "ðŸ“µ",
    title: "à¦•à§‹à¦¨à§‹ à¦²à¦¿à¦–à¦¿à¦¤ à¦•à¦¾à¦—à¦œ à¦¬à¦¾ à¦°à§‡à¦œà¦¿à¦¸à§à¦Ÿà§à¦°à§‡à¦¶à¦¨ à¦¨à§‡à¦‡",
    body: "à¦¬à§ˆà¦§ à¦†à¦°à§à¦¥à¦¿à¦• à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨ à¦¸à¦¬à¦¸à¦®à¦¯à¦¼ à¦²à¦¿à¦–à¦¿à¦¤ à¦šà§à¦•à§à¦¤à¦¿ à¦¦à§‡à¦¯à¦¼ à¦à¦¬à¦‚ à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶ à¦¬à§à¦¯à¦¾à¦‚à¦• à¦¬à¦¾ IDRA-à¦¤à§‡ à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤ à¦¥à¦¾à¦•à§‡à¥¤",
    audio: "à¦¬à§ˆà¦§ à¦†à¦°à§à¦¥à¦¿à¦• à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨ à¦¸à¦¬à¦¸à¦®à¦¯à¦¼ à¦²à¦¿à¦–à¦¿à¦¤ à¦šà§à¦•à§à¦¤à¦¿ à¦¦à§‡à¦¯à¦¼ à¦à¦¬à¦‚ à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶ à¦¬à§à¦¯à¦¾à¦‚à¦• à¦¬à¦¾ à¦†à¦‡à¦¡à¦¿à¦†à¦°à¦ à¦¤à§‡ à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤ à¦¥à¦¾à¦•à§‡à¥¤",
  },
  {
    icon: "ðŸ•µï¸",
    title: "à¦ªà¦°à¦¿à¦šà¦¿à¦¤à¦¦à§‡à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦Ÿà¦¾à¦¨à¦¾ à¦¹à¦šà§à¦›à§‡",
    body: "à¦ªà¦¿à¦°à¦¾à¦®à¦¿à¦¡ à¦¸à§à¦•à¦¿à¦®à§‡ à¦ªà§à¦°à¦¥à¦®à¦¦à¦¿à¦•à§‡ à¦²à¦¾à¦­ à¦¦à§‡à¦“à¦¯à¦¼à¦¾ à¦¹à¦¯à¦¼ à¦¬à¦¿à¦¶à§à¦¬à¦¾à¦¸ à¦…à¦°à§à¦œà¦¨à§‡à¦° à¦œà¦¨à§à¦¯à¥¤ à¦¬à¦¨à§à¦§à§ à¦¬à¦¾ à¦†à¦¤à§à¦®à§€à¦¯à¦¼ à¦¬à¦²à¦²à§‡à¦“ à¦¯à¦¾à¦šà¦¾à¦‡ à¦¨à¦¾ à¦•à¦°à§‡ à¦¬à¦¿à¦¨à¦¿à¦¯à¦¼à§‹à¦— à¦•à¦°à¦¬à§‡à¦¨ à¦¨à¦¾à¥¤",
    audio: "à¦ªà¦¿à¦°à¦¾à¦®à¦¿à¦¡ à¦¸à§à¦•à¦¿à¦®à§‡ à¦ªà§à¦°à¦¥à¦®à¦¦à¦¿à¦•à§‡ à¦²à¦¾à¦­ à¦¦à§‡à¦“à¦¯à¦¼à¦¾ à¦¹à¦¯à¦¼ à¦¬à¦¿à¦¶à§à¦¬à¦¾à¦¸ à¦…à¦°à§à¦œà¦¨à§‡à¦° à¦œà¦¨à§à¦¯à¥¤ à¦¬à¦¨à§à¦§à§ à¦¬à¦¾ à¦†à¦¤à§à¦®à§€à¦¯à¦¼ à¦¬à¦²à¦²à§‡à¦“ à¦¯à¦¾à¦šà¦¾à¦‡ à¦¨à¦¾ à¦•à¦°à§‡ à¦¬à¦¿à¦¨à¦¿à¦¯à¦¼à§‹à¦— à¦•à¦°à¦¬à§‡à¦¨ à¦¨à¦¾à¥¤",
  },
];

const CHECKLIST = [
  { q: "à¦à¦‡ à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨ à¦•à¦¿ à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶ à¦¬à§à¦¯à¦¾à¦‚à¦• à¦¬à¦¾ IDRA-à¦¤à§‡ à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤?", safe: true  },
  { q: "à¦¤à¦¾à¦°à¦¾ à¦•à¦¿ à¦®à¦¾à¦¸à§‡ à§§à§«% à¦¬à¦¾ à¦¤à¦¾à¦° à¦¬à§‡à¦¶à¦¿ à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨à§‡à¦° à¦ªà§à¦°à¦¤à¦¿à¦¶à§à¦°à§à¦¤à¦¿ à¦¦à¦¿à¦šà§à¦›à§‡?", safe: false },
  { q: "à¦¤à¦¾à¦°à¦¾ à¦•à¦¿ à¦¶à§à¦°à§à¦¤à§‡à¦‡ à¦•à§‹à¦¨à§‹ à¦«à¦¿ à¦¬à¦¾ à¦Ÿà¦¾à¦•à¦¾ à¦šà¦¾à¦‡à¦›à§‡?", safe: false },
  { q: "à¦¤à¦¾à¦°à¦¾ à¦•à¦¿ à¦²à¦¿à¦–à¦¿à¦¤ à¦šà§à¦•à§à¦¤à¦¿à¦ªà¦¤à§à¦° à¦¦à¦¿à¦¤à§‡ à¦°à¦¾à¦œà¦¿?", safe: true  },
  { q: "à¦¤à¦¾à¦°à¦¾ à¦•à¦¿ à¦à¦–à¦¨à¦‡ à¦¸à¦¿à¦¦à§à¦§à¦¾à¦¨à§à¦¤ à¦¨à¦¿à¦¤à§‡ à¦šà¦¾à¦ª à¦¦à¦¿à¦šà§à¦›à§‡?", safe: false },
];

const CONTACTS = [
  { icon: "ðŸ¦", name: "à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶ à¦¬à§à¦¯à¦¾à¦‚à¦• (DFIM)",      phone: "16236",     note: "à¦†à¦°à§à¦¥à¦¿à¦• à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨à§‡à¦° à¦¬à¦¿à¦°à§à¦¦à§à¦§à§‡ à¦…à¦­à¦¿à¦¯à§‹à¦—" },
  { icon: "ðŸ”", name: "BFIU à¦¹à§‡à¦²à§à¦ªà¦²à¦¾à¦‡à¦¨",               phone: "02-9530108", note: "à¦®à¦¾à¦¨à¦¿ à¦²à¦¨à§à¦¡à¦¾à¦°à¦¿à¦‚ à¦“ à¦†à¦°à§à¦¥à¦¿à¦• à¦…à¦ªà¦°à¦¾à¦§" },
  { icon: "ðŸ‘®", name: "RAB à¦¸à¦¾à¦‡à¦¬à¦¾à¦° à¦•à§à¦°à¦¾à¦‡à¦®",            phone: "16777",     note: "à¦…à¦¨à¦²à¦¾à¦‡à¦¨ à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾" },
  { icon: "âš–ï¸", name: "à¦­à§‹à¦•à§à¦¤à¦¾ à¦…à¦§à¦¿à¦•à¦¾à¦° à¦ªà¦°à¦¿à¦¦à¦ªà§à¦¤à¦°",       phone: "16123",     note: "à¦ªà¦£à§à¦¯ à¦“ à¦¸à§‡à¦¬à¦¾à¦¯à¦¼ à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾" },
];

export default function ProtectPage() {
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(CHECKLIST.length).fill(null));
  const [returnPct, setReturnPct] = useState("");

  const answered   = answers.filter(a => a !== null).length;
  const safeCount  = CHECKLIST.filter((c, i) => {
    if (answers[i] === null) return false;
    return c.safe ? answers[i] === true : answers[i] === false;
  }).length;

  const riskLevel =
    answered < CHECKLIST.length ? "pending" :
    safeCount >= 4 ? "safe" :
    safeCount >= 2 ? "caution" : "danger";

  const fdRate = 7.5; // approximate current FD rate %
  const monthlyPct = parseFloat(returnPct);
  const annualPct  = monthlyPct ? monthlyPct * 12 : null;
  const vsFD       = annualPct  ? (annualPct / fdRate).toFixed(1) : null;

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">ðŸ›¡ï¸ à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾ à¦¥à§‡à¦•à§‡ à¦¬à¦¾à¦à¦šà§à¦¨</h1>
        <p className="section-subtitle">à¦¸à§à¦•à¦¿à¦® à¦šà§‡à¦¨à¦¾à¦° à¦‰à¦ªà¦¾à¦¯à¦¼, à¦…à¦­à¦¿à¦¯à§‹à¦—à§‡à¦° à¦¨à¦®à§à¦¬à¦°, à¦à¦¬à¦‚ à¦¨à¦¿à¦œà§‡à¦•à§‡ à¦°à¦•à§à¦·à¦¾ à¦•à¦°à§à¦¨</p>
      </div>

      <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Section 1 â€” Red flags */}
        <section aria-labelledby="redflag-title">
          <h2 id="redflag-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "12px" }}>
            ðŸš© à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾ à¦šà§‡à¦¨à¦¾à¦° à§«à¦Ÿà¦¿ à¦²à¦•à§à¦·à¦£
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {RED_FLAGS.map((rf, i) => (
              <div key={i} className="card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: "700", fontSize: "15px", marginBottom: "6px" }}>
                      {rf.icon} {rf.title}
                    </p>
                    <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{rf.body}</p>
                  </div>
                  <AudioAssist text={rf.audio} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2 â€” Scheme checker */}
        <section aria-labelledby="checker-title">
          <h2 id="checker-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "4px" }}>
            ðŸ”Ž à¦à¦Ÿà¦¾ à¦•à¦¿ à¦¬à§ˆà¦§?
          </h2>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
            à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦ªà§à¦°à¦¶à§à¦¨à§‡à¦° à¦‰à¦¤à§à¦¤à¦° à¦¦à¦¿à¦¨ (à¦¶à§à¦§à§ à¦Ÿà§à¦¯à¦¾à¦ª à¦•à¦°à§à¦¨):
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {CHECKLIST.map((c, i) => (
              <div key={i} className="card" style={{ padding: "14px 16px" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>{c.q}</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => { const a = [...answers]; a[i] = true; setAnswers(a); }}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "10px", border: "2px solid",
                      borderColor: answers[i] === true ? "var(--color-primary)" : "var(--color-border)",
                      background: answers[i] === true ? "var(--color-primary)" : "var(--color-surface)",
                      color: answers[i] === true ? "white" : "var(--color-text-primary)",
                      fontWeight: "700", fontSize: "16px", cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                    aria-pressed={answers[i] === true}
                  >âœ… à¦¹à§à¦¯à¦¾à¦</button>
                  <button
                    onClick={() => { const a = [...answers]; a[i] = false; setAnswers(a); }}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "10px", border: "2px solid",
                      borderColor: answers[i] === false ? "var(--color-danger, #dc2626)" : "var(--color-border)",
                      background: answers[i] === false ? "var(--color-danger, #dc2626)" : "var(--color-surface)",
                      color: answers[i] === false ? "white" : "var(--color-text-primary)",
                      fontWeight: "700", fontSize: "16px", cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                    aria-pressed={answers[i] === false}
                  >âŒ à¦¨à¦¾</button>
                </div>
              </div>
            ))}
          </div>

          {answered === CHECKLIST.length && (
            <div
              className="card"
              style={{
                padding: "16px", marginTop: "12px",
                background: riskLevel === "safe" ? "var(--color-success-light, #e6f4ea)" :
                            riskLevel === "caution" ? "var(--color-warning-light, #fef7e0)" :
                            "var(--color-error-light, #fce8e6)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "18px", fontWeight: "800" }}>
                  {riskLevel === "safe"    ? "âœ… à¦¤à§à¦²à¦¨à¦¾à¦®à§‚à¦²à¦• à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦®à¦¨à§‡ à¦¹à¦šà§à¦›à§‡" :
                   riskLevel === "caution" ? "âš ï¸ à¦†à¦°à¦“ à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à§à¦¨" :
                   "ðŸ”´ à¦¸à¦®à§à¦­à¦¾à¦¬à§à¦¯ à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾!"}
                </p>
                <AudioAssist
                  size="sm"
                  text={
                    riskLevel === "safe"    ? "à¦à¦‡ à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨ à¦¤à§à¦²à¦¨à¦¾à¦®à§‚à¦²à¦• à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦®à¦¨à§‡ à¦¹à¦šà§à¦›à§‡à¥¤ à¦¤à¦¬à§ à¦¬à¦¿à¦¨à¦¿à¦¯à¦¼à§‹à¦—à§‡à¦° à¦†à¦—à§‡ à¦¸à¦¬ à¦¶à¦°à§à¦¤ à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à§à¦¨à¥¤" :
                    riskLevel === "caution" ? "à¦•à¦¿à¦›à§ à¦¸à¦¨à§à¦¦à§‡à¦¹à¦œà¦¨à¦• à¦²à¦•à§à¦·à¦£ à¦†à¦›à§‡à¥¤ à¦¬à¦¿à¦¨à¦¿à¦¯à¦¼à§‹à¦—à§‡à¦° à¦†à¦—à§‡ à¦†à¦°à¦“ à¦¯à¦¾à¦šà¦¾à¦‡ à¦•à¦°à§à¦¨à¥¤" :
                    "à¦¸à¦¤à¦°à§à¦•à¦¤à¦¾! à¦à¦Ÿà¦¿ à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾ à¦¹à¦“à¦¯à¦¼à¦¾à¦° à¦¸à¦®à§à¦­à¦¾à¦¬à¦¨à¦¾ à¦¬à§‡à¦¶à¦¿à¥¤ à¦Ÿà¦¾à¦•à¦¾ à¦¦à§‡à¦“à¦¯à¦¼à¦¾à¦° à¦†à¦—à§‡ à¦¬à¦¿à¦¶à§à¦¬à¦¸à§à¦¤ à¦•à¦¾à¦‰à¦•à§‡ à¦œà¦¿à¦œà§à¦žà§‡à¦¸ à¦•à¦°à§à¦¨à¥¤"
                  }
                />
              </div>
              <p style={{ fontSize: "13px", marginTop: "6px", color: "var(--color-text-secondary)" }}>
                {riskLevel === "safe"
                  ? "à¦¤à¦¬à§à¦“ à¦¬à¦¿à¦¨à¦¿à¦¯à¦¼à§‹à¦—à§‡à¦° à¦†à¦—à§‡ à¦²à¦¿à¦–à¦¿à¦¤ à¦šà§à¦•à§à¦¤à¦¿ à¦¨à¦¿à¦¨ à¦à¦¬à¦‚ à¦ªà¦°à¦¿à¦¬à¦¾à¦°à¦•à§‡ à¦œà¦¾à¦¨à¦¾à¦¨à¥¤"
                  : "à¦Ÿà¦¾à¦•à¦¾ à¦¦à§‡à¦“à¦¯à¦¼à¦¾à¦° à¦†à¦—à§‡ à¦¬à¦¿à¦¶à§à¦¬à¦¸à§à¦¤ à¦•à¦¾à¦‰à¦•à§‡ à¦œà¦¿à¦œà§à¦žà§‡à¦¸ à¦•à¦°à§à¦¨ à¦¬à¦¾ à¦¨à¦¿à¦šà§‡à¦° à¦¨à¦®à§à¦¬à¦°à§‡ à¦…à¦­à¦¿à¦¯à§‹à¦— à¦•à¦°à§à¦¨à¥¤"}
              </p>
            </div>
          )}
        </section>

        {/* Section 3 â€” Too good to be true calculator */}
        <section aria-labelledby="calc-title">
          <h2 id="calc-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "4px" }}>
            ðŸ§® "à¦…à¦¨à§‡à¦• à¦¬à§‡à¦¶à¦¿ à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨" à¦•à§à¦¯à¦¾à¦²à¦•à§à¦²à§‡à¦Ÿà¦°
          </h2>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
            à¦¤à¦¾à¦°à¦¾ à¦•à¦¤ à¦¶à¦¤à¦¾à¦‚à¦¶ à¦®à¦¾à¦¸à¦¿à¦• à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨à§‡à¦° à¦•à¦¥à¦¾ à¦¬à¦²à¦›à§‡?
          </p>
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
              <input
                type="number"
                className="input-field"
                placeholder="à¦¯à§‡à¦®à¦¨: à§¨à§¦"
                value={returnPct}
                onChange={e => setReturnPct(e.target.value)}
                style={{ fontSize: "20px", maxWidth: "140px" }}
              />
              <span style={{ fontSize: "18px", fontWeight: "700" }}>% à¦ªà§à¦°à¦¤à¦¿ à¦®à¦¾à¦¸</span>
            </div>
            {annualPct && vsFD && (
              <div style={{ background: "var(--color-error-light, #fce8e6)", padding: "12px", borderRadius: "10px" }}>
                <p style={{ fontWeight: "700", marginBottom: "4px" }}>
                  = à¦¬à¦¾à¦°à§à¦·à¦¿à¦• <strong>{annualPct.toFixed(0)}%</strong>
                </p>
                <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                  à¦à¦Ÿà¦¿ à¦¬à§à¦¯à¦¾à¦‚à¦• FD à¦°à§‡à¦Ÿà§‡à¦° ({fdRate}%) à¦šà§‡à¦¯à¦¼à§‡ <strong>{vsFD} à¦—à§à¦£ à¦¬à§‡à¦¶à¦¿</strong>à¥¤
                  à¦à¦‡ à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨ à¦¦à§‡à¦“à¦¯à¦¼à¦¾ à¦•à§‹à¦¨à§‹ à¦¬à§ˆà¦§ à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨à§‡à¦° à¦ªà¦•à§à¦·à§‡ à¦¸à¦®à§à¦­à¦¬ à¦¨à¦¯à¦¼à¥¤
                </p>
                <AudioAssist
                  size="sm"
                  label="à¦¶à§à¦¨à§à¦¨"
                  text={`à¦®à¦¾à¦¸à§‡ ${monthlyPct} à¦¶à¦¤à¦¾à¦‚à¦¶ à¦®à¦¾à¦¨à§‡ à¦¬à¦¾à¦°à§à¦·à¦¿à¦• ${annualPct?.toFixed(0)} à¦¶à¦¤à¦¾à¦‚à¦¶à¥¤ à¦à¦Ÿà¦¿ à¦¬à§à¦¯à¦¾à¦‚à¦• à¦°à§‡à¦Ÿà§‡à¦° ${vsFD} à¦—à§à¦£ à¦¬à§‡à¦¶à¦¿à¥¤ à¦•à§‹à¦¨à§‹ à¦¬à§ˆà¦§ à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨ à¦à¦¤ à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨ à¦¦à¦¿à¦¤à§‡ à¦ªà¦¾à¦°à§‡ à¦¨à¦¾à¥¤`}
                />
              </div>
            )}
          </div>
        </section>

        {/* Section 4 â€” Report contacts */}
        <section aria-labelledby="report-title">
          <h2 id="report-title" style={{ fontSize: "17px", fontWeight: "700", marginBottom: "12px" }}>
            ðŸ“ž à¦…à¦­à¦¿à¦¯à§‹à¦— à¦•à¦°à§à¦¨
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {CONTACTS.map((c, i) => (
              <a
                key={i}
                href={`tel:${c.phone}`}
                className="card"
                style={{ padding: "14px 16px", textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "14px" }}
              >
                <span style={{ fontSize: "28px" }}>{c.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "700", fontSize: "14px" }}>{c.name}</p>
                  <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{c.note}</p>
                </div>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--color-primary)" }}>{c.phone} ðŸ“²</span>
              </a>
            ))}
          </div>
        </section>

        <div className="disclaimer" role="note">
          à¦à¦‡ à¦ªà¦¾à¦¤à¦¾à¦° à¦¤à¦¥à§à¦¯ à¦¸à¦šà§‡à¦¤à¦¨à¦¤à¦¾à¦° à¦œà¦¨à§à¦¯à¥¤ à¦•à§‹à¦¨à§‹ à¦†à¦‡à¦¨à¦¿ à¦ªà¦°à¦¾à¦®à¦°à§à¦¶ à¦¨à¦¯à¦¼à¥¤ à¦¸à¦¿à¦¦à§à¦§à¦¾à¦¨à§à¦¤ à¦¨à§‡à¦“à¦¯à¦¼à¦¾à¦° à¦†à¦—à§‡ à¦¬à¦¿à¦¶à§à¦¬à¦¸à§à¦¤ à¦¬à§à¦¯à¦•à§à¦¤à¦¿à¦° à¦ªà¦°à¦¾à¦®à¦°à§à¦¶ à¦¨à¦¿à¦¨à¥¤
        </div>
      </div>
    </>
  );
}
