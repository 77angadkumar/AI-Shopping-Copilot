import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import PriceHistory from "@/lib/models/PriceHistory";
import Product from "@/lib/models/Product";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    let historyRecord = await PriceHistory.findOne({ productId });

    if (!historyRecord) {
      // Fetch product to get current price reference
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
      }

      // Generate 15 days of pricing snapshots dynamically
      const historyPoints = [];
      const basePrice = product.price;
      const today = new Date();

      for (let i = 14; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        // Simulate random, minor fluctuations (e.g. ±8%)
        let factor = 1.0;
        if (i === 10) factor = 1.05; // temporary spike
        else if (i === 7) factor = 0.95; // dip
        else if (i === 3) factor = 0.90; // promotion dip
        else if (i === 0) factor = 1.0; // back to current price
        else {
          // slight random noise
          factor = 0.9 + Math.random() * 0.15;
        }

        // Keep current price exact for today
        const priceVal = i === 0 ? basePrice : Math.round((basePrice * factor) / 10) * 10;
        historyPoints.push({
          price: priceVal,
          date
        });
      }

      historyRecord = await PriceHistory.create({
        productId,
        currentPrice: basePrice,
        history: historyPoints
      });
    }

    // Extract statistics
    const prices = historyRecord.history.map((h: any) => h.price);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const currentPrice = historyRecord.currentPrice;
    
    const savings = highestPrice > currentPrice 
      ? Math.round(((highestPrice - currentPrice) / highestPrice) * 100) 
      : 0;

    return NextResponse.json({
      success: true,
      priceHistory: historyRecord.history,
      currentPrice,
      lowestPrice,
      highestPrice,
      savingsPercentage: savings
    }, { status: 200 });

  } catch (error: any) {
    console.error("GET price-history error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
