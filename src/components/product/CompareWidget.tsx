"use client";

import React from "react";
import Link from "next/link";
import { BarChart2, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SelectedProduct {
  _id: string;
  title: string;
  price: number;
}

interface CompareWidgetProps {
  selectedProducts: SelectedProduct[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function CompareWidget({
  selectedProducts,
  onRemove,
  onClear,
}: CompareWidgetProps) {
  if (selectedProducts.length === 0) return null;

  const compareUrl = `/compare?ids=${selectedProducts.map((p) => p._id).join(",")}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-2xl glass py-4 px-4 sm:px-6 lg:px-8 transition-transform duration-300 animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Info details */}
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 p-2 rounded-lg border border-accent/20 hidden sm:block">
            <BarChart2 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Product Comparison</h4>
            <p className="text-xs text-muted-foreground">
              Select up to 3 products to compare side-by-side. ({selectedProducts.length} selected)
            </p>
          </div>
        </div>

        {/* Middle: Selected product badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
          {selectedProducts.map((prod) => (
            <div
              key={prod._id}
              className="flex items-center gap-1.5 bg-muted text-foreground border border-border px-2.5 py-1 rounded-full text-xs font-medium shadow-sm hover:bg-muted/80 transition-colors"
            >
              <span className="truncate max-w-[120px]">{prod.title}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">
                (₹{prod.price.toLocaleString()})
              </span>
              <button
                type="button"
                onClick={() => onRemove(prod._id)}
                className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer rounded-full p-0.5"
                title="Remove product"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer h-9"
          >
            Clear All
          </Button>

          <Link href={compareUrl} className="shrink-0">
            <Button
              variant="accent"
              size="sm"
              disabled={selectedProducts.length < 2}
              className="flex items-center gap-1 text-xs px-4 h-9 shadow-md cursor-pointer font-bold disabled:opacity-50"
              title={selectedProducts.length < 2 ? "Select at least 2 items to compare" : "Compare now"}
            >
              <span>Compare Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
