/**
 * POST /api/voice/synthesise
 *
 * TypeScript port of apps/api/app/routers/voice.py → synthesise_audio()
 *
 * Replaces the Python backend TTS endpoint.
 * Cascade strategy:
 * 1. Checks if KOKORO_TTS_URL is configured (for local/hosted Kokoro engine).
 * 2. Falls back to Google Translate TTS API (streaming).
 * 3. Falls back to 501 HTTP code, signaling client to use browser Web Speech API.
 *
 * Responses are streamed back directly as audio/mpeg.
 */
import { NextRequest, NextResponse } from "next/server";

const GTTS_MAX_CHARS = 200;
const KOKORO_TTS_URL = process.env.KOKORO_TTS_URL ?? "";
const KOKORO_VOICE = process.env.KOKORO_VOICE ?? "af_heart";

export async function POST(req: NextRequest) {
  let body: { text_bn: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = (body.text_bn ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "text_bn must not be empty." }, { status: 400 });
  }

  // -------------------------------------------------------------------------
  // Backend 1: Kokoro TTS (if URL is set)
  // -------------------------------------------------------------------------
  if (KOKORO_TTS_URL) {
    try {
      const payload = {
        model: "kokoro",
        voice: KOKORO_VOICE,
        input: text,
        response_format: "mp3",
        speed: 1.0,
      };

      const res = await fetch(`${KOKORO_TTS_URL}/v1/audio/speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return new NextResponse(res.body, {
          headers: { "Content-Type": "audio/mpeg" },
        });
      }
      console.warn(`Kokoro TTS failed with status ${res.status}; falling back to Google TTS.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Kokoro TTS connection failed: ${msg}. falling back to Google TTS.`);
    }
  }

  // -------------------------------------------------------------------------
  // Backend 2: Google Translate TTS (streamed)
  // -------------------------------------------------------------------------
  try {
    // Truncate to avoid silent failure above Google's char limit
    const ttsText = text.slice(0, GTTS_MAX_CHARS);

    const url = new URL("https://translate.google.com/translate_tts");
    url.searchParams.set("ie", "UTF-8");
    url.searchParams.set("tl", "bn");
    url.searchParams.set("client", "tw-ob");
    url.searchParams.set("q", ttsText);

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      throw new Error(`Google TTS returned HTTP ${res.status}`);
    }

    return new NextResponse(res.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=300", // Cache audio locally for 5 mins
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/voice/synthesise] Google TTS failed:", msg);
  }

  // -------------------------------------------------------------------------
  // Backend 3: Fallback (501 status)
  // -------------------------------------------------------------------------
  return NextResponse.json(
    {
      error: "TTS service unavailable. Frontend should fall back to browser Web Speech API.",
    },
    { status: 501 }
  );
}
