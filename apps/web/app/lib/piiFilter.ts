/**
 * lib/piiFilter.ts
 *
 * TypeScript port of apps/api/app/services/assistant/pii_filter.py
 *
 * Strips likely PII (National ID numbers and bank account numbers) from
 * user input before it is sent to the Gemini AI model.
 * Raw financial identifiers are NEVER forwarded to external APIs.
 */

/**
 * Removes 10, 13, and 17-digit NID numbers and 14-16 digit bank account
 * numbers from the provided text, replacing them with safe placeholders.
 */
export function removePii(text: string): string {
  if (!text) return text;

  // Remove 10, 13, or 17-digit NID numbers
  let safe = text.replace(/\b\d{10}\b|\b\d{13}\b|\b\d{17}\b/g, "[NID REMOVED]");

  // Remove 14–16 digit bank account numbers
  safe = safe.replace(/\b\d{14,16}\b/g, "[ACCOUNT REMOVED]");

  return safe;
}
