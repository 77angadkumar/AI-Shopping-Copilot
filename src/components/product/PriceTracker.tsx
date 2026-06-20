"use client";

import React, { useState, useEffect } from "react";
import { TrendingDown, TrendingUp, AlertCircle, Sparkles } from "lucide-react";

interface PricePoint {
  price: number;
  date: string;
}

interface PriceTrackerProps {
  productId: string;
}

export default function PriceTracker({ productId }: PriceTrackerProps) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [stats, setStats] = useState({
    currentPrice: 0,
    lowestPrice: 0,
    highestPrice: 0,
    savingsPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPriceHistory() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productId}/price-history`);
        const json = await res.json();
        if (json.success) {
          setData(json.priceHistory);
          setStats({
            currentPrice: json.currentPrice,
            lowestPrice: json.lowestPrice,
            highestPrice: json.highestPrice,
            savingsPercentage: json.savingsPercentage
          });
        } else {
          setError(json.error || "Failed to load price history");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load price history");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchPriceHistory();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md animate-pulse">
        <div className="h-6 w-1/3 bg-slate-800 rounded mb-4" />
        <div className="h-28 w-full bg-slate-800/50 rounded" />
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-500/10 bg-rose-950/5 p-6 flex items-center gap-3 text-sm text-rose-400">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>Price tracking is currently unavailable for this item.</span>
      </div>
    );
  }

  // Draw SVG chart path
  const padding = 15;
  const chartWidth = 500;
  const chartHeight = 130;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;

  const prices = data.map(d => d.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Map each data point to x, y coords
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * graphWidth;
    // Invert y because SVG y goes down
    const y = padding + graphHeight - ((d.price - minPrice) / priceRange) * graphHeight;
    return { x, y, price: d.price, date: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) };
  });

  // Generate SVG path string for the line
  let linePath = "";
  let areaPath = "";

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} `;
    for (let i = 1; i < points.length; i++) {
      // Use cubic bezier curves for smooth curve
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      linePath += `C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y} `;
    }

    // For the filled area underneath
    areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;
  }

  const isLowest = stats.currentPrice === stats.lowestPrice;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-6 backdrop-blur-md shadow-2xl transition-all duration-300 hover:shadow-amber-500/5">
      {/* Dynamic Glow Banner */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-500 mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Price History Tracker
          </div>
          <h3 className="text-lg font-bold text-white">Price Trends (Last 15 Days)</h3>
        </div>

        <div className="flex items-center gap-3">
          {stats.savingsPercentage > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <TrendingDown className="h-4 w-4" />
              <span>Save {stats.savingsPercentage}% vs High</span>
            </div>
          )}
          {isLowest ? (
            <span className="px-2.5 py-1 rounded bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider">
              Lowest Price
            </span>
          ) : null}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4 mb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Lowest Price</span>
          <span className="text-base font-extrabold text-white">₹{stats.lowestPrice.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Average Price</span>
          <span className="text-base font-extrabold text-slate-300">
            ₹{Math.round(prices.reduce((s, p) => s + p, 0) / prices.length).toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Highest Price</span>
          <span className="text-base font-extrabold text-slate-400">₹{stats.highestPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* SVG Chart area */}
      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding}
            y1={padding}
            x2={chartWidth - padding}
            y2={padding}
            stroke="rgba(255,255,255,0.03)"
            strokeDasharray="4"
          />
          <line
            x1={padding}
            y1={padding + graphHeight / 2}
            x2={chartWidth - padding}
            y2={padding + graphHeight / 2}
            stroke="rgba(255,255,255,0.03)"
            strokeDasharray="4"
          />
          <line
            x1={padding}
            y1={chartHeight - padding}
            x2={chartWidth - padding}
            y2={chartHeight - padding}
            stroke="rgba(255,255,255,0.06)"
          />

          {/* Filled Area */}
          <path d={areaPath} fill="url(#chartAreaGradient)" />

          {/* Line Path */}
          <path d={linePath} fill="none" stroke="url(#chartLineGradient)" strokeWidth="2.5" />

          {/* Dot Markers and Labels */}
          {points.map((pt, i) => {
            const isImportant = i === 0 || i === points.length - 1 || pt.price === maxPrice || pt.price === minPrice;
            if (!isImportant) return null;

            return (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  className="fill-amber-500 stroke-slate-950 stroke-2"
                />
                <text
                  x={pt.x}
                  y={pt.y - 8}
                  textAnchor="middle"
                  className="text-[9px] font-extrabold fill-slate-300"
                >
                  ₹{pt.price.toLocaleString()}
                </text>
                <text
                  x={pt.x}
                  y={chartHeight - 2}
                  textAnchor="middle"
                  className="text-[8px] font-bold fill-slate-500 uppercase tracking-wider"
                >
                  {pt.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
