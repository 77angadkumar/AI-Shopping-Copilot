"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, ShoppingBag, MessageSquare, BarChart2, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sync theme with document class on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    { name: "Home", href: "/", icon: ShoppingBag },
    { name: "AI Assistant", href: "/chat", icon: MessageSquare },
    { name: "Compare", href: "/compare", icon: BarChart2 },
    { name: "Dashboard", href: "/dashboard", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-primary text-primary-foreground shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-95">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent flex items-center">
              amz<span className="text-white font-semibold">Rufus</span>
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-amber-500 text-black ml-1">
              AI Shopping Partner
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-amber-400 ${
                  isActive ? "text-amber-400 font-semibold" : "text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Utility Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-300 hover:text-white hover:bg-secondary cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-amber-400" />
            ) : (
              <Sun className="h-5 w-5 text-amber-300" />
            )}
          </Button>

          {/* Quick link to chat */}
          <Link href="/chat" className="hidden sm:block">
            <Button variant="accent" size="sm" className="gap-1 shadow-md">
              Ask Rufus <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
