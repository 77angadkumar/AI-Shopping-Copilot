"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceAssistantProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  lastResponse?: string; // Text to speak when it changes
}

export default function VoiceAssistant({
  onTranscript,
  disabled = false,
  lastResponse = ""
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 1. Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-IN"; // Default to English India or general English

    rec.onstart = () => {
      setIsListening(true);
      // Stop speaking if listening starts
      stopSpeaking();
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onTranscript(transcript);
      }
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  // 2. Play last response when it changes
  useEffect(() => {
    if (lastResponse && speakEnabled && !disabled) {
      speakText(lastResponse);
    }
  }, [lastResponse]);

  const toggleListening = () => {
    if (!supported || disabled) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Stop current speaking
    window.speechSynthesis.cancel();

    // Clean text of markdown syntax (remove links, bolding, asterisks, etc.)
    const cleanText = text
      .replace(/\[([^\]]+)\]\(file:\/\/\/[^\)]+\)/g, "$1") // clean links
      .replace(/[*_#`~>]/g, "") // remove symbols
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-IN";
    
    // Attempt to set a pleasant female/neutral voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      v => v.name.includes("Google US English") || v.name.includes("Microsoft Zira") || v.lang.startsWith("en-")
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleSpeakPermission = () => {
    const nextVal = !speakEnabled;
    setSpeakEnabled(nextVal);
    if (!nextVal) {
      stopSpeaking();
    }
  };

  if (!supported) {
    return (
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="icon" disabled className="text-slate-600">
          <MicOff className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0 bg-slate-900/60 border border-white/5 px-2 py-1 rounded-xl">
      {/* Microphone button */}
      <Button
        type="button"
        variant={isListening ? "accent" : "ghost"}
        size="icon"
        onClick={toggleListening}
        disabled={disabled}
        className={`relative h-8 w-8 cursor-pointer transition-all rounded-lg ${
          isListening 
            ? "animate-pulse ring-4 ring-amber-500/20 bg-amber-500 hover:bg-amber-600 text-black" 
            : "hover:bg-white/5 text-slate-400 hover:text-white"
        }`}
        title={isListening ? "Listening... Click to stop" : "Speak to search"}
      >
        <Mic className="h-4 w-4" />
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </Button>

      {/* Speaker voice controls */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleSpeakPermission}
        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
        title={speakEnabled ? "Mute speak responses" : "Enable speak responses"}
      >
        {speakEnabled ? <Volume2 className="h-4 w-4 text-amber-500" /> : <VolumeX className="h-4 w-4" />}
      </Button>

      {/* Stop Speaking button */}
      {isSpeaking && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={stopSpeaking}
          className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer animate-pulse"
          title="Stop reading response"
        >
          <Square className="h-3.5 w-3.5 fill-rose-500" />
        </Button>
      )}
    </div>
  );
}
