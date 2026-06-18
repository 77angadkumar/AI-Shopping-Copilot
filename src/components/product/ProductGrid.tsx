"use client";

import React, { useState } from "react";
import ProductCard, { ProductData } from "./ProductCard";
import CompareWidget, { SelectedProduct } from "./CompareWidget";

interface ProductGridProps {
  products: ProductData[];
  onAskRufus?: (productTitle: string) => void;
}

export default function ProductGrid({ products, onAskRufus }: ProductGridProps) {
  const [selectedCompare, setSelectedCompare] = useState<SelectedProduct[]>([]);

  const handleCompareToggle = (productId: string) => {
    const isSelected = selectedCompare.some((p) => p._id === productId);

    if (isSelected) {
      // Remove item
      setSelectedCompare((prev) => prev.filter((p) => p._id !== productId));
    } else {
      // Add item
      const productObj = products.find((p) => p._id === productId);
      if (!productObj) return;

      if (selectedCompare.length >= 3) {
        alert("You can compare a maximum of 3 products side-by-side.");
        return;
      }

      setSelectedCompare((prev) => [
        ...prev,
        {
          _id: productObj._id,
          title: productObj.title,
          price: productObj.price,
        },
      ]);
    }
  };

  const handleRemoveCompare = (productId: string) => {
    setSelectedCompare((prev) => prev.filter((p) => p._id !== productId));
  };

  const handleClearCompare = () => {
    setSelectedCompare([]);
  };

  if (products.length === 0) {
    return (
      <div className="w-full text-center py-12 bg-card rounded-xl border border-border mt-6">
        <p className="text-muted-foreground text-sm">No products found matching these filters.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-24">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            isComparing={selectedCompare.some((p) => p._id === product._id)}
            onCompareToggle={handleCompareToggle}
            onAskRufus={onAskRufus}
          />
        ))}
      </div>

      {/* Floating comparison widget */}
      <CompareWidget
        selectedProducts={selectedCompare}
        onRemove={handleRemoveCompare}
        onClear={handleClearCompare}
      />
    </div>
  );
}
