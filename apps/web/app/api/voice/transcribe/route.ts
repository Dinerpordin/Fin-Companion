/**
 * POST /api/voice/transcribe
 *
 * Replaces apps/api/app/routers/voice.py → transcribe_audio()
 *
 * Accepts a WebM audio blob from the browser's MediaRecorder API.
 * Forwards the audio to Gemini's audio transcription API.
 * Returns a Bangla transcript.
 *
 * Privacy: audio is processed in-memory and NEVER written to disk or stored.
 */
import { NextRequest, NextResponse } from "next/server";
import { transcribeBanglaAudio } from "@/app/lib/geminiClient";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Uploaded audio is empty." }, { status: 400 });
    }

    const buffer = Buffer.from(arrayBuffer);
    const mimeType = audioFile.type || "audio/webm";

    // Transcribe using Gemini (replaces banglaspeech2text / PyTorch)
    const result = await transcribeBanglaAudio(buffer, mimeType);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/voice/transcribe]", msg);
    return NextResponse.json(
      { transcript_bn: "দুঃখিত, ভয়েস বুঝতে সমস্যা হয়েছে।", confidence: 0.0 },
      { status: 500 }
    );
  }
}
