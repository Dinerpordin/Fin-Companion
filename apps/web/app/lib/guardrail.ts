/**
 * lib/guardrail.ts
 *
 * TypeScript port of apps/api/app/services/assistant/guardrail.py
 *
 * Checks Gemini LLM response text for advisory language that would violate
 * the application's guardrails (we must not give personalised financial advice).
 * Returns false if advisory language is detected, true if the response is safe.
 */

const ADVISORY_TERMS: string[] = [
  "আপনার উচিত",
  "বিনিয়োগ করুন",
  "best for you",
  "i advise",
  "আমি পরামর্শ দিচ্ছি",
  "সবচেয়ে ভালো হবে",
  "আপনার জন্য সেরা",
  "নিশ্চিত লাভ",
];

/**
 * Returns false if advisory language is detected in the LLM response text.
 * Note: .toLowerCase() only affects ASCII/English terms; Bangla Unicode
 * codepoints have no case distinction so they are matched as-is.
 */
export function checkGuardrails(text: string): boolean {
  if (!text) return true;
  const lower = text.toLowerCase();
  for (const term of ADVISORY_TERMS) {
    if (lower.includes(term)) return false;
  }
  return true;
}
