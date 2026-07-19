/**
 * lib/geminiClient.ts
 *
 * Centralised Gemini AI client for the Financial Companion.
 * Provides two capabilities:
 *   1. generateAssistantResponse() — AI chat (port of agent.py)
 *   2. transcribeBanglaAudio()     — Bangla STT via Gemini audio API
 *                                    (replaces banglaspeech2text/PyTorch)
 *
 * Uses the official @google/genai NPM package (same google-genai SDK as
 * the Python backend, just the Node.js flavour).
 *
 * Guardrails enforced here (mirroring agent.py):
 * - System prompt forbids personal financial advice.
 * - Response must be valid JSON.
 * - Raw user inputs are NEVER stored (enforced in callers).
 */

import { GoogleGenAI } from "@google/genai";

// ---------------------------------------------------------------------------
// Singleton client
// ---------------------------------------------------------------------------
let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your Vercel environment variables."
    );
  }
  _client = new GoogleGenAI({ apiKey });
  return _client;
}

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

// ---------------------------------------------------------------------------
// Assistant system prompt (mirrors agent.py)
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are a financial information assistant for Bangladesh.
RULES:
1. NEVER give personalised financial advice. NEVER say what someone 'should' do.
2. Reply in plain, accessible Bangla (bn-BD).
3. Do not invent rates or fees.
4. Your response MUST be valid JSON matching this schema exactly:
{
  "intent": "loan_assessment|loan_simulation|product_comparison|nearest_provider|how_to_apply|health_snapshot|accounting_help|financial_education|fraud_awareness|social_planning|government_assistance|legal_rights|emergency_guide|insurance_info|remittance_guide|out_of_scope|general_chat",
  "reply_text_bn": "Your response in Bangla.",
  "reply_text_en": "Optional english translation or empty string",
  "next_actions": ["array of 2-3 suggested follow-up prompts in Bangla"]
}`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface NextAction {
  type: string;
  target: string;
  label_bn: string;
}

export interface AssistantOutput {
  intent: string;
  reply_text_bn: string;
  reply_text_en?: string;
  next_actions: NextAction[];
}

// ---------------------------------------------------------------------------
// generateAssistantResponse — port of agent.py::generate_response()
// ---------------------------------------------------------------------------
export async function generateAssistantResponse(
  prompt: string
): Promise<AssistantOutput> {
  const fallback = (reason: string): AssistantOutput => {
    console.warn(`[geminiClient] Falling back. Reason: ${reason}`);
    return {
      intent: "general_chat",
      reply_text_bn:
        "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। একটু পরে আবার চেষ্টা করুন।",
      reply_text_en: `Sorry, I cannot process your request right now. Error: ${reason}`,
      next_actions: [
        { type: "chat", target: "/companion", label_bn: "ঋণ সম্পর্কে জানতে চাই" },
        {
          type: "chat",
          target: "/companion",
          label_bn: "ডিপিএস সম্পর্কে জানতে চাই",
        },
      ],
    };
  };

  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "";
    const data = JSON.parse(text) as Partial<AssistantOutput> & {
      next_actions?: (string | NextAction)[];
    };

    // Normalise next_actions: API may return string[] instead of NextAction[]
    const rawActions = data.next_actions ?? [];
    const nextActions: NextAction[] = rawActions.map((a) =>
      typeof a === "string"
        ? { type: "chat", target: "/companion", label_bn: a }
        : a
    );

    return {
      intent: data.intent ?? "general_chat",
      reply_text_bn: data.reply_text_bn ?? "আমি বুঝতে পারিনি।",
      reply_text_en: data.reply_text_en,
      next_actions: nextActions,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[geminiClient] generateAssistantResponse error: ${msg}`);
    return fallback(msg);
  }
}

// ---------------------------------------------------------------------------
// transcribeBanglaAudio — replaces banglaspeech2text / PyTorch
// Accepts a Buffer of WebM/WAV audio and returns a Bangla transcript.
// ---------------------------------------------------------------------------
export async function transcribeBanglaAudio(
  audioBuffer: Buffer,
  mimeType: string = "audio/webm"
): Promise<{ transcript_bn: string; confidence: number }> {
  try {
    const client = getClient();
    const base64Audio = audioBuffer.toString("base64");

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Audio,
              },
            },
            {
              text: "Transcribe this audio to text. The audio is in Bangla (Bengali). Return ONLY the transcribed text, no explanations.",
            },
          ],
        },
      ],
    });

    const transcript = (response.text ?? "").trim();
    return { transcript_bn: transcript, confidence: 0.9 };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[geminiClient] transcribeBanglaAudio error: ${msg}`);
    return {
      transcript_bn: "দুঃখিত, ভয়েস বুঝতে সমস্যা হয়েছে।",
      confidence: 0.0,
    };
  }
}
