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

export default function AudioAssist({ text, size = "md", label, autoPlay = false }: AudioAssistProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
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
      // Small delay so the page is settled before speaking
      const t = setTimeout(() => playBrowserSpeech(), 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

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

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/voice/synthesise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text_bn: text }),
      });

      if (res.status === 501) {
        // Fallback to browser Web Speech API
        playBrowserSpeech();
        return;
      }

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
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
    } catch (err) {
      console.error("[AudioAssist] TTS endpoint failed, falling back:", err);
      setIsLoading(false);
      playBrowserSpeech();
    }
  };

  const playBrowserSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Cancel current playbacks
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

  // If a label is provided, render as a pill with text; otherwise render as circular icon
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
