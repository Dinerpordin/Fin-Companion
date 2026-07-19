"use client";

import { useState } from "react";
import AudioAssist from "../components/AudioAssist";

// Eligibility rules mapped to programs
const AGE_GROUPS = [
  { key: "child",  icon: "ðŸ§’", label: "à§§à§® à¦¬à¦›à¦°à§‡à¦° à¦¨à¦¿à¦šà§‡" },
  { key: "adult",  icon: "ðŸ‘¨", label: "à§§à§®â€“à§¬à§ª à¦¬à¦›à¦°"      },
  { key: "senior", icon: "ðŸ‘´", label: "à§¬à§« à¦¬à¦›à¦° à¦¬à¦¾ à¦¬à§‡à¦¶à¦¿" },
];

const PERSON_TYPES = [
  { key: "widow",      icon: "ðŸ‘©â€ðŸ¦³", label: "à¦¬à¦¿à¦§à¦¬à¦¾ / à¦¸à§à¦¬à¦¾à¦®à§€ à¦ªà¦°à¦¿à¦¤à§à¦¯à¦•à§à¦¤à¦¾" },
  { key: "disabled",   icon: "â™¿",   label: "à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à§€"         },
  { key: "farmer",     icon: "ðŸŒ¾",   label: "à¦•à§ƒà¦·à¦•"               },
  { key: "single_mom", icon: "ðŸ‘©â€ðŸ‘§",  label: "à¦à¦•à¦¾ à¦®à¦¾"             },
  { key: "elderly",    icon: "ðŸ‘´",   label: "à¦¬à¦¯à¦¼à¦¸à§à¦• à¦¬à§à¦¯à¦•à§à¦¤à¦¿"      },
  { key: "poor",       icon: "ðŸ ",   label: "à¦…à¦¤à¦¿ à¦¦à¦°à¦¿à¦¦à§à¦° à¦ªà¦°à¦¿à¦¬à¦¾à¦°"  },
  { key: "student",    icon: "ðŸŽ“",   label: "à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€"          },
  { key: "other",      icon: "ðŸ‘¤",   label: "à¦…à¦¨à§à¦¯"               },
];

const INCOME_BANDS = [
  { key: "zero",   label: "à¦•à§‹à¦¨à§‹ à¦†à¦¯à¦¼ à¦¨à§‡à¦‡ / à§³à§©,à§¦à§¦à§¦ à¦ªà¦°à§à¦¯à¦¨à§à¦¤" },
  { key: "low",    label: "à§³à§©,à§¦à§¦à§§ â€“ à§³à§®,à§¦à§¦à§¦"              },
  { key: "medium", label: "à§³à§®,à§¦à§¦à§§ à¦à¦° à¦¬à§‡à¦¶à¦¿"              },
];

type Program = {
  name: string;
  icon: string;
  benefit: string;
  how: string;
  docs: string;
  audio: string;
};

