/**
 * GET  /api/whatsapp/webhook — Meta webhook verification
 * POST /api/whatsapp/webhook — receive incoming WhatsApp messages
 *
 * Port of apps/api/app/routers/whatsapp.py
 *
 * Note: Vercel serverless functions are stateless HTTP handlers — they satisfy
 * Meta's webhook requirements. Background processing is handled inline
 * (the function awaits the response before returning 200 OK).
 */
import { NextRequest, NextResponse } from "next/server";
import { generateAssistantResponse } from "@/app/lib/geminiClient";
import { checkGuardrails } from "@/app/lib/guardrail";
import { removePii } from "@/app/lib/piiFilter";

const DISCLAIMER_BN =
  "এটি শুধু তথ্য প্রদান করে। এটি ব্যক্তিগত আর্থিক পরামর্শ নয়। কোনো সিদ্ধান্ত নেওয়ার আগে বিশেষজ্ঞের পরামর্শ নিন।";

/** GET — Meta webhook verification handshake */
export async function GET(req: NextRequest) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!verifyToken) {
    return NextResponse.json({ error: "Webhook verification is disabled (token not configured)" });
  }

  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "Invalid token" }, { status: 403 });
}

/** POST — receive and process incoming WhatsApp messages */
export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch {
    return NextResponse.json({ status: "bad_request" }, { status: 400 });
  }

  try {
    type Entry = { changes?: { value?: { messages?: { type: string; from: string; text?: { body: string } }[] } }[] };
    const entries = (payload.entry ?? []) as Entry[];

    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        for (const message of change.value?.messages ?? []) {
          if (message.type !== "text") continue;

          const safeMsg = removePii(message.text?.body ?? "");
          const output = await generateAssistantResponse(safeMsg);
          let replyBn = output.reply_text_bn;

          if (!checkGuardrails(replyBn)) {
            replyBn = "দুঃখিত, আমি ব্যক্তিগত আর্থিক পরামর্শ দিতে পারি না।";
          }

          const whatsappResponse = `${replyBn}\n\n_${DISCLAIMER_BN}_`;
          // TODO: POST whatsappResponse to Meta Graph API / Twilio for message.from
          console.info(`[whatsapp] Response for ${message.from}: ${whatsappResponse.slice(0, 80)}…`);
        }
      }
    }
  } catch (err: unknown) {
    console.error("[POST /api/whatsapp/webhook]", err);
  }

  // Always return 200 to Meta quickly
  return NextResponse.json({ status: "accepted" });
}
