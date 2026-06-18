import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/Product";
import { rankAndExplainProducts } from "@/lib/recommendationEngine";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get("productId") || undefined;
    const category = searchParams.get("category") || undefined;
    const query = searchParams.get("q") || "";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 4;

    const budget = (minPrice || maxPrice) ? { min: minPrice, max: maxPrice } : undefined;

    // Case A: Fetch recommendations similar to a given product ID
    if (productId) {
      const sourceProduct = await Product.findById(productId);
      if (!sourceProduct) {
        return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
      }

      // Fetch other products in same category
      const candidates = await Product.find({
        category: sourceProduct.category,
        _id: { $ne: sourceProduct._id },
      });

      // Use source product title + category as the query to rank similar candidates
      const rankedResults = await rankAndExplainProducts({
        query: `${sourceProduct.title} ${sourceProduct.category}`,
        products: candidates,
        budget
      });

      return NextResponse.json({
        success: true,
        type: "similar",
        productId,
        recommendations: rankedResults.slice(0, limit),
      }, { status: 200 });
    }

    // Case B: General recommendations or search queries
    const queryFilter: any = {};
    if (category && category !== "all") {
      queryFilter.category = category.toLowerCase();
    }

    const candidates = await Product.find(queryFilter);
    const searchQuery = query || (category ? `best ${category}` : "popular product");

    const rankedResults = await rankAndExplainProducts({
      query: searchQuery,
      products: candidates,
      budget
    });

    return NextResponse.json({
      success: true,
      type: query ? "search" : "trending",
      recommendations: rankedResults.slice(0, limit),
    }, { status: 200 });

  } catch (error: any) {
    console.error("Recommend API error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error",
    }, { status: 500 });
  }
}
