import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/Product";
import { generateComparisonAnalysis } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { productIds } = await req.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Missing or invalid 'productIds' array in request body",
      }, { status: 400 });
    }

    // Fetch the products
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No products found for the provided IDs",
      }, { status: 404 });
    }

    // Sort products in the order of requested productIds
    const orderedProducts = productIds
      .map(id => products.find(p => p._id.toString() === id.toString()))
      .filter(Boolean);

    // Call RAG helper to generate side-by-side specifications and pros/cons analysis
    const analysis = await generateComparisonAnalysis(orderedProducts);

    return NextResponse.json({
      success: true,
      products: orderedProducts.map(p => ({
        _id: p._id,
        title: p.title,
        brand: p.brand,
        price: p.price,
        rating: p.rating,
        category: p.category,
        description: p.description,
        features: p.features,
        image: p.image,
        specifications: p.specifications,
      })),
      analysis,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Compare API error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error",
    }, { status: 500 });
  }
}
