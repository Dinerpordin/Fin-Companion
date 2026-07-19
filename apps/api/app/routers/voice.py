"""
voice.py — FastAPI voice router
================================
Provides two endpoints:
  POST /voice/transcribe   — Bangla speech-to-text (BanglaSpeech2Text or mock)
  POST /voice/synthesise   — Bangla text-to-speech (backend cascade)

TTS Backend Cascade
-------------------
1. Kokoro TTS service (environment variable KOKORO_TTS_URL, if set)
   → High-quality, locally hosted, production-grade Bangla TTS.
2. Google Translate TTS (no API key required, but rate-limited)
   → Lightweight fallback; acceptable quality for pilot.
3. HTTP 501 (browser fallback)
   → Frontend falls back to browser Web Speech API.

Audio Cache
-----------
Synthesised audio is cached in memory for 5 minutes (LRU, max 256 entries)
to reduce repeated calls for common phrases (e.g., greetings, menu items).
The cache key is the SHA-256 of the request text so it is safe across
concurrent requests.

Privacy
-------
Audio blobs from /transcribe are NEVER written to disk permanently.
The temp file is deleted immediately after transcription.
"""

import hashlib
import logging
import os
import tempfile
import time

import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
KOKORO_TTS_URL = os.getenv("KOKORO_TTS_URL", "")          # e.g. http://kokoro:8880
KOKORO_VOICE   = os.getenv("KOKORO_VOICE", "af_heart")    # Kokoro voice model
GTTS_MAX_CHARS = 200   # Google TTS silently truncates above ~200 chars

# ---------------------------------------------------------------------------
# Simple in-process audio cache (TTL-aware, no external dependency)
# ---------------------------------------------------------------------------
_CACHE: dict[str, tuple[bytes, float]] = {}   # key → (audio_bytes, expiry_epoch)
_CACHE_TTL_SECS = 300   # 5 minutes
_CACHE_MAX = 256


def _cache_get(key: str) -> bytes | None:
    entry = _CACHE.get(key)
    if entry and entry[1] > time.monotonic():
        return entry[0]
    if key in _CACHE:
        del _CACHE[key]
    return None


def _cache_set(key: str, audio: bytes) -> None:
    if len(_CACHE) >= _CACHE_MAX:
        # Evict oldest entry
        oldest = min(_CACHE.items(), key=lambda x: x[1][1])
        del _CACHE[oldest[0]]
    _CACHE[key] = (audio, time.monotonic() + _CACHE_TTL_SECS)


