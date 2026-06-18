import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  brand: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  stock: number;
  category: string;
  description: string;
  specifications: Record<string, string>;
  reviews: string[];
  features: string[];
  image: string;
  imageUrl: string;
  tags: string[];
  warranty: string;
  availability: string;
  recommendationMetadata: {
    popularityScore: number;
    trendingScore: number;
    recommendationWeight: number;
    targetAudience: string;
  };
  searchableText: string;
  embedding: number[];
  createdAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discountPercentage: { type: Number, required: true },
    rating: { type: Number, required: true, default: 0 },
    reviewCount: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    specifications: { type: Map, of: String, default: {} },
    reviews: { type: [String], default: [] },
    features: { type: [String], default: [] },
    image: { type: String, required: true },
    imageUrl: { type: String, required: true },
    tags: { type: [String], default: [] },
    warranty: { type: String },
    availability: { type: String },
    recommendationMetadata: {
      popularityScore: { type: Number, default: 0 },
      trendingScore: { type: Number, default: 0 },
      recommendationWeight: { type: Number, default: 0 },
      targetAudience: { type: String }
    },
    searchableText: { type: String },
    embedding: { type: [Number], default: [] }
  },
  { timestamps: true }
);

// Add index on title, description, and searchableText for hybrid search fallback
ProductSchema.index({ title: "text", description: "text", searchableText: "text" });

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
