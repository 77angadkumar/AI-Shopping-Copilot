import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { searchProducts } from "@/lib/vectorStore";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

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

    const results = await searchProducts(query, filters, 8);

    return NextResponse.json({
      success: true,
      query,
      filters,
      results: results.map(r => ({
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
