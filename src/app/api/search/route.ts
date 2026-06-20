import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { executeHybridSearch } from "@/lib/hybridSearch";
import { rerankProducts } from "@/lib/reranker";
import UserPreference from "@/lib/models/UserPreference";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const userId = searchParams.get("userId") || "anonymous";

    if (!query) {
      return NextResponse.json({
        success: false,
        error: "Missing search query parameter 'q'",
      }, { status: 400 });
    }

    const filters = {
      category,
      brand,
      minPrice,
      maxPrice,
    };

    // 1. Fetch user preferences context
    const preference = await UserPreference.findOne({ userId });

    // 2. Execute hybrid search
    const candidates = await executeHybridSearch(query, filters, 15);

    // 3. Rerank based on user profile context
    const reranked = await rerankProducts(candidates, preference || undefined);
    const topResults = reranked.slice(0, 8);

    return NextResponse.json({
      success: true,
      query,
      filters,
      results: topResults.map(r => ({
        product: {
          _id: r.product._id,
          title: r.product.title,
          brand: r.product.brand,
          price: r.product.price,
          rating: r.product.rating,
          category: r.product.category,
          description: r.product.description,
          features: r.product.features,
          image: r.product.image,
          specifications: r.product.specifications,
        },
        score: r.score,
        originalScore: r.originalScore,
        boosts: r.boosts
      })),
    }, { status: 200 });

  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error",
    }, { status: 500 });
  }
}
