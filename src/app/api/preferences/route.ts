import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import UserPreference from "@/lib/models/UserPreference";

/**
 * GET /api/preferences
 * Retrieves user preferences. Query param: ?userId=xxx (default 'anonymous')
 */
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "anonymous";

    let preference = await UserPreference.findOne({ userId });
    
    // Auto-create a default preference profile if not exists
    if (!preference) {
      preference = await UserPreference.create({
        userId,
        favoriteBrands: [],
        preferredCategories: [],
        budgetRange: { min: 0, max: 200000 },
        viewedProducts: [],
        purchaseHistory: []
      });
    }

    return NextResponse.json({
      success: true,
      preference
    }, { status: 200 });

  } catch (error: any) {
    console.error("GET preferences error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error"
    }, { status: 500 });
  }
}

/**
 * POST /api/preferences
 * Creates or updates user preferences.
 */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const userId = body.userId || "anonymous";

    const updateData: any = {};
    if (body.favoriteBrands !== undefined) updateData.favoriteBrands = body.favoriteBrands;
    if (body.preferredCategories !== undefined) updateData.preferredCategories = body.preferredCategories;
    if (body.budgetRange !== undefined) {
      updateData.budgetRange = {
        min: Number(body.budgetRange.min || 0),
        max: Number(body.budgetRange.max || 1000000)
      };
    }
    
    // Push unique viewed products or purchase items if supplied
    if (body.viewedProduct) {
      updateData.$addToSet = { viewedProducts: body.viewedProduct };
    }
    if (body.purchasedProduct) {
      updateData.$addToSet = { purchaseHistory: body.purchasedProduct };
    }

    // Apply standard updates
    const preference = await UserPreference.findOneAndUpdate(
      { userId },
      body.viewedProduct || body.purchasedProduct ? { ...updateData } : { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      preference
    }, { status: 200 });

  } catch (error: any) {
    console.error("POST preferences error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error"
    }, { status: 500 });
  }
}
