"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, BarChart3, HelpCircle } from "lucide-react";
import { IProduct } from "@/lib/models/Product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ComparisonDashboardProps {
  products: any[];
  aiAnalysis?: {
    summary: string;
    prosCons: Record<string, { pros: string[]; cons: string[] }>;
  };
}

export default function ComparisonDashboard({ products, aiAnalysis }: ComparisonDashboardProps) {
  if (products.length < 2) return null;

  // Compute product specs indexes
  const getProductScores = (p: any) => {
    const specs = p.specifications || {};
    const getSpecVal = (keys: string[]): string => {
      for (const k of keys) {
        const val = specs.get ? specs.get(k) : specs[k];
        if (val) return String(val).toLowerCase();
      }
      return "";
    };

    const desc = p.description.toLowerCase();
    const title = p.title.toLowerCase();

    // 1. Value Score: Price/Rating ratio (Higher rating + lower price = better value)
    const baseValue = p.rating * 20; // 0 to 100
    // Normalize price: suppose max price is 150,000
    const priceRatio = Math.min(1.0, p.price / 150000);
    const valueScore = Math.round(baseValue * (1.1 - priceRatio * 0.4));

    // 2. Battery Score
    const batteryText = (getSpecVal(["Battery", "Battery Life", "Run Time"]) + " " + desc).toLowerCase();
    const batteryHours = batteryText.match(/(\d+)\s*hours/);
    let batteryScore = 65; // default moderate
    if (batteryHours) {
      const hrs = parseInt(batteryHours[1]);
      if (hrs >= 18) batteryScore = 95;
      else if (hrs >= 15) batteryScore = 88;
      else if (hrs >= 10) batteryScore = 75;
      else if (hrs >= 7) batteryScore = 60;
    } else if (batteryText.includes("long battery") || batteryText.includes("all-day")) {
      batteryScore = 85;
    }

    // 3. Gaming Score: Dedicated GPU check
    const gpuText = (getSpecVal(["GPU", "Graphics", "Graphics Card"]) + " " + title + " " + desc).toLowerCase();
    let gamingScore = 40;
    if (gpuText.includes("rtx") || gpuText.includes("nvidia") || gpuText.includes("radeon rx") || gpuText.includes("dedicated")) {
      gamingScore = 92;
    } else if (gpuText.includes("intel iris") || gpuText.includes("integrated") || gpuText.includes("m1") || gpuText.includes("m2") || gpuText.includes("m3")) {
      gamingScore = 65;
    } else if (p.category.toLowerCase().includes("laptops") && (desc.includes("gaming") || title.includes("gaming"))) {
      gamingScore = 80;
    }

    // 4. Productivity Score: High CPU and high memory
    const ramText = getSpecVal(["RAM", "Memory", "System Memory"]);
    const cpuText = (getSpecVal(["Processor", "CPU"]) + " " + desc).toLowerCase();
    let productivityScore = 60;
    if (ramText.includes("16gb") || ramText.includes("32gb") || ramText.includes("64gb") || desc.includes("16gb ram") || desc.includes("32gb ram")) {
      productivityScore += 20;
    }
    if (cpuText.includes("i7") || cpuText.includes("i9") || cpuText.includes("ryzen 7") || cpuText.includes("ryzen 9") || cpuText.includes("m1 pro") || cpuText.includes("m2 pro") || cpuText.includes("m3 pro") || cpuText.includes("m3 max")) {
      productivityScore += 15;
    }
    productivityScore = Math.min(98, productivityScore);

    // 5. User Sentiment Score
    const sentimentScore = Math.round(p.rating * 20);

    return {
      value: valueScore,
      battery: batteryScore,
      gaming: gamingScore,
      productivity: productivityScore,
      sentiment: sentimentScore
    };
  };

  const productMetrics = products.map(p => ({
    product: p,
    scores: getProductScores(p)
  }));

  // Identify winner based on highest average score
  const averagedScores = productMetrics.map(item => {
    const s = item.scores;
    const avg = (s.value + s.battery + s.gaming + s.productivity + s.sentiment) / 5;
    return { id: item.product._id, avg };
  });
  const winnerId = averagedScores.sort((a, b) => b.avg - a.avg)[0].id;

  // Radar chart SVG constants
  const cx = 150;
  const cy = 150;
  const rMax = 100;
  const numAxes = 5;
  const dimensions = [
    { label: "Value For Money", key: "value" },
    { label: "Battery Performance", key: "battery" },
    { label: "Gaming Capable", key: "gaming" },
    { label: "Productivity Power", key: "productivity" },
    { label: "Sentiment Rating", key: "sentiment" }
  ];

  // Helper function to map coordinate points
  const getCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2;
    const r = (value / 100) * rMax;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  // Color options for compared items
  const colors = [
    { border: "rgba(245, 158, 11, 0.95)", fill: "rgba(245, 158, 11, 0.15)", text: "text-amber-500", bg: "bg-amber-500/10" },
    { border: "rgba(6, 182, 212, 0.95)", fill: "rgba(6, 182, 212, 0.15)", text: "text-cyan-500", bg: "bg-cyan-500/10" },
    { border: "rgba(168, 85, 247, 0.95)", fill: "rgba(168, 85, 247, 0.15)", text: "text-purple-500", bg: "bg-purple-500/10" }
  ];

  return (
    <div className="flex flex-col gap-8 transition-all duration-300">
      
      {/* 1. Comparison Metrics Radar Radar Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-6 backdrop-blur-md shadow-2xl">
        
        {/* Radar Graph */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" /> Feature Radar Map
          </h4>
          
          <div className="relative w-80 h-80 flex items-center justify-center">
            <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
              {/* Radial Grids */}
              {[25, 50, 75, 100].map((ring, idx) => {
                let pathPoints = "";
                for (let i = 0; i < numAxes; i++) {
                  const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
                  const x = cx + (ring / 100) * rMax * Math.cos(angle);
                  const y = cy + (ring / 100) * rMax * Math.sin(angle);
                  pathPoints += `${i === 0 ? "M" : "L"} ${x} ${y} `;
                }
                pathPoints += "Z";
                return (
                  <path
                    key={idx}
                    d={pathPoints}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1.2"
                    strokeDasharray={idx < 3 ? "3" : "0"}
                  />
                );
              })}

              {/* Axis Spoke Lines */}
              {dimensions.map((dim, idx) => {
                const angle = (idx * 2 * Math.PI) / numAxes - Math.PI / 2;
                const endX = cx + rMax * Math.cos(angle);
                const endY = cy + rMax * Math.sin(angle);
                
                // Label positions
                const labelOffset = 18;
                const labelX = cx + (rMax + labelOffset) * Math.cos(angle);
                const labelY = cy + (rMax + labelOffset) * Math.sin(angle);
                let textAnchor: "middle" | "start" | "end" = "middle";
                if (Math.cos(angle) > 0.1) textAnchor = "start";
                else if (Math.cos(angle) < -0.1) textAnchor = "end";

                return (
                  <g key={idx}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={endX}
                      y2={endY}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1.2"
                    />
                    <text
                      x={labelX}
                      y={labelY + 3}
                      textAnchor={textAnchor}
                      className="text-[9px] font-black fill-slate-400 uppercase tracking-wider"
                    >
                      {dim.label}
                    </text>
                  </g>
                );
              })}

              {/* Product polygons */}
              {productMetrics.map((pm, pmIdx) => {
                const color = colors[pmIdx % colors.length];
                let pathPoints = "";
                
                dimensions.forEach((dim, dimIdx) => {
                  const score = (pm.scores as any)[dim.key] || 50;
                  const coords = getCoordinates(dimIdx, score);
                  pathPoints += `${dimIdx === 0 ? "M" : "L"} ${coords.x} ${coords.y} `;
                });
                pathPoints += "Z";

                return (
                  <g key={pmIdx}>
                    <path
                      d={pathPoints}
                      fill={color.fill}
                      stroke={color.border}
                      strokeWidth="2.5"
                      className="transition-all duration-500 hover:fill-opacity-35"
                    />
                    {/* Draw points */}
                    {dimensions.map((dim, dimIdx) => {
                      const score = (pm.scores as any)[dim.key] || 50;
                      const coords = getCoordinates(dimIdx, score);
                      return (
                        <circle
                          key={dimIdx}
                          cx={coords.x}
                          cy={coords.y}
                          r="3"
                          fill={color.border}
                          className="stroke-slate-950 stroke-1"
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {productMetrics.map((pm, idx) => {
              const color = colors[idx % colors.length];
              return (
                <div key={pm.product._id} className="flex items-center gap-2 text-xs font-semibold">
                  <span className="h-3.5 w-3.5 rounded border-2" style={{ borderColor: color.border, backgroundColor: color.fill }} />
                  <span className="text-slate-300 truncate max-w-[120px]">{pm.product.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Advice & Scores Summary */}
        <div className="lg:col-span-7 flex flex-col gap-4 self-stretch justify-center border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-2 border border-amber-500/20 animate-pulse">
              <Sparkles className="h-3.5 w-3.5" /> AI Recommended Winner
            </span>
            <h3 className="text-xl font-extrabold text-white mb-2">
              {productMetrics.find(m => m.product._id.toString() === winnerId.toString())?.product.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {aiAnalysis ? aiAnalysis.summary : "Based on detailed specification analysis, customer feedback sentiment, and pricing value ratios, our engine recommended this winner as the best fit for general usage."}
            </p>
          </div>

          <div className="space-y-3 mt-4">
            <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Score Metrics Sheet</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productMetrics.map((pm, pmIdx) => {
                const color = colors[pmIdx % colors.length];
                const isWinner = pm.product._id.toString() === winnerId.toString();

                return (
                  <div key={pm.product._id} className={`p-4 rounded-xl border border-white/5 bg-slate-950/40 relative overflow-hidden ${isWinner ? "ring-2 ring-amber-500/20" : ""}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">{pm.product.title}</span>
                      {isWinner && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black px-1.5 py-0.5 rounded">
                          Winner
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {dimensions.map(dim => {
                        const score = (pm.scores as any)[dim.key];
                        return (
                          <div key={dim.key} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-medium text-slate-400">
                              <span>{dim.label}</span>
                              <span className={`font-bold ${color.text}`}>{score}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-[1px]">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${score}%`, backgroundColor: color.border }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 2. Side-by-Side Highlights (Pros/Cons) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((p, idx) => {
          const color = colors[idx % colors.length];
          const insights = aiAnalysis?.prosCons[p._id.toString()] || {
            pros: ["High quality hardware specs", "Reliable performance in catalog testing"],
            cons: ["Price premium over local brands"]
          };

          return (
            <div key={p._id} className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <Badge variant="outline" className={`uppercase text-[9px] tracking-wider font-bold mb-1.5 ${color.bg} ${color.text} border-none`}>
                      {p.brand}
                    </Badge>
                    <h4 className="text-base font-extrabold text-white line-clamp-1">
                      {p.title}
                    </h4>
                  </div>
                  <span className="text-lg font-black text-white">₹{p.price.toLocaleString()}</span>
                </div>

                {/* Pros */}
                <div className="mb-4">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">
                    Highlights (Pros)
                  </span>
                  <ul className="space-y-1.5">
                    {insights.pros.map((pro: string, pIdx: number) => (
                      <li key={pIdx} className="text-xs text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div>
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-2">
                    Considerations (Cons)
                  </span>
                  <ul className="space-y-1.5">
                    {insights.cons.map((con: string, cIdx: number) => (
                      <li key={cIdx} className="text-xs text-slate-300 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs">
                <Link href={`/product/${p._id}`}>
                  <Button variant="ghost" className="h-8 text-xs font-bold gap-1 text-amber-500 hover:text-amber-400 cursor-pointer">
                    Spec Details <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link href={`/chat?q=Tell me details about the ${encodeURIComponent(p.title)}`}>
                  <Button variant="outline" className="h-8 text-[10px] font-black uppercase tracking-wider cursor-pointer">
                    Ask AI Assistant
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
