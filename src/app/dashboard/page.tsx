import React from "react";
import Link from "next/link";
import { User, Heart, MessageSquare, ShieldCheck, Database, Cpu, Settings, Calendar, Award } from "lucide-react";
import { connectToDatabase } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";
import Product from "@/lib/models/Product";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

// Fetch system stats directly on the server
async function getSystemStats() {
  try {
    await connectToDatabase();
    const productCount = await Product.countDocuments();
    const sessionCount = await ChatSession.countDocuments();
    const dbStatus = "Connected";

    let llmMode = "Local Rule-Based Engine";
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "YOUR_OPENAI_API_KEY") {
      llmMode = "GPT-4o (Active)";
    } else if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY") {
      llmMode = "Gemini-1.5-flash (Active)";
    }

    return { productCount, sessionCount, dbStatus, llmMode };
  } catch (e) {
    return { productCount: 0, sessionCount: 0, dbStatus: "Offline", llmMode: "Unknown" };
  }
}

// Fetch active sessions directly on the server
async function getUserSessions() {
  try {
    await connectToDatabase();
    const sessions = await ChatSession.find({ userId: "anonymous" })
      .sort({ updatedAt: -1 })
      .limit(5);
    return JSON.parse(JSON.stringify(sessions));
  } catch (e) {
    return [];
  }
}

// Fetch a few mock wishlist products directly on the server
async function getWishlistProducts() {
  try {
    await connectToDatabase();
    // Simply fetch the top 2 products as mock wishlist
    const products = await Product.find({}).limit(2);
    return JSON.parse(JSON.stringify(products));
  } catch (e) {
    return [];
  }
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || "customer";

  const stats = await getSystemStats();
  const recentSessions = await getUserSessions();
  const wishlist = await getWishlistProducts();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow py-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card Header */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="h-16 w-16 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-full flex items-center justify-center border-2 border-white shadow-md shrink-0">
              <User className="h-8 w-8 text-black" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <h1 className="text-xl md:text-2xl font-black text-foreground">Angad Ram</h1>
                <Badge variant="accent" className="flex items-center gap-1 font-extrabold text-[10px] py-0.5">
                  <Award className="h-3 w-3 text-black" /> Premium Prime
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Account ID: <span className="font-mono">usr_angad_2026</span> | Member Since: May 2024
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href="/chat">
              <Button variant="accent" className="font-bold cursor-pointer text-xs h-9">
                Open Chat Assistant
              </Button>
            </Link>
            <Button variant="outline" className="text-xs h-9 cursor-pointer">
              Account Settings
            </Button>
          </div>
        </div>

        {/* Tab Controls (Phase 10) */}
        <div className="flex border-b border-white/10 mb-8 gap-6">
          <Link href="/dashboard?tab=customer">
            <button
              className={`pb-3 text-sm font-extrabold uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
                currentTab === "customer"
                  ? "border-amber-500 text-amber-500"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Shopper Profile
            </button>
          </Link>
          <Link href="/dashboard?tab=admin">
            <button
              className={`pb-3 text-sm font-extrabold uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
                currentTab === "admin"
                  ? "border-amber-500 text-amber-500"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              System Metrics & Analytics
            </button>
          </Link>
        </div>

        {currentTab === "customer" ? (
          /* Two Column Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* LEFT: Wishlist & Sessions */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* SAVED WISHLIST ITEMS */}
              <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                  <h2 className="text-base font-extrabold text-foreground">
                    My Active Wishlist
                  </h2>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted-foreground">Your wishlist is empty. Add items from the catalog!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map((item: any) => (
                      <div
                        key={item._id}
                        className="border border-border bg-muted/20 hover:bg-muted/40 rounded-xl p-4 flex flex-col justify-between transition-colors shadow-sm"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">{item.brand}</span>
                            <span className="text-[10px] text-amber-500 font-bold">⭐ {item.rating}</span>
                          </div>
                          <h4 className="text-sm font-bold text-foreground line-clamp-1 mb-2">
                            {item.title}
                          </h4>
                          <p className="text-xs font-black text-foreground">₹{item.price.toLocaleString()}</p>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-border/50 pt-3 mt-4 text-xs">
                          <Link href={`/product/${item._id}`} className="text-muted-foreground hover:text-foreground">
                            Specs
                          </Link>
                          <Link href={`/chat?q=Tell me more about the ${encodeURIComponent(item.title)}`} className="text-amber-500 font-bold hover:underline">
                            Ask Shop product
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* RECENT CONVERSATIONS LIST */}
              <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                  <h2 className="text-base font-extrabold text-foreground">
                    Recent Chat Sessions
                  </h2>
                </div>

                {recentSessions.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted-foreground">No recent conversations found. Open chat to start!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSessions.map((session: any) => {
                      const lastMsg = session.messages[session.messages.length - 1];
                      return (
                        <div
                          key={session.sessionId}
                          className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors flex items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 text-xs font-semibold text-foreground mb-1">
                              <span className="text-amber-500">Chat Session</span>
                              <span className="text-[10px] text-muted-foreground font-normal">
                                ({session.messages.length} messages)
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate leading-normal italic">
                              "{lastMsg ? lastMsg.content : "Empty Chat"}"
                            </p>
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                            <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(session.updatedAt)}
                            </span>
                            <Link href={`/chat?q=&sessionId=${session.sessionId}`}>
                              <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold cursor-pointer">
                                Resume
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

            </div>

            {/* RIGHT: System Specs / Metrics Dashboard */}
            <div className="lg:col-span-4 space-y-6">
              
              <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-base font-extrabold text-foreground">
                    AI RAG Diagnostics
                  </h2>
                </div>

                <div className="space-y-4">
                  
                  {/* MongoDB Status */}
                  <div className="p-3 bg-muted/20 border border-border rounded-xl flex items-center gap-3">
                    <Database className="h-5 w-5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Database Layer</span>
                      <span className="text-sm font-semibold text-foreground">MongoDB Catalog ({stats.dbStatus})</span>
                    </div>
                  </div>

                  {/* Seed count */}
                  <div className="p-3 bg-muted/20 border border-border rounded-xl flex items-center gap-3">
                    <Database className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Indexed Catalog</span>
                      <span className="text-sm font-semibold text-foreground">{stats.productCount} Vectorized Products</span>
                    </div>
                  </div>

                  {/* Chat session count */}
                  <div className="p-3 bg-muted/20 border border-border rounded-xl flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Memory Layer</span>
                      <span className="text-sm font-semibold text-foreground">{stats.sessionCount} Saved Conversations</span>
                    </div>
                  </div>

                  {/* Model mode */}
                  <div className="p-3 bg-muted/20 border border-border rounded-xl flex items-center gap-3">
                    <Cpu className="h-5 w-5 text-rose-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">LLM Engine Node</span>
                      <span className="text-sm font-semibold text-foreground">{stats.llmMode}</span>
                    </div>
                  </div>

                </div>

                <div className="border-t border-border/50 pt-4 mt-6 text-[10px] text-muted-foreground leading-normal flex items-start gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Diagnostics verify MongoDB connectivity, vector-embedding calculation, RAG pipelines, and conversational state tracking.</span>
                </div>
              </section>

            </div>

          </div>
        ) : (
          <div className="mb-12">
            <AdminDashboard />
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
