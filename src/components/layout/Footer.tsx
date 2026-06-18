import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card text-foreground py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">amzRufus Assistant</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A premium, full-stack GenAI AI Shopping Assistant mimicking Amazon's conversational advisor. 
              Supports semantic RAG, side-by-side spec comparison, multi-turn memory, and voice inputs.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Browse Categories</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/?cat=laptops" className="hover:text-accent">Laptops & Notebooks</Link></li>
              <li><Link href="/?cat=smartphones" className="hover:text-accent">Smartphones & Flagships</Link></li>
              <li><Link href="/?cat=headphones" className="hover:text-accent">Headphones & ANC Earbuds</Link></li>
              <li><Link href="/?cat=tablets" className="hover:text-accent">Tablets & Drawing Pads</Link></li>
              <li><Link href="/?cat=smartwatches" className="hover:text-accent">Smartwatches & Fitness Trackers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">AI Technologies</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Retrieval-Augmented Generation (RAG)</li>
              <li>Hybrid Vector Cosine Similarity Search</li>
              <li>Semantic Intent Query Parsing</li>
              <li>Dual-Mode Vectorization Engine</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} amzRufus. Created as a production-grade GenAI HackOn project.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="/" className="hover:underline">Privacy Policy</Link>
            <Link href="/" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
