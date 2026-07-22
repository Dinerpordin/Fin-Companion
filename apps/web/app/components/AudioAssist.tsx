"use client";

import { useState, useRef, useEffect } from "react";
import { API_BASE } from "../lib/apiUrl";

type AudioAssistProps = {
  text: string;
  size?: "sm" | "md";
  /** Optional text label shown next to the speaker icon */
  label?: string;
  /** If true, automatically plays audio on first mount */
  autoPlay?: boolean;
};

// Global in-memory cache for audio Object URLs across component renders
const CLIENT_AUDIO_CACHE = new Map<string, string>();

export default function AudioAssist({ text, size = "md", label, autoPlay = false }: AudioAssistProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    // Pre-warm browser speech synthesis engine on mount to eliminate cold-start delay
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      // Stop audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-play on mount if requested (once only)
  useEffect(() => {
    if (autoPlay && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true;
      const t = setTimeout(() => playBrowserSpeech(), 400);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

  const playAudioUrl = async (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    audio.onended = () => {
      setIsPlaying(false);
    };

    audio.onerror = () => {
      console.error("Audio playback error");
      setIsPlaying(false);
      setIsLoading(false);
      playBrowserSpeech(); // Fallback on playback error
    };

    await audio.play();
  };

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If currently playing, stop it
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    // 1. Instant Playback if audio is already cached in memory
    const cachedUrl = CLIENT_AUDIO_CACHE.get(text);
    if (cachedUrl) {
      setIsLoading(false);
      try {
        await playAudioUrl(cachedUrl);
        return;
      } catch (err) {
        console.warn("[AudioAssist] Cached audio playback failed, re-fetching:", err);
      }
    }

    setIsLoading(true);
    try {
      // Use GET request with encodeURIComponent to leverage browser HTTP cache
      const res = await fetch(`${API_BASE}/voice/synthesise?text=${encodeURIComponent(text)}`);

      if (res.status === 501) {
        setIsLoading(false);
        playBrowserSpeech();
        return;
      }

      if (!res.ok) throw new Error(`TTS failed with status ${res.status}`);

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);

      // Store in client-side memory cache for zero latency on repeat clicks
      CLIENT_AUDIO_CACHE.set(text, audioUrl);

      await playAudioUrl(audioUrl);
    } catch (err) {
      console.error("[AudioAssist] TTS endpoint failed, falling back:", err);
      setIsLoading(false);
      playBrowserSpeech();
    }
  };

  const playBrowserSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "bn-BD";

      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(false);
      alert("দুঃখিত, আপনার ব্রাউজারে ভয়েস সমর্থন নেই।");
    }
  };

  const btnSize = size === "sm" ? "32px" : "40px";
  const iconSize = size === "sm" ? "14px" : "18px";

  if (label) {
    return (
      <button
        onClick={handlePlay}
        aria-label={isPlaying ? "থামুন" : `শুনুন: ${text.substring(0, 30)}`}
        title="লেখাটি শুনুন"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          borderRadius: "24px",
          border: "1.5px solid var(--color-border)",
          background: isPlaying ? "var(--color-primary)" : "var(--color-surface)",
          color: isPlaying ? "white" : "var(--color-primary)",
          cursor: "pointer",
          fontSize: size === "sm" ? "13px" : "15px",
          fontWeight: 600,
          fontFamily: "var(--font-body)",
          transition: "all var(--transition-fast)",
          boxShadow: "var(--shadow-sm)",
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid currentColor", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        ) : isPlaying ? (
          <span>⏹</span>
        ) : (
          <span>🔊</span>
        )}
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handlePlay}
      aria-label={`লেখাটি শুনুন: ${text.substring(0, 30)}`}
      title="লেখাটি শুনুন"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: btnSize,
        height: btnSize,
        minWidth: btnSize,
        minHeight: btnSize,
        borderRadius: "50%",
        border: "1.5px solid var(--color-border)",
        background: isPlaying ? "var(--color-primary-light, #00875F)" : "var(--color-surface)",
        color: isPlaying ? "white" : "var(--color-primary)",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
        padding: 0,
        boxShadow: "var(--shadow-sm)",
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid var(--color-primary)", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      ) : isPlaying ? (
        <span style={{ fontSize: iconSize }}>⏹</span>
      ) : (
        <span style={{ fontSize: iconSize }}>🔊</span>
      )}
    </button>
  );
}
