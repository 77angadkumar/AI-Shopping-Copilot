import mongoose, { Schema, Document } from "mongoose";

export interface IUserPreference extends Document {
  userId: string; // Identifier for the user (could be session id, username, or 'anonymous')
  favoriteBrands: string[];
  preferredCategories: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  viewedProducts: mongoose.Types.ObjectId[];
  purchaseHistory: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferenceSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    favoriteBrands: { type: [String], default: [] },
    preferredCategories: { type: [String], default: [] },
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 1000000 }
    },
    viewedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    purchaseHistory: [{ type: Schema.Types.ObjectId, ref: "Product" }]
  },
  { timestamps: true }
);

export default mongoose.models.UserPreference || mongoose.model<IUserPreference>("UserPreference", UserPreferenceSchema);
