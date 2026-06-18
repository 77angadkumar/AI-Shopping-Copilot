"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-IN"; // Set language (English India or fallback)

    rec.onstart = () => {
      setIsListening(true);
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

  if (!supported) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled
        className="text-gray-400 dark:text-gray-600"
        title="Speech recognition not supported in this browser"
      >
        <MicOff className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant={isListening ? "accent" : "ghost"}
        size="icon"
        onClick={toggleListening}
        disabled={disabled}
        className={`relative cursor-pointer transition-all ${
          isListening 
            ? "animate-pulse ring-4 ring-amber-500/20 bg-amber-500 hover:bg-amber-600" 
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
        title={isListening ? "Listening... Click to stop" : "Speak to search"}
      >
        <Mic className={`h-5 w-5 ${isListening ? "text-black" : ""}`} />
        
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </Button>
    </div>
  );
}
