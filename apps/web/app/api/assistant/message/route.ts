/**
 * POST /api/assistant/message
 *
 * Port of apps/api/app/routers/assistant.py → send_message()
 * AI Financial Companion endpoint powered by Gemini.
 *
 * Guardrails:
 * - PII stripped before sending to Gemini
 * - Advisory language rejected after receiving response
 * - Disclaimer appended to every response
 * - Raw inputs never stored
 */
import { NextRequest, NextResponse } from "next/server";
import { generateAssistantResponse } from "@/app/lib/geminiClient";
import { checkGuardrails } from "@/app/lib/guardrail";
import { removePii } from "@/app/lib/piiFilter";

const DISCLAIMER_BN =
  "এটি শুধু তথ্য প্রদান করে। এটি ব্যক্তিগত আর্থিক পরামর্শ নয়। কোনো সিদ্ধান্ত নেওয়ার আগে বিশেষজ্ঞের পরামর্শ নিন।";
const DISCLAIMER_EN =
  "This provides information only and is not personal financial advice. Please consult a professional before making financial decisions.";

export async function POST(req: NextRequest) {
  let body: { session_id: string; message: string; locale?: string; channel?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, session_id } = body;
  if (!session_id || !message?.trim()) {
    return NextResponse.json({ error: "session_id and message are required" }, { status: 422 });
  }

  // 1. Strip PII
  const safeMessage = removePii(message.trim());

  // 2. Get response from Gemini
  const agentOutput = await generateAssistantResponse(safeMessage);
  const replyBn = agentOutput.reply_text_bn;

  // 3. Guardrails — reject advisory language
  if (!checkGuardrails(replyBn)) {
    return NextResponse.json({
      intent: "out_of_scope",
      reply_text_bn: "দুঃখিত, আমি ব্যক্তিগত আর্থিক পরামর্শ দিতে পারি না।",
      reply_text_en: "Sorry, I cannot provide personal financial advice.",
      disclaimer_bn: DISCLAIMER_BN,
      disclaimer_en: DISCLAIMER_EN,
      next_actions: [],
      structured_payload: {},
    });
  }

  return NextResponse.json({
    intent: agentOutput.intent,
    reply_text_bn: replyBn,
    reply_text_en: agentOutput.reply_text_en ?? "",
    disclaimer_bn: DISCLAIMER_BN,
    disclaimer_en: DISCLAIMER_EN,
    next_actions: agentOutput.next_actions,
    structured_payload: {},
  });
}