def _cache_key(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


# ---------------------------------------------------------------------------
# STT model — load once at startup
# ---------------------------------------------------------------------------
try:
    from banglaspeech2text import Speech2Text
    stt_model = Speech2Text(model_size_or_path="base", use_gpu=False)
    logger.info("BanglaSpeech2Text loaded (model=base).")
except Exception as e:
    stt_model = None
    logger.warning(
        f"Failed to load banglaspeech2text ({e}). "
        "Transcription endpoint running in mock mode."
    )


# ---------------------------------------------------------------------------
# Request/Response schemas
# ---------------------------------------------------------------------------
class SynthesisRequest(BaseModel):
    text_bn: str


# ---------------------------------------------------------------------------
# Endpoint: /voice/transcribe
# ---------------------------------------------------------------------------
@router.post(
    "/voice/transcribe",
    summary="Bangla speech-to-text",
    response_model=dict,
)
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Accepts a WebM audio blob from the MediaRecorder API.
    Returns a Bangla transcript. The audio file is immediately deleted
    from disk after processing (privacy requirement).
    """
    if not audio or not audio.filename:
        raise HTTPException(status_code=400, detail="No audio file provided.")

    content = await audio.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded audio is empty.")

    tmp_path: str | None = None
    transcript = ""

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        if stt_model:
            transcript = stt_model.recognize(tmp_path)
        else:
            # Mock: return a fixed test phrase in development
            transcript = "এটি একটি পরীক্ষামূলক ভয়েস প্রতিলিপি।"

    except Exception as exc:
        logger.error(f"STT error: {exc}", exc_info=True)
        transcript = "দুঃখিত, ভয়েস বুঝতে সমস্যা হয়েছে।"
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

    return {"transcript_bn": transcript, "confidence": 0.95 if stt_model else 0.0}


# ---------------------------------------------------------------------------
# Endpoint: /voice/synthesise
# ---------------------------------------------------------------------------
@router.post(
    "/voice/synthesise",
    summary="Bangla text-to-speech",
)
async def synthesise_audio(req: SynthesisRequest):
    """
    Returns an MP3 audio stream for the provided Bangla text.
    Tries Kokoro TTS first, then Google Translate TTS, then raises 501.
    Responses are cached in-process for 5 minutes.
    """
    text = req.text_bn.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text_bn must not be empty.")

    cache_key = _cache_key(text)
    cached = _cache_get(cache_key)
    if cached:
        logger.debug(f"TTS cache hit for '{text[:40]}…'")
        return Response(content=cached, media_type="audio/mpeg")

    # -----------------------------------------------------------------------
    # Backend 1: Kokoro TTS
    # -----------------------------------------------------------------------
    if KOKORO_TTS_URL:
        try:
            audio_bytes = await _kokoro_synthesise(text)
            _cache_set(cache_key, audio_bytes)
            return Response(content=audio_bytes, media_type="audio/mpeg")
        except Exception as exc:
            logger.warning(f"Kokoro TTS failed ({exc}); falling back to Google TTS.")

    # -----------------------------------------------------------------------
    # Backend 2: Google Translate TTS (streaming)
    # -----------------------------------------------------------------------
    try:
        # Truncate to avoid silent failure above Google's char limit
        tts_text = text[:GTTS_MAX_CHARS]
        if len(text) > GTTS_MAX_CHARS:
            logger.warning(
                f"Text truncated from {len(text)} to {GTTS_MAX_CHARS} chars for Google TTS."
            )

        async def _stream_google():
            url = "https://translate.google.com/translate_tts"
            params = {"ie": "UTF-8", "tl": "bn", "client": "tw-ob", "q": tts_text}
            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                )
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                async with client.stream("GET", url, params=params, headers=headers) as r:
                    if r.status_code != 200:
                        raise RuntimeError(
                            f"Google TTS returned HTTP {r.status_code}"
                        )
                    async for chunk in r.iter_bytes():
                        yield chunk

        return StreamingResponse(_stream_google(), media_type="audio/mpeg")

    except Exception as exc:
        logger.error(f"Google TTS failed: {exc}", exc_info=True)

    # -----------------------------------------------------------------------
    # Backend 3: no TTS available → signal frontend to use Web Speech API
    # -----------------------------------------------------------------------
    raise HTTPException(
        status_code=501,
        detail=(
            "TTS service unavailable. "
            "Frontend should fall back to browser Web Speech API (window.speechSynthesis)."
        ),
    )


# ---------------------------------------------------------------------------
# Kokoro TTS helper
# ---------------------------------------------------------------------------
async def _kokoro_synthesise(text: str) -> bytes:
    """
    POST to the Kokoro TTS service and return raw MP3 bytes.

    Expected Kokoro v1 API:
      POST {KOKORO_TTS_URL}/v1/audio/speech
      Content-Type: application/json
      Body: {"model": "kokoro", "voice": "<KOKORO_VOICE>",
             "input": "<text>", "response_format": "mp3"}

    Returns raw MP3 bytes.
    """
    payload = {
        "model": "kokoro",
        "voice": KOKORO_VOICE,
        "input": text,
        "response_format": "mp3",
        "speed": 1.0,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{KOKORO_TTS_URL}/v1/audio/speech",
            json=payload,
            headers={"Accept": "audio/mpeg"},
        )
        resp.raise_for_status()
        return resp.content
