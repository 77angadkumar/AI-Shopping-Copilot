import { IProduct } from "./models/Product";
import { getEmbedding, cosineSimilarity } from "./vectorStore";
import { getProductReviewSummary } from "./reviewService";

export interface RecommendationExplanation {
  factor: "price" | "rating" | "popularity" | "sentiment" | "spec";
  text: string;
  positive: boolean;
}

export interface ScoredProduct {
  product: IProduct;
  score: number;
  scores: {
    relevance: number;
    priceMatch: number;
    rating: number;
    popularity: number;
    sentiment: number;
  };
  explanations: string[];
}

export interface RecommendationParams {
  query: string;
  products: IProduct[];
  budget?: { min?: number; max?: number };
  category?: string;
}

/**
 * Computes recommendation scores and details why each product is recommended.
 */
export async function rankAndExplainProducts(
  params: RecommendationParams
): Promise<ScoredProduct[]> {
  const { query, products, budget } = params;
  
  if (!products || products.length === 0) return [];

  // Generate vector representation of the query
  const queryVector = await getEmbedding(query);

  // Pre-calculate min/max bounds for normalization across the candidate list
  let maxPopularity = 1;
  products.forEach(p => {
    const pop = p.recommendationMetadata?.popularityScore || 0;
    if (pop > maxPopularity) maxPopularity = pop;
  });

  const scoredList: ScoredProduct[] = [];

  for (const product of products) {
    // 1. Relevance Score: Cosine similarity of vectors
    let prodEmbedding = product.embedding;
    if (!prodEmbedding || prodEmbedding.length !== queryVector.length) {
      // Fallback description embedding if size is incorrect or missing
      const text = `${product.title} ${product.brand} ${product.category} ${product.description}`;
      prodEmbedding = new Array(queryVector.length).fill(0); // fallback vector
    }
    const relevance = cosineSimilarity(queryVector, prodEmbedding);

    // 2. Price Match Score: Closeness to target budget
    let priceMatch = 1.0;
    if (budget) {
      const price = product.price;
      if (budget.max && price > budget.max) {
        // Linear degradation up to 1.5x of maximum budget
        const excessRatio = (price - budget.max) / budget.max;
        priceMatch = Math.max(0, 1 - excessRatio * 2);
      } else if (budget.min && price < budget.min) {
        // Linear degradation down to 0.5x of minimum budget
        const deficitRatio = (budget.min - price) / budget.min;
        priceMatch = Math.max(0, 1 - deficitRatio * 2);
      }
    }

    // 3. Rating Score: Normalized average user rating (out of 5)
    const rating = product.rating / 5.0;

    // 4. Popularity Score: Normalized popular metric (0 to 1)
    const rawPopularity = product.recommendationMetadata?.popularityScore || 0;
    const popularity = maxPopularity > 0 ? rawPopularity / maxPopularity : 0.5;

    // 5. Sentiment Score: Normalized review sentiment score (out of 5)
    let sentiment = rating; // fallback to rating if sentiment fetch fails
    try {
      const summary = await getProductReviewSummary(product._id.toString());
      if (summary && summary.sentiment > 0) {
        sentiment = summary.sentiment / 5.0;
      }
    } catch (e) {
      // Fallback quietly
    }

    // Composite Scorer Formula:
    // score = 0.35*relevance + 0.25*price + 0.20*rating + 0.10*popularity + 0.10*sentiment
    const finalScore =
      0.35 * relevance +
      0.25 * priceMatch +
      0.20 * rating +
      0.10 * popularity +
      0.10 * sentiment;

    // Generate Natural explanations for why this product is recommended
    const explanations: string[] = [];

    // Price explanations
    if (budget && budget.max && product.price <= budget.max) {
      explanations.push("Within budget");
    } else if (product.discountPercentage > 15) {
      explanations.push(`Great discount (Save ${product.discountPercentage}% off)`);
    }

    // Rating / Sentiment explanations
    if (product.rating >= 4.5) {
      explanations.push("Top-rated in customer satisfaction");
    } else if (sentiment * 5 >= 4.2) {
      explanations.push("Excellent overall review sentiment");
    }

    // Popularity explanations
    if (rawPopularity >= 85 || (maxPopularity > 0 && rawPopularity / maxPopularity >= 0.85)) {
      explanations.push("Highly popular customer choice");
    }

    // Specs-based explanations
    const specs = (product.specifications || {}) as any;
    const getSpecValue = (key: string): string => {
      if (specs instanceof Map) return specs.get(key) || "";
      if (specs && typeof specs.get === "function") return specs.get(key) || "";
      return specs[key] || "";
    };
    const desc = product.description.toLowerCase();
    
    // Check battery life
    const batterySpec = getSpecValue("Battery") || getSpecValue("Battery Life") || "";
    const batteryText = (batterySpec + " " + desc).toLowerCase();
    const batteryHoursMatch = batteryText.match(/(\d+)\s*hours/);
    if (batteryHoursMatch && parseInt(batteryHoursMatch[1]) >= 15) {
      explanations.push(`Excellent battery life (${batteryHoursMatch[1]} hours)`);
    } else if (batteryText.includes("long battery") || batteryText.includes("all-day battery")) {
      explanations.push("All-day battery performance");
    }

    // Check performance / RAM
    const ramSpec = getSpecValue("RAM") || getSpecValue("Memory") || "";
    if (ramSpec.toLowerCase().includes("16gb") || ramSpec.toLowerCase().includes("32gb") || ramSpec.toLowerCase().includes("64gb")) {
      explanations.push("High-performance system memory");
    }

    // Check display
    const displaySpec = getSpecValue("Display") || getSpecValue("Screen") || "";
    if (displaySpec.toLowerCase().includes("oled") || displaySpec.toLowerCase().includes("amoled") || displaySpec.toLowerCase().includes("retina")) {
      explanations.push("Vibrant premium OLED/Retina display");
    }

    // Ensure we have at least 2 explanations, fallback if needed
    if (explanations.length < 2) {
      if (product.rating >= 4.0) {
        explanations.push("Very good customer reviews");
      }
      explanations.push("Great specifications in category");
    }

    scoredList.push({
      product,
      score: parseFloat(finalScore.toFixed(4)),
      scores: { relevance, priceMatch, rating, popularity, sentiment },
      explanations: explanations.slice(0, 3) // Return top 3 explanations
    });
  }

  // Sort descending by composite score
  return scoredList.sort((a, b) => b.score - a.score);
}
