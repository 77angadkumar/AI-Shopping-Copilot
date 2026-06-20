import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, ShoppingCart, ShieldCheck, Heart, Sparkles, AlertCircle, Laptop, Smartphone, Headphones, Tablet, Watch } from "lucide-react";
import { connectToDatabase } from "@/lib/db";
import Product, { IProduct } from "@/lib/models/Product";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import ProductCard from "@/components/product/ProductCard";

import ReviewSummaryCard from "@/components/product/ReviewSummaryCard";
import ReviewAnalysisSection from "@/components/product/ReviewAnalysisSection";
import { getProductReviewSummary, getProductReviews } from "@/lib/reviewService";
import { ReviewAnalysisResult } from "@/lib/reviewAnalyzer";
import UserPreference from "@/lib/models/UserPreference";
import PriceTracker from "@/components/product/PriceTracker";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }> | {
    id: string;
  };
}

// Fetch similar products directly on the server
async function getSimilarProducts(productId: string, category: string): Promise<any[]> {
  try {
    await connectToDatabase();
    const items = await Product.find({
      category,
      _id: { $ne: productId }
    }).limit(4);
    return JSON.parse(JSON.stringify(items));
  } catch (e) {
    console.error("Failed to load similar products", e);
    return [];
  }
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  await connectToDatabase();
  
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  let product: any;
  try {
    const fetched = await Product.findById(productId);
    if (!fetched) {
      return notFound();
    }
    product = JSON.parse(JSON.stringify(fetched));
  } catch (err) {
    console.error("Error loading product", err);
    return notFound();
  }

  // Record product view in user preferences profile
  try {
    await UserPreference.findOneAndUpdate(
      { userId: "anonymous" },
      { 
        $addToSet: { 
          viewedProducts: product._id,
          preferredCategories: product.category,
          favoriteBrands: product.brand
        }
      },
      { upsert: true }
    );
  } catch (e) {
    console.error("Failed to record viewed product in profile:", e);
  }

  const similarProducts = await getSimilarProducts(product._id, product.category);

  // Load real reviews and summaries
  let reviewSummary: ReviewAnalysisResult = { pros: [], cons: [], sentiment: 0, summary: "" };
  let customerReviews: any[] = [];
  try {
    reviewSummary = await getProductReviewSummary(productId);
    const reviewsData = await getProductReviews(productId, 1, 10);
    customerReviews = JSON.parse(JSON.stringify(reviewsData.reviews));
  } catch (e) {
    console.error("Failed to load reviews and summaries", e);
  }

  const renderFallbackBanner = (category: string) => {
    const iconClass = "h-20 w-20 text-white/80 drop-shadow-lg";
    const bannerClass = "w-full h-80 rounded-2xl flex items-center justify-center bg-gradient-to-br";

    switch (category.toLowerCase()) {
      case "laptops":
        return <div className={`${bannerClass} from-slate-700 to-slate-900`}><Laptop className={iconClass} /></div>;
      case "smartphones":
        return <div className={`${bannerClass} from-indigo-800 to-slate-900`}><Smartphone className={iconClass} /></div>;
      case "headphones":
        return <div className={`${bannerClass} from-cyan-700 to-indigo-900`}><Headphones className={iconClass} /></div>;
      case "tablets":
        return <div className={`${bannerClass} from-emerald-700 to-slate-900`}><Tablet className={iconClass} /></div>;
      case "smartwatches":
        return <div className={`${bannerClass} from-rose-700 to-indigo-900`}><Watch className={iconClass} /></div>;
      default:
        return <div className={`${bannerClass} from-slate-700 to-slate-900`}><Laptop className={iconClass} /></div>;
    }
  };

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
          <span>Back to Catalog</span>
        </Link>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Left panel: Image or Fallbacks */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {product.imageUrl && product.imageUrl.startsWith("http") ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-80 rounded-2xl object-cover shadow-md"
              />
            ) : (
              renderFallbackBanner(product.category)
            )}
            <div className="flex gap-2 justify-center">
              <Badge variant="outline" className="text-xs uppercase py-1 border-border/50">
                In Stock
              </Badge>
              <Badge variant="outline" className="text-xs uppercase py-1 border-border/50">
                {product.warranty || "1 Year Warranty"}
              </Badge>
              <Badge variant="outline" className="text-xs uppercase py-1 border-border/50">
                {product.availability || "Free Delivery"}
              </Badge>
            </div>

            {/* Price Trend Graph */}
            <PriceTracker productId={product._id} />
          </div>

          {/* Right panel: Details details */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="font-bold text-foreground">
                {product.brand}
              </Badge>
              <Badge variant="outline" className="capitalize text-foreground">
                {product.category}
              </Badge>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-2">
              {product.title}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "text-amber-500 fill-amber-500"
                        : "text-slate-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-foreground">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount} ratings)</span>
            </div>

            {/* Price section */}
            <div className="p-4 bg-muted/30 border border-border rounded-xl mb-6">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Price</div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xs text-muted-foreground font-semibold">INR</span>
                <span className="text-3xl font-black text-foreground">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through ml-2">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                *Inclusive of all taxes. EMI option available at checkout.
              </p>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-foreground mb-3">Product Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {product.description}
              </p>
              
              <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider mb-2">
                Key Features
              </h4>
              <ul className="space-y-1.5 pl-4 list-disc text-sm text-muted-foreground">
                {product.features.map((feat: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-auto pt-6 border-t border-border/50">
              <Link href={`/chat?q=Tell me about the ${encodeURIComponent(product.title)}`}>
                <Button variant="accent" className="gap-2 font-bold cursor-pointer">
                  <Sparkles className="h-4 w-4" /> Ask Rufus AI
                </Button>
              </Link>
              <Button variant="outline" className="gap-2 cursor-pointer text-xs">
                <Heart className="h-4 w-4 text-rose-500" /> Save to Wishlist
              </Button>
            </div>

          </div>
        </div>

        {/* AI REVIEW SYNTHESIS BOX */}
        <section className="mb-12 flex flex-col gap-6">
          <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            AI Customer Review Analysis
          </h3>
          <ReviewSummaryCard
            rating={product.rating}
            reviewCount={product.reviewCount}
            sentiment={reviewSummary.sentiment}
            summary={reviewSummary.summary}
          />
          <ReviewAnalysisSection
            pros={reviewSummary.pros}
            cons={reviewSummary.cons}
          />
        </section>

        {/* DYNAMIC SPECS MATRIX SHEET */}
        <section className="mb-12">
          <h2 className="text-base font-extrabold text-foreground mb-4">
            Technical Specifications Sheet
          </h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <Table>
              <TableBody>
                {Object.entries(product.specifications || {}).map(([key, val]) => (
                  <TableRow key={key}>
                    <TableCell className="font-bold text-muted-foreground w-1/3 bg-muted/10 capitalize">
                      {key}
                    </TableCell>
                    <TableCell className="text-foreground text-sm">
                      {val as string}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* CUSTOMER REVIEWS BULLETS */}
        <section className="mb-12 border-t border-border/60 pt-8">
          <h2 className="text-base font-extrabold text-foreground mb-4">
            Recent Customer Reviews
          </h2>
          <div className="space-y-4">
            {customerReviews.length > 0 ? (
              customerReviews.map((rev: any, idx: number) => (
                <div key={idx} className="p-4 bg-card border border-border rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{rev.userName}</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < rev.rating
                                ? "text-amber-500 fill-amber-500"
                                : "text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {new Date(rev.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground mb-1">
                    {rev.reviewTitle}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rev.reviewText}
                  </p>
                  {rev.verifiedPurchase && (
                    <div className="mt-2 text-[9px] font-bold text-emerald-500 tracking-wide uppercase">
                      ✓ Verified Purchase
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground italic p-4 text-center">
                No customer reviews available yet for this product.
              </div>
            )}
          </div>
        </section>

        {/* SIMILAR RECS LIST */}
        {similarProducts.length > 0 && (
          <section className="border-t border-border/60 pt-8">
            <h2 className="text-base font-extrabold text-foreground mb-6">
              Customers Who Viewed This Also Considered
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
