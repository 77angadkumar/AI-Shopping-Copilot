import mongoose, { Schema, Document } from "mongoose";

export interface IPricePoint {
  price: number;
  date: Date;
}

export interface IPriceHistory extends Document {
  productId: mongoose.Types.ObjectId;
  currentPrice: number;
  history: IPricePoint[];
  createdAt: Date;
  updatedAt: Date;
}

const PricePointSchema: Schema = new Schema(
  {
    price: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now }
  },
  { _id: false }
);

const PriceHistorySchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, unique: true, index: true },
    currentPrice: { type: Number, required: true },
    history: { type: [PricePointSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.models.PriceHistory || mongoose.model<IPriceHistory>("PriceHistory", PriceHistorySchema);