function getPrograms(age: string, type: string, income: string): Program[] {
  const programs: Program[] = [];

  // Old-age allowance
  if (age === "senior" && income !== "medium") {
    programs.push({
      name: "à¦¬à¦¯à¦¼à¦¸à§à¦• à¦­à¦¾à¦¤à¦¾",
      icon: "ðŸ‘´",
      benefit: "à¦®à¦¾à¦¸à§‡ à§³à§¬à§¦à§¦",
      how: "à¦¸à§à¦¥à¦¾à¦¨à§€à¦¯à¦¼ à¦‡à¦‰à¦¨à¦¿à¦¯à¦¼à¦¨ à¦ªà¦°à¦¿à¦·à¦¦ à¦¬à¦¾ à¦ªà§Œà¦°à¦¸à¦­à¦¾à¦¯à¦¼ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨",
      docs: "NID, à¦œà¦¨à§à¦® à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¨, à¦›à¦¬à¦¿, à¦¦à¦°à¦¿à¦¦à§à¦°à¦¤à¦¾à¦° à¦ªà§à¦°à¦®à¦¾à¦£",
      audio: "à¦¬à¦¯à¦¼à¦¸à§à¦• à¦­à¦¾à¦¤à¦¾: à§¬à§« à¦¬à¦›à¦° à¦¬à¦¾ à¦¬à§‡à¦¶à¦¿ à¦¬à¦¯à¦¼à¦¸à§€ à¦¦à¦°à¦¿à¦¦à§à¦° à¦¬à§à¦¯à¦•à§à¦¤à¦¿à¦¦à§‡à¦° à¦œà¦¨à§à¦¯ à¦®à¦¾à¦¸à§‡ à§¬à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾à¥¤ à¦‡à¦‰à¦¨à¦¿à¦¯à¦¼à¦¨ à¦ªà¦°à¦¿à¦·à¦¦à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨à¥¤",
    });
  }

  // Widow / deserted women allowance
  if (type === "widow" && income !== "medium") {
    programs.push({
      name: "à¦¬à¦¿à¦§à¦¬à¦¾ à¦“ à¦¸à§à¦¬à¦¾à¦®à§€ à¦ªà¦°à¦¿à¦¤à§à¦¯à¦•à§à¦¤à¦¾ à¦­à¦¾à¦¤à¦¾",
      icon: "ðŸ‘©",
      benefit: "à¦®à¦¾à¦¸à§‡ à§³à§«à§«à§¦",
      how: "à¦‡à¦‰à¦¨à¦¿à¦¯à¦¼à¦¨ à¦ªà¦°à¦¿à¦·à¦¦ à¦¬à¦¾ à¦¸à¦®à¦¾à¦œà¦¸à§‡à¦¬à¦¾ à¦…à¦«à¦¿à¦¸à§‡ à¦†à¦¬à§‡à¦¦à¦¨",
      docs: "NID, à¦¬à¦¿à¦¬à¦¾à¦¹/à¦¤à¦¾à¦²à¦¾à¦•à§‡à¦° à¦¸à¦¨à¦¦, à¦›à¦¬à¦¿, à¦¦à¦°à¦¿à¦¦à§à¦°à¦¤à¦¾à¦° à¦ªà§à¦°à¦®à¦¾à¦£",
      audio: "à¦¬à¦¿à¦§à¦¬à¦¾ à¦“ à¦¸à§à¦¬à¦¾à¦®à§€ à¦ªà¦°à¦¿à¦¤à§à¦¯à¦•à§à¦¤à¦¾ à¦­à¦¾à¦¤à¦¾: à¦ªà§à¦°à¦¤à¦¿ à¦®à¦¾à¦¸à§‡ à§«à§«à§¦ à¦Ÿà¦¾à¦•à¦¾à¥¤ à¦‡à¦‰à¦¨à¦¿à¦¯à¦¼à¦¨ à¦ªà¦°à¦¿à¦·à¦¦à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨à¥¤",
    });
  }

  // Disability allowance
  if (type === "disabled") {
    programs.push({
      name: "à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à§€ à¦­à¦¾à¦¤à¦¾",
      icon: "â™¿",
      benefit: "à¦®à¦¾à¦¸à§‡ à§³à§®à§«à§¦",
      how: "à¦‰à¦ªà¦œà§‡à¦²à¦¾ à¦¸à¦®à¦¾à¦œà¦¸à§‡à¦¬à¦¾ à¦…à¦«à¦¿à¦¸à§‡ à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤à¦¾ à¦¸à¦¨à¦¦à¦¸à¦¹ à¦†à¦¬à§‡à¦¦à¦¨",
      docs: "NID, à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤à¦¾ à¦¸à¦¨à¦¦, à¦¡à¦¾à¦•à§à¦¤à¦¾à¦°à¦¿ à¦ªà§à¦°à¦¤à¦¿à¦¬à§‡à¦¦à¦¨, à¦›à¦¬à¦¿",
      audio: "à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à§€ à¦­à¦¾à¦¤à¦¾: à¦ªà§à¦°à¦¤à¦¿ à¦®à¦¾à¦¸à§‡ à§®à§«à§¦ à¦Ÿà¦¾à¦•à¦¾à¥¤ à¦‰à¦ªà¦œà§‡à¦²à¦¾ à¦¸à¦®à¦¾à¦œà¦¸à§‡à¦¬à¦¾ à¦…à¦«à¦¿à¦¸à§‡ à¦ªà§à¦°à¦¤à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤à¦¾ à¦¸à¦¨à¦¦ à¦¨à¦¿à¦¯à¦¼à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨à¥¤",
    });
  }

  // VGD (vulnerable group development)
  if ((type === "widow" || type === "single_mom" || type === "poor") && income === "zero") {
    programs.push({
      name: "à¦­à¦¾à¦²à¦¨à¦¾à¦°à§‡à¦¬à¦² à¦—à§à¦°à§à¦ª à¦¡à§‡à¦­à§‡à¦²à¦ªà¦®à§‡à¦¨à§à¦Ÿ (VGD)",
      icon: "ðŸŒ¾",
      benefit: "à¦®à¦¾à¦¸à§‡ à§©à§¦ à¦•à§‡à¦œà¦¿ à¦šà¦¾à¦² + à¦ªà§à¦°à¦¶à¦¿à¦•à§à¦·à¦£ à¦¸à§à¦¬à¦¿à¦§à¦¾",
      how: "à¦‡à¦‰à¦¨à¦¿à¦¯à¦¼à¦¨ à¦ªà¦°à¦¿à¦·à¦¦ à¦¬à¦¾ à¦ªà§Œà¦°à¦¸à¦­à¦¾à¦¯à¦¼ à¦†à¦¬à§‡à¦¦à¦¨ (à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à§¨ à¦¬à¦›à¦° à¦ªà¦° à¦ªà¦° à¦¨à¦¬à¦¾à¦¯à¦¼à¦¨ à¦¹à¦¯à¦¼)",
      docs: "NID, à¦›à¦¬à¦¿, à¦ªà¦¾à¦°à¦¿à¦¬à¦¾à¦°à¦¿à¦• à¦¤à¦¥à§à¦¯",
      audio: "à¦­à¦¿à¦œà¦¿à¦¡à¦¿: à¦…à¦¤à¦¿ à¦¦à¦°à¦¿à¦¦à§à¦° à¦®à¦¹à¦¿à¦²à¦¾à¦¦à§‡à¦° à¦œà¦¨à§à¦¯ à¦®à¦¾à¦¸à§‡ à§©à§¦ à¦•à§‡à¦œà¦¿ à¦šà¦¾à¦² à¦à¦¬à¦‚ à¦ªà§à¦°à¦¶à¦¿à¦•à§à¦·à¦£à¥¤ à¦‡à¦‰à¦¨à¦¿à¦¯à¦¼à¦¨ à¦ªà¦°à¦¿à¦·à¦¦à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨à¥¤",
    });
  }

  // School stipend
  if (type === "student" && income !== "medium") {
    programs.push({
      name: "à¦ªà§à¦°à¦¾à¦¥à¦®à¦¿à¦• à¦“ à¦®à¦¾à¦§à§à¦¯à¦®à¦¿à¦• à¦‰à¦ªà¦¬à§ƒà¦¤à§à¦¤à¦¿",
      icon: "ðŸ“š",
      benefit: "à¦®à¦¾à¦¸à¦¿à¦• à§³à§©à§¦à§¦â€“à§³à§­à§«à§¦ (à¦¶à§à¦°à§‡à¦£à¦¿ à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à§€)",
      how: "à¦¬à¦¿à¦¦à§à¦¯à¦¾à¦²à¦¯à¦¼ à¦•à¦°à§à¦¤à§ƒà¦ªà¦•à§à¦·à§‡à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦†à¦¬à§‡à¦¦à¦¨",
      docs: "à¦œà¦¨à§à¦® à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¨, à¦…à¦­à¦¿à¦­à¦¾à¦¬à¦•à§‡à¦° NID, à¦¬à§à¦¯à¦¾à¦‚à¦• à¦¹à¦¿à¦¸à¦¾à¦¬ à¦¨à¦®à§à¦¬à¦°",
      audio: "à¦¶à¦¿à¦•à§à¦·à¦¾ à¦‰à¦ªà¦¬à§ƒà¦¤à§à¦¤à¦¿: à¦¦à¦°à¦¿à¦¦à§à¦° à¦ªà¦°à¦¿à¦¬à¦¾à¦°à§‡à¦° à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€à¦¦à§‡à¦° à¦œà¦¨à§à¦¯ à¦®à¦¾à¦¸à§‡ à§©à§¦à§¦ à¦¥à§‡à¦•à§‡ à§­à§«à§¦ à¦Ÿà¦¾à¦•à¦¾à¥¤ à¦¬à¦¿à¦¦à§à¦¯à¦¾à¦²à¦¯à¦¼ à¦¥à§‡à¦•à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨à¥¤",
    });
  }

  // Farmer input assistance
  if (type === "farmer") {
    programs.push({
      name: "à¦•à§ƒà¦·à¦¿ à¦ªà§à¦°à¦£à§‹à¦¦à¦¨à¦¾ / à¦‰à¦ªà¦•à¦°à¦£ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾",
      icon: "ðŸŒ¿",
      benefit: "à¦¬à§€à¦œ, à¦¸à¦¾à¦°, à¦•à§€à¦Ÿà¦¨à¦¾à¦¶à¦• à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ à¦¬à¦¾ à¦­à¦°à§à¦¤à§à¦•à¦¿à¦¤à§‡",
      how: "à¦‰à¦ªà¦œà§‡à¦²à¦¾ à¦•à§ƒà¦·à¦¿ à¦…à¦«à¦¿à¦¸à§‡ à¦•à§ƒà¦·à¦• à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¨ à¦•à¦°à§à¦¨",
      docs: "NID, à¦œà¦®à¦¿à¦° à¦•à¦¾à¦—à¦œ à¦¬à¦¾ à¦¬à¦°à§à¦—à¦¾à¦šà¦¾à¦·à¦¿à¦° à¦ªà§à¦°à¦®à¦¾à¦£",
      audio: "à¦•à§ƒà¦·à¦¿ à¦ªà§à¦°à¦£à§‹à¦¦à¦¨à¦¾: à¦¨à¦¿à¦¬à¦¨à§à¦§à¦¿à¦¤ à¦•à§ƒà¦·à¦•à¦¦à§‡à¦° à¦œà¦¨à§à¦¯ à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ à¦¬à¦¾ à¦­à¦°à§à¦¤à§à¦•à¦¿à¦¤à§‡ à¦¬à§€à¦œ à¦“ à¦¸à¦¾à¦°à¥¤ à¦‰à¦ªà¦œà§‡à¦²à¦¾ à¦•à§ƒà¦·à¦¿ à¦…à¦«à¦¿à¦¸à§‡ à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦— à¦•à¦°à§à¦¨à¥¤",
    });
  }

  // General poor families
  if ((income === "zero" || income === "low") && programs.length === 0) {
    programs.push({
      name: "à¦¸à¦¾à¦®à¦¾à¦œà¦¿à¦• à¦¨à¦¿à¦°à¦¾à¦ªà¦¤à§à¦¤à¦¾ à¦¤à¦¥à§à¦¯",
      icon: "ðŸ›ï¸",
      benefit: "à¦†à¦ªà¦¨à¦¾à¦° à¦‰à¦ªà¦œà§‡à¦²à¦¾à¦¯à¦¼ à¦•à§€ à¦¸à§à¦¬à¦¿à¦§à¦¾ à¦†à¦›à§‡ à¦œà¦¾à¦¨à§à¦¨",
      how: "à¦‰à¦ªà¦œà§‡à¦²à¦¾ à¦¸à¦®à¦¾à¦œà¦¸à§‡à¦¬à¦¾ à¦…à¦«à¦¿à¦¸à§‡ à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦— à¦•à¦°à§à¦¨",
      docs: "NID à¦¨à¦¿à¦¯à¦¼à§‡ à¦¯à¦¾à¦¨",
      audio: "à¦†à¦ªà¦¨à¦¾à¦° à¦‰à¦ªà¦œà§‡à¦²à¦¾à¦° à¦¸à¦®à¦¾à¦œà¦¸à§‡à¦¬à¦¾ à¦…à¦«à¦¿à¦¸à§‡ à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦— à¦•à¦°à¦²à§‡ à¦¸à§à¦¥à¦¾à¦¨à§€à¦¯à¦¼ à¦¸à§à¦¬à¦¿à¦§à¦¾ à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡ à¦œà¦¾à¦¨à¦¤à§‡ à¦ªà¦¾à¦°à¦¬à§‡à¦¨à¥¤",
    });
  }

  return programs;
}

