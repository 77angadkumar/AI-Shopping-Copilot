import { HybridSearchResult } from "./hybridSearch";
import { IProduct } from "./models/Product";
import { getProductReviewSummary } from "./reviewService";

export interface RerankedResult {
  product: IProduct;
  score: number;
  originalScore: number;
  boosts: {
    brand: number;
    category: number;
    budget: number;
    rating: number;
    sentiment: number;
  };
}

export interface UserPreferencesContext {
  favoriteBrands?: string[];
  preferredCategories?: string[];
  budgetRange?: { min: number; max: number };
}

/**
 * Reranks product candidates by incorporating rating, sentiment, and user preference boosts.
 */
export async function rerankProducts(
  candidates: HybridSearchResult[],
  preferences?: UserPreferencesContext
): Promise<RerankedResult[]> {
  const reranked: RerankedResult[] = [];

  for (const item of candidates) {
    const p = item.product;
    let score = item.score; // start with hybrid similarity score

    let brandBoost = 0;
    let categoryBoost = 0;
    let budgetBoost = 0;
    let ratingBoost = 0;
    let sentimentBoost = 0;

    // 1. Personalization boosts
    if (preferences) {
      // Favorite brand match
      if (preferences.favoriteBrands && preferences.favoriteBrands.length > 0) {
        const isFavBrand = preferences.favoriteBrands.some(
          b => b.toLowerCase() === p.brand.toLowerCase()
        );
        if (isFavBrand) {
          brandBoost = 0.08; // +8% score boost
        }
      }

      // Preferred category match
      if (preferences.preferredCategories && preferences.preferredCategories.length > 0) {
        const isFavCategory = preferences.preferredCategories.some(
          c => c.toLowerCase() === p.category.toLowerCase()
        );
        if (isFavCategory) {
          categoryBoost = 0.05; // +5% score boost
        }
      }

      // Budget fit match
      if (preferences.budgetRange) {
        const price = p.price;
        const { min, max } = preferences.budgetRange;
        if (price >= min && price <= max) {
          budgetBoost = 0.07; // +7% score boost for being within target budget
        } else if (price > max) {
          // Penalize slightly if it exceeds target budget limit
          const overageRatio = (price - max) / max;
          budgetBoost = -Math.min(0.2, overageRatio * 0.1); // up to -20% penalty
        }
      }
    }

    // 2. Rating boost (High ratings get small positive influence)
    if (p.rating >= 4.5) {
      ratingBoost = 0.06;
    } else if (p.rating >= 4.0) {
      ratingBoost = 0.03;
    } else if (p.rating < 3.0) {
      ratingBoost = -0.05; // penalty for low rated items
    }

    // 3. Sentiment boost
    try {
      const summary = await getProductReviewSummary(p._id.toString());
      if (summary && summary.sentiment > 0) {
        const sent = summary.sentiment;
        if (sent >= 4.5) {
          sentimentBoost = 0.06;
        } else if (sent >= 4.0) {
          sentimentBoost = 0.03;
        } else if (sent < 3.0) {
          sentimentBoost = -0.05;
        }
      }
    } catch (e) {
      // Fallback silently if reviews analysis fails
    }

    // Calculate final score
    const finalScore = parseFloat(
      Math.min(1.0, Math.max(0.0, score + brandBoost + categoryBoost + budgetBoost + ratingBoost + sentimentBoost)).toFixed(4)
    );

    reranked.push({
      product: p,
      score: finalScore,
      originalScore: item.score,
      boosts: {
        brand: brandBoost,
        category: categoryBoost,
        budget: budgetBoost,
        rating: ratingBoost,
        sentiment: sentimentBoost
      }
    });
  }

  // Sort descending by final score
  return reranked.sort((a, b) => b.score - a.score);
}
