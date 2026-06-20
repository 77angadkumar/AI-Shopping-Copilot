import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, BarChart2, CheckCircle2, AlertCircle } from "lucide-react";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/Product";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductSpecTable from "@/components/product/ProductSpecTable";
import { generateComparisonAnalysis } from "@/lib/llm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ComparisonDashboard from "@/components/product/ComparisonDashboard";

interface ComparePageProps {
  searchParams: {
    ids?: string;
  };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const idsString = searchParams.ids || "";
  const productIds = idsString.split(",").filter(Boolean);

  await connectToDatabase();

  let products: any[] = [];
  let analysis: any = null;

  if (productIds.length >= 2) {
    try {
      const fetched = await Product.find({ _id: { $in: productIds } });
      
      // Order items based on original selection list
      products = productIds
        .map(id => fetched.find(p => p._id.toString() === id.toString()))
        .filter(Boolean);

      if (products.length >= 2) {
        // Run AI analysis directly on server
        analysis = await generateComparisonAnalysis(products);
      }
    } catch (e) {
      console.error("Failed to load products for comparison", e);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow py-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Product Comparison Dashboard
          </h1>
        </div>

        {/* Fallback state: Less than 2 items selected */}
        {products.length < 2 ? (
          <div className="text-center py-16 px-6 bg-card border border-border rounded-2xl max-w-xl mx-auto my-12">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-foreground mb-1.5">Awaiting Comparison Products</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              To review items side-by-side, return to the catalog home page and tick the "Compare" button on multiple products.
            </p>
            <Link href="/">
              <Button variant="primary" className="font-bold cursor-pointer">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            {/* Advanced Comparison Dashboard (Phase 5) */}
            <div className="mb-8">
              <ComparisonDashboard products={products} aiAnalysis={analysis} />
            </div>

            {/* 2. Side-by-Side Specs Grid Table */}
            <section className="mb-12">
              <h3 className="text-base font-extrabold text-foreground mb-4">
                Detailed Comparison Matrix
              </h3>
              <ProductSpecTable products={products} />
            </section>

            {/* 3. Follow-up quick buttons */}
            <div className="flex justify-center my-6 gap-3">
              <Link href={`/chat?q=Which one is better: ${products.map(p => p.title).join(" or ")}?`}>
                <Button variant="accent" className="gap-2 font-bold cursor-pointer">
                  <Sparkles className="h-4 w-4" /> Ask Rufus Which is Better
                </Button>
              </Link>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
