"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { trackEvent } from "../utils/analytics";
import { API_BASE } from "../lib/apiUrl";

const SUGGESTED_PROMPTS = [
  { text: "পাইলট ওয়ালকথ্রু শুরু করুন",               icon: "🎯" },
  { text: "আমার ঋণ আসলে কত পড়ছে?",             icon: "🔍" },
  { text: "ভাতার জন্য আবেদন কীভাবে করব?",         icon: "🏛️" },
  { text: "বন্যায় কী করব?",                       icon: "🆘" },
  { text: "বিয়ের খরচ কীভাবে হিসাব করব?",          icon: "💍" },
  { text: "বীমা কী ও এর গুরুত্ব কী?",               icon: "🌱" },
  { text: "প্রতারণা কীভাবে এড়ানো যায়?",          icon: "🛡️" },
];

type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  disclaimer?: string;
  nextActions?: { label_bn: string; target: string }[];
};

// Client-side cache for companion voice synthesis
const COMPANION_TTS_CACHE = new Map<string, string>();

export default function CompanionPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunks = useRef<Blob[]>([]);

  const [sessionId] = useState(() => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(7));
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();

  // Auto-send the ?q= query param on page load (from home page links / pilot walkthrough)
  const autoSentRef = useRef(false);
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !autoSentRef.current) {
      autoSentRef.current = true;
      sendMessage(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcriptPreview]);

  const playSynthesis = async (text: string) => {
    try {
      // 1. Instant Playback from client cache if available
      const cachedUrl = COMPANION_TTS_CACHE.get(text);
      if (cachedUrl) {
        const audio = new Audio(cachedUrl);
        audio.play();
        return;
      }

      // 2. GET request with browser/CDN caching
      const res = await fetch(`${API_BASE}/voice/synthesise?text=${encodeURIComponent(text)}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        COMPANION_TTS_CACHE.set(text, url);
        const audio = new Audio(url);
        audio.play();
      } else {
        // Fallback to browser native Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'bn-BD';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      // Fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    // 1. Check for native browser SpeechRecognition for instant zero-latency STT
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'bn-BD';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognitionRef.current = recognition;

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setTranscriptPreview(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("[SpeechRecognition] Native recognition error, falling back to MediaRecorder:", event.error);
          fallbackToMediaRecorder();
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        setIsRecording(true);
        return;
      } catch (err) {
        console.warn("[SpeechRecognition] Initialization failed, falling back:", err);
      }
    }

    // 2. Fallback to MediaRecorder + Gemini API
    fallbackToMediaRecorder();
  };

  const fallbackToMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("মাইক্রোফোন ব্যবহারের অনুমতি দিন।");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("audio", blob, "audio.webm");

    try {
      const res = await fetch(`${API_BASE}/voice/transcribe`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setTranscriptPreview(data.transcript_bn || "দুঃখিত, ভয়েস বুঝতে সমস্যা হয়েছে।");
    } catch (err) {
      console.error("Transcription error", err);
      setTranscriptPreview("সার্ভারের সাথে সংযোগ করা যায়নি।");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTranscriptPreview(""); // clear preview if any
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/assistant/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          locale: "bn-BD",
          message: text,
          channel: "web_text"
        }),
      });
      const data = await res.json();
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: data.reply_text_bn,
        disclaimer: data.disclaimer_bn,
        nextActions: data.next_actions
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Sprint 9: Track AI Companion query intent
      trackEvent("companion", {
        intentClass: data.intent as any
      });

      // Play synthesized audio response
      if (data.reply_text_bn) {
        playSynthesis(data.reply_text_bn);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev, 
        { id: (Date.now() + 1).toString(), sender: "assistant", text: "দুঃখিত, সংযোগে সমস্যা হয়েছে।" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestClick = (text: string) => {
    sendMessage(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - var(--header-height) - var(--nav-height))" }}>
      <div className="section-header" style={{ paddingBottom: "8px" }}>
        <h1 className="section-title">AI সহায়ক</h1>
        <p className="section-subtitle">
          বাংলায় আর্থিক প্রশ্ন করুন — ব্যক্তিগত পরামর্শ ছাড়াই
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {messages.length === 0 && (
          <div className="card">
            <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
              সাধারণ প্রশ্নগুলো
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestClick(prompt.text)}
                  className="btn btn--secondary"
                  style={{ justifyContent: "flex-start", textAlign: "left", fontSize: "14px" }}
                >
                  <span aria-hidden="true">{prompt.icon}</span>
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            style={{ 
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%"
            }}
          >
            <div 
              style={{ 
                padding: "12px 16px", 
                borderRadius: "16px",
                borderBottomRightRadius: msg.sender === "user" ? "4px" : "16px",
                borderBottomLeftRadius: msg.sender === "assistant" ? "4px" : "16px",
                background: msg.sender === "user" ? "var(--color-primary)" : "var(--color-surface-2)",
                color: msg.sender === "user" ? "white" : "var(--color-text)",
                fontSize: "15px",
                lineHeight: "1.5"
              }}
            >
              {msg.text}
            </div>
            
            {msg.sender === "assistant" && msg.disclaimer && (
              <div style={{ fontSize: "11px", color: "var(--color-gray-500)", marginTop: "4px", padding: "0 4px" }}>
                {msg.disclaimer}
              </div>
            )}
            
            {msg.sender === "assistant" && msg.nextActions && msg.nextActions.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                {msg.nextActions.map((action, i) => {
                  const isRoute = action.target && action.target.startsWith("/") && action.target !== "/companion";
                  if (isRoute) {
                    return (
                      <Link
                        key={i}
                        href={action.target}
                        className="chip"
                        style={{
                          fontSize: "12px",
                          padding: "6px 12px",
                          textDecoration: "none",
                          background: "var(--color-primary-light, #e6f4f0)",
                          border: "1.5px solid var(--color-primary)",
                          color: "var(--color-primary)",
                          fontWeight: "600",
                          borderRadius: "16px",
                          display: "inline-flex",
                          alignItems: "center"
                        }}
                      >
                        {action.label_bn} →
                      </Link>
                    );
                  }
                  return (
                    <button 
                      key={i}
                      onClick={() => handleSuggestClick(action.label_bn)}
                      className="chip"
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                    >
                      {action.label_bn}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        
        {transcriptPreview && (
          <div className="card" style={{ alignSelf: "flex-end", maxWidth: "85%", border: "2px solid var(--color-primary)", padding: "12px" }}>
            <p style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: "600", marginBottom: "8px" }}>ভয়েস প্রিভিউ (সংশোধন করতে পারেন):</p>
            <textarea 
              className="input-field" 
              value={transcriptPreview} 
              onChange={e => setTranscriptPreview(e.target.value)}
              style={{ width: "100%", minHeight: "60px", marginBottom: "8px" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn--outline" onClick={() => setTranscriptPreview("")} style={{ flex: 1, padding: "8px" }}>বাতিল</button>
              <button className="btn btn--primary" onClick={() => sendMessage(transcriptPreview)} style={{ flex: 1, padding: "8px" }}>পাঠান</button>
            </div>
          </div>
        )}

        {isLoading && !transcriptPreview && (
          <div style={{ alignSelf: "flex-start", padding: "12px 16px", borderRadius: "16px", background: "var(--color-surface-2)" }}>
            <span style={{ fontSize: "14px", color: "var(--color-text-tertiary)" }}>ভাবছে...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Large floating mic button — always visible */}
      <button
        type="button"
        className={`mic-btn ${isRecording ? "recording" : ""}`}
        onClick={isRecording ? stopRecording : startRecording}
        aria-label={isRecording ? "রেকর্ডিং বন্ধ করুন" : "কথা বলুন — মাইক্রোফোন"}
        aria-pressed={isRecording}
        title={isRecording ? "থামাতে চাপুন" : "কথা বলতে চাপুন"}
      >
        {isRecording ? "⏹" : "🎙️"}
      </button>

      {/* Sticky text input footer */}
      <div style={{ padding: "12px 12px 12px", borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            className="input-field"
            style={{ flex: 1, borderRadius: "24px", padding: "12px 16px", fontSize: "15px" }}
            placeholder={isRecording ? "রেকর্ড হচ্ছে... " : "এখানে প্রশ্ন লিখুন বা উপরে মাইক চাপুন..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isRecording}
          />
          <button
            type="submit"
            className="btn btn--primary"
            style={{ borderRadius: "24px", padding: "0 20px", flexShrink: 0 }}
            disabled={isLoading || !input.trim()}
          >
            পাঠান
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "6px", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
          AI সহায়ক শুধু তথ্য দেয়। এটি আর্থিক পরামর্শ নয়।
        </div>
      </div>
    </div>
  );
}
