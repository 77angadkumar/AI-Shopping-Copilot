import React from "react";
import { Star, MessageSquare, HeartHandshake } from "lucide-react";

interface ReviewSummaryCardProps {
  rating: number;
  reviewCount: number;
  sentiment: number; // 1.0 to 5.0
  summary: string;
}

export default function ReviewSummaryCard({
  rating,
  reviewCount,
  sentiment,
  summary
}: ReviewSummaryCardProps) {
  // Map sentiment to descriptive text and color
  const getSentimentDetails = (score: number) => {
    if (score >= 4.5) return { label: "Exceptional", color: "from-emerald-500 to-teal-400", bg: "bg-emerald-500/10 text-emerald-400" };
    if (score >= 3.8) return { label: "Very Positive", color: "from-green-500 to-emerald-400", bg: "bg-green-500/10 text-green-400" };
    if (score >= 3.0) return { label: "Mixed", color: "from-amber-500 to-yellow-400", bg: "bg-amber-500/10 text-amber-400" };
    return { label: "Critical", color: "from-rose-500 to-red-400", bg: "bg-rose-500/10 text-rose-400" };
  };

  const details = getSentimentDetails(sentiment);
  const sentimentPercentage = ((sentiment - 1) / 4) * 100; // Map 1-5 scale to 0-100%

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-6 backdrop-blur-md shadow-2xl transition-all duration-300 hover:shadow-amber-500/5">
      {/* Decorative gradient blur in background */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left column: Star Rating */}
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
            Product Rating
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-white">
              {rating.toFixed(1)}
            </span>
            <span className="text-lg text-slate-400">/ 5.0</span>
          </div>
          
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(rating)
                    ? "fill-amber-500 text-amber-500"
                    : i < rating
                    ? "fill-amber-500/50 text-amber-500/50"
                    : "text-slate-700"
                }`}
              />
            ))}
            <span className="ml-2 text-xs font-medium text-slate-400 flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {reviewCount} global ratings
            </span>
          </div>
        </div>

        {/* Middle column: Sentiment Score Bar */}
        <div className="flex-1 max-w-md flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-amber-400" />
              AI Sentiment Meter
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${details.bg}`}>
              {details.label} ({sentiment.toFixed(1)})
            </span>
          </div>
          
          {/* Progress Bar Container */}
          <div className="h-3.5 w-full bg-slate-950/60 rounded-full border border-white/5 overflow-hidden p-[2px]">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${details.color} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.max(5, sentimentPercentage)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span>Critical (1.0)</span>
            <span>Neutral (3.0)</span>
            <span>Exceptional (5.0)</span>
          </div>
        </div>
      </div>

      {/* Narrative Executive Summary */}
      <div className="relative z-10 mt-6 border-t border-white/5 pt-5">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-2">
          Consensus Summary
        </h4>
        <p className="text-sm leading-relaxed text-slate-200">
          {summary}
        </p>
      </div>
    </div>
  );
}
