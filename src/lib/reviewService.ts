import Review, { IReview } from "./models/Review";
import Product from "./models/Product";
import { connectToDatabase } from "./db";
import { analyzeReviews, ReviewAnalysisResult } from "./reviewAnalyzer";

// In-memory cache for product review summaries to prevent repeated API calls
const reviewSummaryCache = new Map<string, { result: ReviewAnalysisResult; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

export async function getProductReviewSummary(productId: string): Promise<ReviewAnalysisResult> {
  await connectToDatabase();

  // Check memory cache
  const cached = reviewSummaryCache.get(productId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  // Fetch product information
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error(`Product not found with ID: ${productId}`);
  }

  // Fetch reviews for this product
  const reviews = await Review.find({ productId }).sort({ date: -1 });

  // Analyze reviews
  const result = await analyzeReviews(reviews, {
    title: product.title,
    category: product.category
  });

  // Save to cache
  reviewSummaryCache.set(productId, {
    result,
    timestamp: Date.now()
  });

  return result;
}

/**
 * Returns raw reviews list with pagination
 */
export async function getProductReviews(
  productId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ reviews: IReview[]; total: number }> {
  await connectToDatabase();
  
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find({ productId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ productId })
  ]);

  return { reviews, total };
}
