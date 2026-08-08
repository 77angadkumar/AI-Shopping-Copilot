"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Sparkles, Laptop, Smartphone, Headphones, Tablet, Watch, ChevronRight, TrendingUp, Camera } from "lucide-react";
import ImageSearch from "@/components/product/ImageSearch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/product/ProductGrid";
import { ProductData } from "@/components/product/ProductCard";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [trendingProducts, setTrendingProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageSearch, setShowImageSearch] = useState(false);

  const handleSelectProduct = (product: any) => {
    setShowImageSearch(false);
    router.push(`/product/${product._id}`);
  };

  const categories = [
    { id: "all", name: "All Products", icon: ShoppingBagIcon },
    { id: "laptops", name: "Laptops", icon: Laptop },
    { id: "smartphones", name: "Smartphones", icon: Smartphone },
    { id: "headphones", name: "Audio", icon: Headphones },
    { id: "tablets", name: "Tablets", icon: Tablet },
    { id: "smartwatches", name: "Smartwatches", icon: Watch },
  ];

  // Fetch trending products based on category
  useEffect(() => {
    fetchTrending();
  }, [selectedCategory]);

  const fetchTrending = async () => {
    setIsLoading(true);
    try {
      const url = selectedCategory === "all" 
        ? "/api/recommend?limit=8" 
        : `/api/recommend?category=${selectedCategory}&limit=8`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTrendingProducts(data.recommendations);
      }
    } catch (e) {
      console.error("Failed to fetch trending products", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to chat with pre-loaded search query
      router.push(`/chat?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow">
        {/* 1. Hero / Search Panel */}
        <section className="bg-gradient-to-b from-primary to-secondary text-primary-foreground py-16 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-4 border border-amber-500/30">
              <Sparkles className="h-3.5 w-3.5" /> Introducing Shop product AI
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Compare Products & Choose Smarter with <span className="text-amber-400">Conversational AI</span>
            </h1>
            <p className="text-sm md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Shop product helps you navigate the catalog, contrasts specifications, analyzes user reviews, and solves your shopping queries.
            </p>

            {/* NL Search bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ask Shop product (e.g., suggest a coding laptop under 80k)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-12 h-12 text-base shadow-lg border-2 border-transparent bg-card text-foreground focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowImageSearch(true)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-all cursor-pointer bg-transparent border-none"
                  title="Search by image"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              <Button type="submit" variant="accent" className="h-12 px-6 font-bold cursor-pointer">
                Ask AI
              </Button>
            </form>
          </div>
        </section>

        {/* 2. Quick Categories */}
        <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-border/50">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground/80 mb-6 text-center md:text-left">
            Shop by Category
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant={isSelected ? "accent" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex items-center gap-1.5 h-10 px-4 cursor-pointer text-xs font-semibold"
                >
                  <Icon className="h-4 w-4" />
                  {cat.name}
                </Button>
              );
            })}
          </div>
        </section>

        {/* 3. Products Grid */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg md:text-xl font-extrabold text-foreground">
                Trending Product Matches
              </h2>
            </div>
            <Link href="/chat" className="text-xs font-semibold text-amber-500 hover:underline flex items-center gap-1">
              Ask Shop product Chatbot <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-72 w-full rounded-xl border border-border bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <ProductGrid
              products={trendingProducts}
              onAskRufus={(title) => {
                router.push(`/chat?q=${encodeURIComponent(`Tell me more about the ${title}`)}`);
              }}
            />
          )}
        </section>
      </main>

      <Footer />

      {/* Image Search Modal (Phase 7) */}
      {showImageSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <ImageSearch
            onSelectProduct={handleSelectProduct}
            onClose={() => setShowImageSearch(false)}
          />
        </div>
      )}
    </div>
  );
}

// Simple fallback icon for Shopping Bag
function ShoppingBagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  );
}
