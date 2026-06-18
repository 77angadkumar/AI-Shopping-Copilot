import React from "react";
import { CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

interface ReviewAnalysisSectionProps {
  pros: string[];
  cons: string[];
}

export default function ReviewAnalysisSection({ pros, cons }: ReviewAnalysisSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300">
      {/* Pros Panel */}
      <div className="relative group overflow-hidden rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-slate-900/40 to-emerald-950/10 p-6 shadow-md transition-all hover:border-emerald-500/30 hover:shadow-emerald-500/5">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-all group-hover:bg-emerald-500/10" />
        
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <h4 className="text-sm font-extrabold uppercase tracking-widest text-slate-200">
            Pros (Customer Highlights)
          </h4>
        </div>

        <ul className="space-y-3 relative z-10">
          {pros.map((pro, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-sm text-slate-300 transition-all duration-200 hover:translate-x-1 hover:text-white"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400 mt-0.5 border border-emerald-500/20">
                ✓
              </span>
              <span className="leading-relaxed">{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cons Panel */}
      <div className="relative group overflow-hidden rounded-2xl border border-rose-500/10 bg-gradient-to-br from-slate-900/40 to-rose-950/10 p-6 shadow-md transition-all hover:border-rose-500/30 hover:shadow-rose-500/5">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-rose-500/5 blur-2xl transition-all group-hover:bg-rose-500/10" />

        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
          <h4 className="text-sm font-extrabold uppercase tracking-widest text-slate-200">
            Cons (Customer Considerations)
          </h4>
        </div>

        <ul className="space-y-3 relative z-10">
          {cons.map((con, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-sm text-slate-300 transition-all duration-200 hover:translate-x-1 hover:text-white"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-[10px] font-bold text-rose-400 mt-0.5 border border-rose-500/20">
                ✗
              </span>
              <span className="leading-relaxed">{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
