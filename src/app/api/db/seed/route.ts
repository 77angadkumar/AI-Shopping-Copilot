import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/Product";
import { mockProducts } from "@/lib/mockData";
import { getEmbedding } from "@/lib/vectorStore";

export async function POST() {
  try {
    await connectToDatabase();

    // Clear existing products
    await Product.deleteMany({});

    console.log("Database cleared. Starting product seeding...");

    const seededProducts = [];

    for (const item of mockProducts) {
      // Create rich description to build the semantic search index
      const embeddingText = `${item.title} ${item.brand} ${item.category} ${item.description} ${item.features.join(" ")}`;
      
      // Calculate embedding (uses OpenAI if API key available, else local hashing)
      const embedding = await getEmbedding(embeddingText);

      const product = await Product.create({
        ...item,
        embedding,
      });

      seededProducts.push({
        id: product._id,
        title: product.title,
        category: product.category,
        price: product.price,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${seededProducts.length} products.`,
      productsCount: seededProducts.length,
      products: seededProducts,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Database seeding failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error during seeding",
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST request to trigger seeding.",
  }, { status: 405 });
}
