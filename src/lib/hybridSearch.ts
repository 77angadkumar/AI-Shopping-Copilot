import Product, { IProduct } from "./models/Product";
import { getEmbedding, cosineSimilarity, getLocalEmbedding } from "./vectorStore";
import { connectToDatabase } from "./db";

export interface HybridSearchResult {
  product: IProduct;
  score: number; // Combined score
  keywordScore: number;
  vectorScore: number;
}

// Stop words to clean queries
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant", "cannot", "could",
  "did", "do", "does", "doing", "dont", "down", "during", "each", "few", "for", "from", "further", "had", "has",
  "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into",
  "is", "it", "its", "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on",
  "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should",
  "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these",
  "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what",
  "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
]);

/**
 * Tokenizes and cleans a text query, filtering out common stop words.
 */
export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(term => term.length > 1 && !STOP_WORDS.has(term));
}

/**
 * Computes keyword search score simulating BM25 term weighting.
 */
export async function executeKeywordSearch(
  query: string,
  mongoQuery: any = {}
): Promise<{ product: IProduct; score: number }[]> {
  await connectToDatabase();
  const terms = tokenizeQuery(query);
  if (terms.length === 0) return [];

  // Find all candidate products that match at least one term
  const termRegexes = terms.map(term => new RegExp(term, "i"));
  const keywordQuery = {
    ...mongoQuery,
    $or: [
      { title: { $in: termRegexes } },
      { brand: { $in: termRegexes } },
      { category: { $in: termRegexes } },
      { description: { $in: termRegexes } },
      { features: { $in: termRegexes } }
    ]
  };

  const candidates = await Product.find(keywordQuery);
  const scoredCandidates = candidates.map(p => {
    let score = 0;
    
    terms.forEach(term => {
      const termLower = term.toLowerCase();
      
      // Match in Title (High Weight)
      if (p.title.toLowerCase().includes(termLower)) {
        score += 8.0;
      }
      // Match in Brand (Medium-High Weight)
      if (p.brand.toLowerCase().includes(termLower)) {
        score += 5.0;
      }
      // Match in Category (Medium Weight)
      if (p.category.toLowerCase().includes(termLower)) {
        score += 4.0;
      }
      // Match in Features (Medium-Low Weight)
      const featureMatches = p.features.filter((f: string) => f.toLowerCase().includes(termLower)).length;
      score += featureMatches * 2.0;

      // Match in Description (Low Weight)
      if (p.description.toLowerCase().includes(termLower)) {
        score += 1.0;
      }
    });

    return { product: p, score };
  });

  // Normalize scores to 0-1
  const maxScore = Math.max(...scoredCandidates.map(c => c.score), 1);
  return scoredCandidates
    .map(c => ({ product: c.product, score: c.score / maxScore }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Runs vector search matching
 */
export async function executeVectorSearch(
  query: string,
  mongoQuery: any = {}
): Promise<{ product: IProduct; score: number }[]> {
  await connectToDatabase();
  const queryVector = await getEmbedding(query);
  const candidates = await Product.find(mongoQuery);

  const scoredCandidates = candidates.map(p => {
    let prodEmbedding = p.embedding;
    if (!prodEmbedding || prodEmbedding.length !== queryVector.length) {
      prodEmbedding = getLocalEmbedding(p.description + " " + p.title);
    }
    const score = cosineSimilarity(queryVector, prodEmbedding);
    return { product: p, score };
  });

  return scoredCandidates.sort((a, b) => b.score - a.score);
}

/**
 * Combines BM25 and Vector Search with Reciprocal Rank Fusion (RRF) or Linear Combo
 */
export async function executeHybridSearch(
  query: string,
  filters: any = {},
  limit: number = 10
): Promise<HybridSearchResult[]> {
  await connectToDatabase();
  
  // Extract MongoDB specific query conditions
  const mongoQuery: any = {};
  if (filters.category && filters.category !== "all") {
    mongoQuery.category = filters.category.toLowerCase();
  }
  if (filters.brand) {
    mongoQuery.brand = new RegExp(filters.brand, "i");
  }
  if (filters.maxPrice || filters.minPrice) {
    mongoQuery.price = {};
    if (filters.minPrice) mongoQuery.price.$gte = filters.minPrice;
    if (filters.maxPrice) mongoQuery.price.$lte = filters.maxPrice;
  }

  // Run searches in parallel
  const [keywordResults, vectorResults] = await Promise.all([
    executeKeywordSearch(query, mongoQuery),
    executeVectorSearch(query, mongoQuery)
  ]);

  // Merge results
  const mergeMap = new Map<string, { product: IProduct; kScore: number; vScore: number }>();
  
  keywordResults.forEach(r => {
    const id = r.product._id.toString();
    mergeMap.set(id, { product: r.product, kScore: r.score, vScore: 0 });
  });

  vectorResults.forEach(r => {
    const id = r.product._id.toString();
    const existing = mergeMap.get(id);
    if (existing) {
      existing.vScore = r.score;
    } else {
      mergeMap.set(id, { product: r.product, kScore: 0, vScore: r.score });
    }
  });

  // Calculate composite score (0.4 keyword + 0.6 vector weight)
  const results: HybridSearchResult[] = [];
  mergeMap.forEach(item => {
    const compositeScore = 0.4 * item.kScore + 0.6 * item.vScore;
    results.push({
      product: item.product,
      score: parseFloat(compositeScore.toFixed(4)),
      keywordScore: parseFloat(item.kScore.toFixed(4)),
      vectorScore: parseFloat(item.vScore.toFixed(4))
    });
  });

  // Sort by composite score
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
