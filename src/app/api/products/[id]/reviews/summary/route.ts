import { NextRequest, NextResponse } from "next/server";
import { getProductReviewSummary } from "@/lib/reviewService";

export async function GET(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const summary = await getProductReviewSummary(productId);

    return NextResponse.json(
      { success: true, summary },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in review summary API:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
