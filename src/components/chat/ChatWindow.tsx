"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Sparkles, MessageSquare, Laptop, ShoppingBag, ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ChatHistorySidebar, { ChatSessionMeta } from "./ChatHistorySidebar";
import ChatMessage, { ChatMessageProps } from "./ChatMessage";
import VoiceInput from "./VoiceInput";
import ProductCard, { ProductData } from "../product/ProductCard";
import CompareWidget, { SelectedProduct } from "../product/CompareWidget";
import ImageSearch from "../product/ImageSearch";


// Simple helper to generate a UUID
function generateUUID() {
  return "session_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default function ChatWindow() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionMeta[]>([]);
  const [contextProducts, setContextProducts] = useState<ProductData[]>([]);
  const [selectedCompare, setSelectedCompare] = useState<SelectedProduct[]>([]);
  const [showImageSearch, setShowImageSearch] = useState(false);

  const handleSelectImageProduct = (product: any) => {
    setShowImageSearch(false);
    // Add to contextProducts so it shows in the right sidebar
    setContextProducts((prev) => {
      if (prev.some((p) => p._id === product._id)) return prev;
      return [product, ...prev];
    });
    // Trigger prompt details
    setInputValue(`Tell me details about the ${product.title}`);
    handleSendMessage(`Tell me details about the ${product.title}`);
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const hasSentInitialQuery = useRef(false);


  // Suggested quick prompts
  const samplePrompts = [
    "Gaming laptop under ₹80,000 with good battery life",
    "Compare iPhone 15 Pro Max and Samsung S24 Ultra",
    "Show me lightweight laptops for coding",
    "BoAt Rockerz 450 alternatives",
  ];

  // 1. Initial Load: Load sessions list and initialize a new session ID
  useEffect(() => {
    fetchSessions();
    const newId = generateUUID();
    setSessionId(newId);
  }, []);

  // 1b. Listen to URL parameters for initial landing query
  useEffect(() => {
    if (initialQuery && sessionId && !hasSentInitialQuery.current) {
      hasSentInitialQuery.current = true;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, sessionId]);


  // 2. Scroll chat window to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Fetch all chat sessions for sidebar
  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (e) {
      console.error("Failed to load sessions list", e);
    }
  };

  // Load selected session history
  const handleSelectSession = async (id: string) => {
    setIsLoading(true);
    setSessionId(id);
    setContextProducts([]);
    try {
      const res = await fetch(`/api/history?sessionId=${id}`);
      const data = await res.json();
      if (data.success && data.session) {
        // Map messages format
        const mapped = data.session.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(mapped);

        // Fetch products retrieved in the very last turn if any
        let lastProducts: any[] = [];
        for (let i = data.session.messages.length - 1; i >= 0; i--) {
          if (data.session.messages[i].role === "assistant" && data.session.messages[i].productsRetrieved?.length > 0) {
            lastProducts = data.session.messages[i].productsRetrieved;
            break;
          }
        }
        setContextProducts(lastProducts);
      }
    } catch (e) {
      console.error("Failed to load session details", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Spin up a new blank conversation
  const handleNewChat = () => {
    const nextId = generateUUID();
    setSessionId(nextId);
    setMessages([]);
    setContextProducts([]);
  };

  // Delete chat session
  const handleDeleteSession = async (id: string) => {
    try {
      const res = await fetch(`/api/history?sessionId=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchSessions();
        if (sessionId === id) {
          handleNewChat();
        }
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query) return;

    setInputValue("");
    // 1. Optimistically append user message to local state
    const userMsg: ChatMessageProps = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. POST to chat endpoint
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: query }),
      });

      const data = await res.json();
      if (data.success) {
        // 3. Append assistant message and set retrieved products context
        const assistantMsg: ChatMessageProps = { role: "assistant", content: data.response };
        setMessages((prev) => [...prev, assistantMsg]);
        
        if (data.products && Array.isArray(data.products)) {
          setContextProducts(data.products);
        }

        // 4. Refresh history sidebar list
        fetchSessions();
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "system", content: `Error: ${data.error || "Failed to fetch response."}` },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "Network error. Make sure MongoDB and backend routes are online." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice transcript handler
  const handleVoiceTranscript = (transcriptText: string) => {
    setInputValue(transcriptText);
    handleSendMessage(transcriptText);
  };

  // Compare Toggle handler
  const handleCompareToggle = (id: string) => {
    const isSelected = selectedCompare.some((p) => p._id === id);
    if (isSelected) {
      setSelectedCompare((prev) => prev.filter((p) => p._id !== id));
    } else {
      const product = contextProducts.find((p) => p._id === id);
      if (!product) return;
      if (selectedCompare.length >= 3) {
        alert("You can compare a maximum of 3 products side-by-side.");
        return;
      }
      setSelectedCompare((prev) => [
        ...prev,
        { _id: product._id, title: product.title, price: product.price },
      ]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row flex-grow h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full border-x border-border overflow-hidden bg-background">
      
      {/* 1. Sidebar Panel */}
      <ChatHistorySidebar
        sessions={sessions}
        activeSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      {/* 2. Main Chat Thread Layout */}
      <div className="flex-grow flex flex-col h-full bg-background overflow-hidden relative border-r border-border">
        
        {/* Chat Thread Header */}
        <div className="p-4 border-b border-border bg-card flex items-center gap-2">
          <div className="bg-amber-500/10 p-1.5 rounded-lg text-accent">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Ask Rufus AI</h2>
            <p className="text-[10px] text-muted-foreground">Grounded on real-time product features and reviews</p>
          </div>
        </div>

        {/* Scroll Thread */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12 px-6">
              <Sparkles className="h-10 w-10 text-amber-500 mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-foreground mb-1.5">Your Conversational Shopping Companion</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Describe the products you want, contrast specifications, or check reviews! E.g. 
                <span className="italic block mt-1 text-accent font-medium">"Suggest gaming laptops under 80k with a great battery"</span>
              </p>
              
              {/* Sample suggestion queries */}
              <div className="grid grid-cols-1 gap-2 w-full">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputValue(p);
                      handleSendMessage(p);
                    }}
                    className="text-left text-xs p-3 border border-border bg-card text-foreground rounded-lg hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer font-medium"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage key={index} role={msg.role} content={msg.content} />
            ))
          )}
          {isLoading && (
            <div className="flex w-full items-start gap-3 my-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted">
                <Sparkles className="h-4 w-4 text-amber-500 animate-spin" />
              </div>
              <div className="flex flex-col bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-none max-w-[80%]">
                <div className="flex space-x-1.5 py-2">
                  <div className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar Panel */}
        <div className="p-4 border-t border-border bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex items-center gap-2"
          >
            {/* Voice microphone helper */}
            <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />

            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Ask Rufus (e.g. Compare the 1st and 2nd products)..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowImageSearch(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-all cursor-pointer bg-transparent border-none"
                title="Search by image"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="icon"
              disabled={isLoading || !inputValue.trim()}
              className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-black font-bold shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* 3. Right Sidebar Panel: Context Products */}
      <div className="w-full md:w-80 shrink-0 bg-card flex flex-col h-full overflow-hidden border-t md:border-t-0">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Products Discussed
            </h3>
          </div>
          {contextProducts.length > 0 && (
            <Badge variant="secondary" className="text-[10px] font-bold">
              {contextProducts.length} Items
            </Badge>
          )}
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {contextProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">
                Products referenced by the AI during the chat will appear here as catalog cards.
              </p>
            </div>
          ) : (
            contextProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                isComparing={selectedCompare.some((p) => p._id === prod._id)}
                onCompareToggle={handleCompareToggle}
                onAskRufus={(title) => {
                  setInputValue(`Tell me more about ${title}`);
                  handleSendMessage(`Tell me more about ${title}`);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Sticky Bottom Compare drawer */}
      <CompareWidget
        selectedProducts={selectedCompare}
        onRemove={(id) => setSelectedCompare((prev) => prev.filter((p) => p._id !== id))}
        onClear={() => setSelectedCompare([])}
      />

      {/* Image Search Modal (Phase 7) */}
      {showImageSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <ImageSearch
            onSelectProduct={handleSelectImageProduct}
            onClose={() => setShowImageSearch(false)}
          />
        </div>
      )}
    </div>
  );
}