export default function EntitlementsPage() {
  const [step,    setStep]    = useState(1);
  const [age,     setAge]     = useState("");
  const [type,    setType]    = useState("");
  const [income,  setIncome]  = useState("");
  const [results, setResults] = useState<Program[] | null>(null);

  const runCheck = (incomeKey: string) => {
    setIncome(incomeKey);
    setResults(getPrograms(age, type, incomeKey));
    setStep(4);
  };

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">ðŸ›ï¸ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯</h1>
        <p className="section-subtitle">à¦†à¦ªà¦¨à¦¿ à¦•à¦¿ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦­à¦¾à¦¤à¦¾ à¦¬à¦¾ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾à¦° à¦¯à§‹à¦—à§à¦¯?</p>
      </div>

      <div className="p-4">

        {/* Step 1 â€” Age */}
        {step === 1 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>à¦†à¦ªà¦¨à¦¾à¦° à¦¬à¦¯à¦¼à¦¸ à¦•à¦¤?</h2>
              <AudioAssist text="à¦†à¦ªà¦¨à¦¾à¦° à¦¬à¦¯à¦¼à¦¸ à¦•à¦¤? à¦¨à¦¿à¦šà§‡à¦° à¦¬à§‹à¦¤à¦¾à¦® à¦¥à§‡à¦•à§‡ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨à¥¤" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {AGE_GROUPS.map(a => (
                <button
                  key={a.key}
                  onClick={() => { setAge(a.key); setStep(2); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "16px 18px", borderRadius: "12px", border: "2px solid var(--color-border)",
                    background: "var(--color-surface)", cursor: "pointer",
                    fontSize: "16px", fontWeight: "600", fontFamily: "var(--font-body)",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: "28px" }}>{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 â€” Person type */}
        {step === 2 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>à¦†à¦ªà¦¨à¦¿ à¦•à§‡?</h2>
              <AudioAssist text="à¦†à¦ªà¦¨à¦¿ à¦•à§‡? à¦¨à¦¿à¦šà§‡à¦° à¦¬à¦¿à¦•à¦²à§à¦ªà¦—à§à¦²à§‹ à¦¥à§‡à¦•à§‡ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨à¥¤" />
            </div>
            <div className="category-grid" role="group">
              {PERSON_TYPES.map(p => (
                <button
                  key={p.key}
                  className={`category-tile${type === p.key ? " active" : ""}`}
                  aria-pressed={type === p.key}
                  onClick={() => { setType(p.key); setStep(3); }}
                >
                  <span className="category-tile__icon">{p.icon}</span>
                  <span className="category-tile__label">{p.label}</span>
                </button>
              ))}
            </div>
            <button className="btn btn--outline" onClick={() => setStep(1)} style={{ marginTop: "16px", justifyContent: "center" }}>â† à¦ªà§‡à¦›à¦¨à§‡</button>
          </div>
        )}

        {/* Step 3 â€” Income */}
        {step === 3 && (
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>à¦®à¦¾à¦¸à¦¿à¦• à¦†à¦¯à¦¼ à¦•à¦¤?</h2>
              <AudioAssist text="à¦†à¦ªà¦¨à¦¾à¦° à¦ªà¦°à¦¿à¦¬à¦¾à¦°à§‡à¦° à¦®à¦¾à¦¸à¦¿à¦• à¦†à¦¯à¦¼ à¦•à¦¤?" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {INCOME_BANDS.map(ib => (
                <button
                  key={ib.key}
                  onClick={() => runCheck(ib.key)}
                  style={{
                    padding: "16px 18px", borderRadius: "12px", border: "2px solid var(--color-border)",
                    background: "var(--color-surface)", cursor: "pointer",
                    fontSize: "16px", fontWeight: "600", fontFamily: "var(--font-body)",
                    textAlign: "left",
                  }}
                >
                  {ib.label}
                </button>
              ))}
            </div>
            <button className="btn btn--outline" onClick={() => setStep(2)} style={{ marginTop: "16px", justifyContent: "center" }}>â† à¦ªà§‡à¦›à¦¨à§‡</button>
          </div>
        )}

        {/* Step 4 â€” Results */}
        {step === 4 && results && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "15px", fontWeight: "700" }}>
              {results.length > 0
                ? `à¦†à¦ªà¦¨à¦¿ ${results.length}à¦Ÿà¦¿ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦¸à§à¦¬à¦¿à¦§à¦¾à¦° à¦œà¦¨à§à¦¯ à¦¯à§‹à¦—à§à¦¯ à¦¹à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¦¨:`
                : "à¦†à¦ªà¦¨à¦¾à¦° à¦¦à§‡à¦“à¦¯à¦¼à¦¾ à¦¤à¦¥à§à¦¯à§‡ à¦•à§‹à¦¨à§‹ à¦¨à¦¿à¦°à§à¦¦à¦¿à¦·à§à¦Ÿ à¦­à¦¾à¦¤à¦¾à¦° à¦¯à§‹à¦—à§à¦¯à¦¤à¦¾ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾ à¦¯à¦¾à¦¯à¦¼à¦¨à¦¿à¥¤"}
            </p>

            {results.map((prog, i) => (
              <div key={i} className="card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>
                      {prog.icon} {prog.name}
                    </p>
                    <p style={{ fontSize: "18px", fontWeight: "800", color: "var(--color-primary)", marginBottom: "8px" }}>
                      {prog.benefit}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                      <strong>à¦•à§€à¦­à¦¾à¦¬à§‡ à¦ªà¦¾à¦¬à§‡à¦¨:</strong> {prog.how}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                      <strong>à¦ªà§à¦°à¦¯à¦¼à§‹à¦œà¦¨à§€à¦¯à¦¼ à¦•à¦¾à¦—à¦œ:</strong> {prog.docs}
                    </p>
                  </div>
                  <AudioAssist text={prog.audio} size="sm" />
                </div>
              </div>
            ))}

            <div className="privacy-notice" role="note">
              <span className="privacy-notice__icon">â„¹ï¸</span>
              <span>à¦¯à§‹à¦—à§à¦¯à¦¤à¦¾ à¦¨à¦¿à¦°à§à¦­à¦° à¦•à¦°à§‡ à¦¸à§à¦¥à¦¾à¦¨à§€à¦¯à¦¼ à¦¬à¦°à¦¾à¦¦à§à¦¦ à¦“ à¦¤à¦¾à¦²à¦¿à¦•à¦¾à¦¯à¦¼ à¦¸à§à¦¥à¦¾à¦¨ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾à¦° à¦‰à¦ªà¦°à¥¤ à¦¸à¦ à¦¿à¦• à¦¤à¦¥à§à¦¯à§‡à¦° à¦œà¦¨à§à¦¯ à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦¸à¦®à¦¾à¦œà¦¸à§‡à¦¬à¦¾ à¦…à¦«à¦¿à¦¸à§‡ à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦— à¦•à¦°à§à¦¨à¥¤</span>
            </div>

            <button className="btn btn--outline" style={{ justifyContent: "center" }} onClick={() => { setStep(1); setAge(""); setType(""); setIncome(""); setResults(null); }}>
              ðŸ”„ à¦†à¦¬à¦¾à¦° à¦šà§‡à¦• à¦•à¦°à§à¦¨
            </button>

            <div className="disclaimer" role="note">
              à¦à¦‡ à¦¤à¦¥à§à¦¯ à¦¸à¦šà§‡à¦¤à¦¨à¦¤à¦¾à¦° à¦œà¦¨à§à¦¯ â€” à¦šà§‚à¦¡à¦¼à¦¾à¦¨à§à¦¤ à¦¯à§‹à¦—à§à¦¯à¦¤à¦¾ à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦¨à¦¿à¦¯à¦¼à¦® à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à§€ à¦¨à¦¿à¦°à§à¦§à¦¾à¦°à¦¿à¦¤ à¦¹à¦¯à¦¼à¥¤
            </div>
          </div>
        )}
      </div>
    </>
  );
}
