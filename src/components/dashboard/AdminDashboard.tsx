"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, BarChart2, Activity, PieChart, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AnalyticsData {
  totalSessions: number;
  totalProducts: number;
  searchesPerDay: { day: string; searches: number }[];
  popularBrands: { name: string; count: number }[];
  popularCategories: { name: string; count: number }[];
  recommendationClicks: { product: string; clicks: number; ctr: number }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json.metrics);
      } else {
        setError(json.error || "Failed to load metrics data.");
      }
    } catch (e: any) {
      setError(e.message || "Network error loading analytics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="h-64 bg-slate-900/40 rounded-2xl border border-white/5" />
        <div className="h-64 bg-slate-900/40 rounded-2xl border border-white/5" />
        <div className="h-64 bg-slate-900/40 rounded-2xl border border-white/5" />
        <div className="h-64 bg-slate-900/40 rounded-2xl border border-white/5" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl border border-rose-500/10 bg-rose-950/5 flex items-center justify-between gap-4 text-rose-400">
        <div className="flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error || "Analytics dashboard is temporarily offline."}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchAnalytics} className="rounded-full">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // --- Chart 1: Line Chart (Searches per day) ---
  const lineWidth = 320;
  const lineHeight = 120;
  const linePadding = 15;
  const lineGraphW = lineWidth - linePadding * 2;
  const lineGraphH = lineHeight - linePadding * 2;
  
  const searchValues = data.searchesPerDay.map(s => s.searches);
  const maxSearches = Math.max(...searchValues, 50);
  const minSearches = Math.min(...searchValues, 0);
  const searchRange = maxSearches - minSearches || 1;

  const linePoints = data.searchesPerDay.map((s, index) => {
    const x = linePadding + (index / (data.searchesPerDay.length - 1)) * lineGraphW;
    const y = linePadding + lineGraphH - ((s.searches - minSearches) / searchRange) * lineGraphH;
    return { x, y, day: s.day, val: s.searches };
  });

  let linePath = "";
  let areaPath = "";
  if (linePoints.length > 0) {
    linePath = `M ${linePoints[0].x} ${linePoints[0].y} `;
    for (let i = 1; i < linePoints.length; i++) {
      const cpX1 = linePoints[i - 1].x + (linePoints[i].x - linePoints[i - 1].x) / 2;
      const cpY1 = linePoints[i - 1].y;
      const cpX2 = linePoints[i - 1].x + (linePoints[i].x - linePoints[i - 1].x) / 2;
      const cpY2 = linePoints[i].y;
      linePath += `C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${linePoints[i].x} ${linePoints[i].y} `;
    }
    areaPath = `${linePath} L ${linePoints[linePoints.length - 1].x} ${lineHeight - linePadding} L ${linePoints[0].x} ${lineHeight - linePadding} Z`;
  }

  // --- Chart 2: Bar Chart (Popular Brands) ---
  const barWidth = 320;
  const barHeight = 120;
  const barPadding = 15;
  const maxBrandCount = Math.max(...data.popularBrands.map(b => b.count), 5);
  const colWidth = (barWidth - barPadding * 2) / data.popularBrands.length;

  // --- Chart 3: Donut/Pie Chart (Popular Categories) ---
  const pieWidth = 140;
  const pieHeight = 140;
  const cx = 70;
  const cy = 70;
  const r = 45;
  const totalCategoryShares = data.popularCategories.reduce((sum, c) => sum + c.count, 0) || 1;
  const categoryColors = ["#f59e0b", "#06b6d4", "#a855f7", "#10b981", "#ec4899"];

  let accumulatedAngle = -Math.PI / 2; // start from top

  const slices = data.popularCategories.map((cat, idx) => {
    const angleRatio = cat.count / totalCategoryShares;
    const sliceAngle = angleRatio * 2 * Math.PI;
    
    // Draw paths for arc slice
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + sliceAngle;
    accumulatedAngle = endAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    
    // Path string
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      d,
      color: categoryColors[idx % categoryColors.length],
      name: cat.name,
      percentage: Math.round(angleRatio * 100)
    };
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Cards stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 border border-white/5 rounded-2xl bg-slate-900/40 relative overflow-hidden backdrop-blur-md">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 h-16 w-16 bg-amber-500/10 rounded-full blur-xl" />
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total RAG Sessions</span>
          <span className="text-2xl font-black text-white">{data.totalSessions} active</span>
        </div>
        <div className="p-5 border border-white/5 rounded-2xl bg-slate-900/40 relative overflow-hidden backdrop-blur-md">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 h-16 w-16 bg-cyan-500/10 rounded-full blur-xl" />
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Indexed Products</span>
          <span className="text-2xl font-black text-white">{data.totalProducts} items</span>
        </div>
        <div className="p-5 border border-white/5 rounded-2xl bg-slate-900/40 relative overflow-hidden backdrop-blur-md">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 h-16 w-16 bg-emerald-500/10 rounded-full blur-xl" />
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg search CTR</span>
          <span className="text-2xl font-black text-white">7.84% conversion</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Line Chart (Searches/Day) */}
        <Card className="p-5 border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 shadow-lg relative overflow-hidden backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-amber-500" /> Searches Per Day
            </h4>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">Last 7 Days</span>
          </div>

          <svg viewBox={`0 0 ${lineWidth} ${lineHeight}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid references */}
            <line x1={linePadding} y1={linePadding} x2={lineWidth - linePadding} y2={linePadding} stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
            <line x1={linePadding} y1={linePadding + lineGraphH / 2} x2={lineWidth - linePadding} y2={linePadding + lineGraphH / 2} stroke="rgba(255,255,255,0.02)" strokeDasharray="3" />
            <line x1={linePadding} y1={lineHeight - linePadding} x2={lineWidth - linePadding} y2={lineHeight - linePadding} stroke="rgba(255,255,255,0.05)" />

            <path d={areaPath} fill="url(#areaGrad)" />
            <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="2.2" />

            {linePoints.map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="3" fill="#f59e0b" className="stroke-slate-950 stroke-1" />
                {/* Value on hover or important nodes */}
                <text x={pt.x} y={pt.y - 7} textAnchor="middle" className="text-[8px] font-black fill-slate-300">
                  {pt.val}
                </text>
                {/* Day label */}
                <text x={pt.x} y={lineHeight - 2} textAnchor="middle" className="text-[8px] font-bold fill-slate-500 uppercase">
                  {pt.day}
                </text>
              </g>
            ))}
          </svg>
        </Card>

        {/* Chart B: Bar Chart (Popular Brands) */}
        <Card className="p-5 border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 shadow-lg relative overflow-hidden backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-cyan-500" /> Popular Brand Searches
            </h4>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">Affinities</span>
          </div>

          <svg viewBox={`0 0 ${barWidth} ${barHeight}`} className="w-full h-auto overflow-visible">
            {/* Grid references */}
            <line x1={barPadding} y1={barHeight - barPadding} x2={barWidth - barPadding} y2={barHeight - barPadding} stroke="rgba(255,255,255,0.05)" />

            {data.popularBrands.map((b, i) => {
              const x = barPadding + i * colWidth + 5;
              const w = colWidth - 10;
              const h = (b.count / maxBrandCount) * (barHeight - barPadding * 2);
              const y = barHeight - barPadding - h;

              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx="2"
                    fill="rgba(6, 182, 212, 0.75)"
                    className="hover:fill-cyan-400 transition-colors"
                  />
                  <text x={x + w / 2} y={y - 5} textAnchor="middle" className="text-[8px] font-black fill-slate-300">
                    {b.count}
                  </text>
                  <text x={x + w / 2} y={barHeight - 2} textAnchor="middle" className="text-[8px] font-bold fill-slate-500 uppercase tracking-wider">
                    {b.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </Card>

        {/* Chart C: Pie/Donut (Category share) */}
        <Card className="p-5 border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 shadow-lg relative overflow-hidden backdrop-blur-md lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
              <PieChart className="h-4 w-4 text-purple-500" /> Category Distribution
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Breakdown representing preferred categories selected by shoppers during multi-turn shopping copilot sessions.
            </p>
            
            {/* Color Legend */}
            <div className="space-y-2">
              {slices.map((slice, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                    <span className="text-slate-300">{slice.name}</span>
                  </div>
                  <span className="font-bold text-slate-400">{slice.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative h-[150px] w-[150px]">
              <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
                {slices.map((slice, idx) => (
                  <path
                    key={idx}
                    d={slice.d}
                    fill={slice.color}
                    className="stroke-slate-950 stroke-2 hover:opacity-85 transition-opacity cursor-pointer"
                  />
                ))}
                {/* Donut hole for hollow center */}
                <circle cx={cx} cy={cy} r="25" fill="#090d16" />
              </svg>
              {/* Center percentage label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Top Share</span>
                <span className="text-lg font-black text-white">{slices[0]?.percentage}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Table: CTR / click count */}
      <Card className="p-5 border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 shadow-lg backdrop-blur-md">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-4">
          <TrendingUp className="h-4 w-4 text-emerald-500" /> Recommendation Click-Throughs (CTR)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                <th className="py-2.5">Product Title</th>
                <th className="py-2.5 text-center">Interactions</th>
                <th className="py-2.5 text-right">Click CTR %</th>
              </tr>
            </thead>
            <tbody>
              {data.recommendationClicks.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 font-bold text-slate-200">{item.product}</td>
                  <td className="py-3 text-center font-semibold text-slate-300">{item.clicks} clicks</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black">
                      {item.ctr}% CTR
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
