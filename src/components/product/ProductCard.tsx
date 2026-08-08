"use client";

import React from "react";
import Link from "next/link";
import { Star, Laptop, Smartphone, Headphones, Tablet, Watch, Camera, MessageSquare, Plus, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ProductData {
  _id: string;
  title: string;
  brand: string;
  price: number;
  rating: number;
  category: string;
  description: string;
  features: string[];
  image: string;
  imageUrl?: string;
  specifications: Record<string, string>;
}

interface ProductCardProps {
  product: ProductData;
  isComparing?: boolean;
  onCompareToggle?: (id: string) => void;
  onAskRufus?: (productTitle: string) => void;
  explanations?: string[];
}

export default function ProductCard({
  product,
  isComparing = false,
  onCompareToggle,
  onAskRufus,
  explanations,
}: ProductCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const productId = product?._id || (product as any)?.id || "";
  const imageUrl = product?.imageUrl || product?.image || "";
  const isExternalImage = imageUrl && imageUrl.startsWith("http") && !imageError;

  // Render high-quality fallback device icons with gradients
  const renderProductImageFallback = (category: string) => {
    const iconClass = "h-12 w-12 text-white/90 drop-shadow-md";
    const containerClass = "relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br";

    switch ((category || "").toLowerCase()) {
      case "laptops":
        return (
          <div className={`${containerClass} from-slate-700 to-slate-900 border-b border-border/10`}>
            <Laptop className={iconClass} />
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">Laptop Chassis</div>
          </div>
        );
      case "smartphones":
        return (
          <div className={`${containerClass} from-indigo-800 to-slate-900 border-b border-border/10`}>
            <Smartphone className={iconClass} />
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">Mobile Device</div>
          </div>
        );
      case "headphones":
        return (
          <div className={`${containerClass} from-cyan-700 to-indigo-900 border-b border-border/10`}>
            <Headphones className={iconClass} />
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">Audio Unit</div>
          </div>
        );
      case "tablets":
        return (
          <div className={`${containerClass} from-emerald-700 to-slate-900 border-b border-border/10`}>
            <Tablet className={iconClass} />
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">Tablet PC</div>
          </div>
        );
      case "smartwatches":
        return (
          <div className={`${containerClass} from-rose-700 to-indigo-900 border-b border-border/10`}>
            <Watch className={iconClass} />
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">Wrist Engine</div>
          </div>
        );
      case "cameras":
        return (
          <div className={`${containerClass} from-amber-700 to-slate-900 border-b border-border/10`}>
            <Camera className={iconClass} />
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">Optic sensor</div>
          </div>
        );
      default:
        return (
          <div className={`${containerClass} from-slate-700 to-slate-900 border-b border-border/10`}>
            <Laptop className={iconClass} />
          </div>
        );
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border border-border bg-card shadow-sm hover:shadow-md hover-lift">
      
      {/* Product Image Container */}
      <div className="relative group overflow-hidden h-40 bg-muted/30">
        {isExternalImage ? (
          <img
            src={imageUrl}
            alt={product?.title || "Product"}
            className="w-full h-full object-cover rounded-t-xl transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          renderProductImageFallback(product?.category || "")
        )}
        
        {/* Rating Floating Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="glass flex items-center gap-1 font-bold text-foreground py-0.5 border-border/50">
            ⭐ {product?.rating || 0}
          </Badge>
        </div>

        {/* Brand floating label */}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="glass font-bold text-foreground py-0.5 border-border/50 uppercase tracking-wider text-[9px]">
            {product?.brand || "Generic"}
          </Badge>
        </div>
      </div>

      <CardHeader className="p-4 pb-1">
        {productId ? (
          <Link href={`/product/${productId}`} className="hover:underline">
            <CardTitle className="text-sm font-bold line-clamp-2 text-foreground h-10 leading-tight">
              {product?.title || "Product"}
            </CardTitle>
          </Link>
        ) : (
          <CardTitle className="text-sm font-bold line-clamp-2 text-foreground h-10 leading-tight">
            {product?.title || "Product"}
          </CardTitle>
        )}
      </CardHeader>

      <CardContent className="p-4 py-2 flex-grow flex flex-col justify-between">
        {/* Features Bullet List */}
        <ul className="space-y-1.5 mb-4 text-xs text-muted-foreground">
          {(product?.features || []).slice(0, 2).map((feat, idx) => (
            <li key={idx} className="line-clamp-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              {feat}
            </li>
          ))}
        </ul>

        {/* Recommendation Explanations */}
        {explanations && explanations.length > 0 && (
          <div className="mb-4 p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
            <div className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-1">Recommended because:</div>
            <ul className="space-y-0.5">
              {explanations.map((exp, idx) => (
                <li key={idx} className="text-[10px] text-slate-300 flex items-center gap-1 font-medium">
                  <span className="text-emerald-400">✓</span>
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pricing tag */}
        <div className="flex items-baseline gap-1 mt-auto">
          <span className="text-xs font-semibold text-muted-foreground">INR</span>
          <span className="text-xl font-extrabold text-foreground">
            ₹{(product?.price || 0).toLocaleString("en-IN")}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-3 flex items-center justify-between border-t border-border/50 gap-2">
        {/* Compare Checkbox Switcher */}
        {onCompareToggle && productId && (
          <Button
            type="button"
            variant={isComparing ? "accent" : "outline"}
            size="sm"
            onClick={() => onCompareToggle(productId)}
            className="flex items-center gap-1 h-8 px-2.5 cursor-pointer text-xs"
          >
            {isComparing ? (
              <>
                <Check className="h-3.5 w-3.5 text-black" />
                <span>Comparing</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Compare</span>
              </>
            )}
          </Button>
        )}

        <div className="flex gap-1 items-center">
          {onAskRufus && product?.title && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onAskRufus(product.title)}
              className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              title="Ask Shop product about this product"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}

          {productId && (
            <Link href={`/product/${productId}`}>
              <Button variant="ghost" size="sm" className="h-8 text-xs cursor-pointer hover:bg-muted">
                Specs
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
