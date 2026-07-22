"use client";

import React from "react";
import Link from "next/link";
import { Laptop, Smartphone, Headphones, Tablet, Watch, Camera } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface ComparisonProduct {
  _id: string;
  title: string;
  brand: string;
  price: number;
  rating: number;
  category: string;
  description: string;
  features: string[];
  image: string;
  specifications: Record<string, string>;
}

interface ProductSpecTableProps {
  products: ComparisonProduct[];
}

export default function ProductSpecTable({ products }: ProductSpecTableProps) {
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

  if (products.length === 0) return null;

  // Extract all unique specification keys across all products
  const allSpecKeys = Array.from(
    new Set(
      products.flatMap((p) => Object.keys(p.specifications || {}))
    )
  );

  const renderProductPhoto = (p: ComparisonProduct) => {
    const imageUrl = (p as any).imageUrl || p.image;
    const hasImage = imageUrl && imageUrl.startsWith("http") && !imageErrors[p._id];

    if (hasImage) {
      return (
        <div className="relative h-28 w-full rounded-lg overflow-hidden border border-border bg-muted/20">
          <img
            src={imageUrl}
            alt={p.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            loading="lazy"
            onError={() => {
              setImageErrors((prev) => ({ ...prev, [p._id]: true }));
            }}
          />
        </div>
      );
    }

    const iconClass = "h-8 w-8 text-white/90";
    const baseClass = "h-28 w-full rounded-lg flex items-center justify-center bg-gradient-to-br";
    const category = p.category || "";
    
    switch (category.toLowerCase()) {
      case "laptops":
        return <div className={`${baseClass} from-slate-700 to-slate-900`}><Laptop className={iconClass} /></div>;
      case "smartphones":
        return <div className={`${baseClass} from-indigo-800 to-slate-900`}><Smartphone className={iconClass} /></div>;
      case "headphones":
        return <div className={`${baseClass} from-cyan-700 to-indigo-900`}><Headphones className={iconClass} /></div>;
      case "tablets":
        return <div className={`${baseClass} from-emerald-700 to-slate-900`}><Tablet className={iconClass} /></div>;
      case "smartwatches":
        return <div className={`${baseClass} from-rose-700 to-indigo-900`}><Watch className={iconClass} /></div>;
      case "cameras":
        return <div className={`${baseClass} from-amber-700 to-slate-900`}><Camera className={iconClass} /></div>;
      default:
        return <div className={`${baseClass} from-slate-700 to-slate-900`}><Laptop className={iconClass} /></div>;
    }
  };

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden my-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px] bg-muted/30 font-bold text-foreground">
              Specifications
            </TableHead>
            {products.map((p) => (
              <TableHead key={p._id} className="min-w-[200px] align-top py-4">
                <div className="flex flex-col gap-3">
                  {renderProductPhoto(p)}
                  <Badge variant="outline" className="w-fit text-[9px] uppercase tracking-wider">
                    {p.brand}
                  </Badge>
                  <Link
                    href={`/product/${p._id}`}
                    className="font-bold text-sm text-foreground line-clamp-2 hover:underline hover:text-accent"
                  >
                    {p.title}
                  </Link>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* PRICE ROW */}
          <TableRow>
            <TableCell className="font-semibold text-muted-foreground bg-muted/10">Price</TableCell>
            {products.map((p) => (
              <TableCell key={p._id} className="font-extrabold text-lg text-foreground">
                ₹{p.price.toLocaleString("en-IN")}
              </TableCell>
            ))}
          </TableRow>

          {/* RATING ROW */}
          <TableRow>
            <TableCell className="font-semibold text-muted-foreground bg-muted/10">Rating</TableCell>
            {products.map((p) => (
              <TableCell key={p._id} className="font-medium text-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-500 font-bold">⭐ {p.rating}</span>
                  <span className="text-xs text-muted-foreground">/ 5</span>
                </div>
              </TableCell>
            ))}
          </TableRow>

          {/* CATEGORY ROW */}
          <TableRow>
            <TableCell className="font-semibold text-muted-foreground bg-muted/10">Category</TableCell>
            {products.map((p) => (
              <TableCell key={p._id} className="text-foreground capitalize text-sm">
                {p.category}
              </TableCell>
            ))}
          </TableRow>

          {/* DYNAMIC SPECS ROWS */}
          {allSpecKeys.map((key) => (
            <TableRow key={key}>
              <TableCell className="font-semibold text-muted-foreground bg-muted/10 capitalize">
                {key}
              </TableCell>
              {products.map((p) => (
                <TableCell key={p._id} className="text-foreground text-sm">
                  {p.specifications[key] || <span className="text-muted-foreground/60 italic">—</span>}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {/* KEY FEATURES ROW */}
          <TableRow>
            <TableCell className="font-semibold text-muted-foreground bg-muted/10">Key Highlights</TableCell>
            {products.map((p) => (
              <TableCell key={p._id} className="text-foreground">
                <ul className="space-y-1.5 list-disc pl-4 text-xs text-muted-foreground leading-relaxed">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="line-clamp-2">
                      {f}
                    </li>
                  ))}
                </ul>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
