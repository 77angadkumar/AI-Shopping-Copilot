import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/Product";
import { getImageBufferEmbedding, getProductImageEmbedding } from "@/lib/imageEmbeddingService";
import { cosineSimilarity } from "@/lib/vectorStore";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "Missing image file" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compute upload image's visual embedding
    const queryVector = getImageBufferEmbedding(buffer, file.name, file.type);

    // Fetch all products to run vector matching
    const products = await Product.find({});

    const scoredProducts = products.map(p => {
      // Generate product's visual embedding
      const prodVector = getProductImageEmbedding(p.category, p.brand, p.title);
      const similarity = cosineSimilarity(queryVector, prodVector);

      return {
        product: {
          _id: p._id,
          title: p.title,
          brand: p.brand,
          price: p.price,
          rating: p.rating,
          category: p.category,
          description: p.description,
          features: p.features,
          image: p.image,
          specifications: p.specifications
        },
        score: parseFloat(similarity.toFixed(4))
      };
    });

    // Sort descending and take top 4 matches
    const matches = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return NextResponse.json({
      success: true,
      matches
    }, { status: 200 });

  } catch (error: any) {
    console.error("Image search API error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error during visual search"
    }, { status: 500 });
  }
}
