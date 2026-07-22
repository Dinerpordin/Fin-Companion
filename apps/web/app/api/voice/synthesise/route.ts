/**
 * GET & POST /api/voice/synthesise
 *
 * Highly optimized Bangla text-to-speech endpoint.
 * Cascade strategy:
 * 1. Server-side in-memory LRU Cache (Instant <5ms response).
 * 2. Kokoro TTS service (if KOKORO_TTS_URL configured).
 * 3. Google Translate TTS API (with response buffering and caching).
 * 4. Fallback 501 status (signals browser Web Speech API fallback).
 */
import { NextRequest, NextResponse } from "next/server";

const GTTS_MAX_CHARS = 200;
const KOKORO_TTS_URL = process.env.KOKORO_TTS_URL ?? "";
const KOKORO_VOICE = process.env.KOKORO_VOICE ?? "af_heart";

// Server-side in-memory audio cache for zero-latency repeats
const SERVER_CACHE_MAX = 500;
const SERVER_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const SERVER_TTS_CACHE = new Map<string, { data: ArrayBuffer; expiresAt: number }>();

function getFromCache(text: string): ArrayBuffer | null {
  const cached = SERVER_TTS_CACHE.get(text);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    SERVER_TTS_CACHE.delete(text);
    return null;
  }
  return cached.data;
}

function setToCache(text: string, data: ArrayBuffer) {
  if (SERVER_TTS_CACHE.size >= SERVER_CACHE_MAX) {
    // Evict first key
    const firstKey = SERVER_TTS_CACHE.keys().next().value;
    if (firstKey) SERVER_TTS_CACHE.delete(firstKey);
  }
  SERVER_TTS_CACHE.set(text, {
    data,
    expiresAt: Date.now() + SERVER_CACHE_TTL_MS,
  });
}

async function handleSynthesise(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return NextResponse.json({ error: "text_bn must not be empty." }, { status: 400 });
  }

  // 1. Check Server In-Memory Cache
  const cachedData = getFromCache(trimmed);
  if (cachedData) {
    return new NextResponse(cachedData, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        "X-Cache-Status": "HIT",
      },
    });
  }

  // 2. Backend 1: Kokoro TTS (if URL configured)
  if (KOKORO_TTS_URL) {
    try {
      const payload = {
        model: "kokoro",
        voice: KOKORO_VOICE,
        input: trimmed,
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
        const audioBuffer = await res.arrayBuffer();
        setToCache(trimmed, audioBuffer);
        return new NextResponse(audioBuffer, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400, s-maxage=604800",
            "X-Cache-Status": "MISS",
          },
        });
      }
      console.warn(`Kokoro TTS failed with status ${res.status}; falling back to Google TTS.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Kokoro TTS connection failed: ${msg}. falling back to Google TTS.`);
    }
  }

  // 3. Backend 2: Google Translate TTS
  try {
    const ttsText = trimmed.slice(0, GTTS_MAX_CHARS);
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

    const audioBuffer = await res.arrayBuffer();
    setToCache(trimmed, audioBuffer);

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        "X-Cache-Status": "MISS",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/voice/synthesise] Google TTS failed:", msg);
  }

  // 4. Backend 3: Browser Fallback (501)
  return NextResponse.json(
    {
      error: "TTS service unavailable. Frontend should fall back to browser Web Speech API.",
    },
    { status: 501 }
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text") || searchParams.get("text_bn") || "";
  return handleSynthesise(text);
}

export async function POST(req: NextRequest) {
  let text = "";
  try {
    const body = await req.json();
    text = body.text_bn || body.text || "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  return handleSynthesise(text);
}
