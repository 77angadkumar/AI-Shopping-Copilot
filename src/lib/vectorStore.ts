import OpenAI from "openai";
import Product, { IProduct } from "./models/Product";
import { connectToDatabase } from "./db";

const VECTOR_DIMENSION = 384;

// Synonym mapping to enable rule-based query expansion in local mode
const SYNONYM_MAP: Record<string, string> = {
  notebook: "laptop",
  pc: "laptop",
  computer: "laptop",
  inexpensive: "cheap",
  affordable: "cheap",
  budget: "cheap",
  charge: "battery",
  power: "battery",
  photo: "camera",
  picture: "camera",
  lens: "camera",
  screen: "display",
  monitor: "display",
  audio: "sound",
  earphones: "headphones",
  earbuds: "headphones",
  watch: "smartwatch",
  ipad: "tablet",
};

// Simple hash function for local embedding fallback
function hashWord(word: string): number {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = (hash << 5) - hash + word.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Local vectorizer generating a normalized 384-dimensional vector using feature hashing
 */
export function getLocalEmbedding(text: string): number[] {
  const vector = new Array(VECTOR_DIMENSION).fill(0);
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/);

  for (const word of words) {
    if (!word) continue;
    // Apply synonym mapping
    const normalizedWord = SYNONYM_MAP[word] || word;
    const index = hashWord(normalizedWord) % VECTOR_DIMENSION;
    vector[index] += 1;
  }

  // L2 Normalization
  let sqSum = 0;
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    sqSum += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sqSum);
  if (norm > 0) {
    for (let i = 0; i < VECTOR_DIMENSION; i++) {
      vector[i] = vector[i] / norm;
    }
  } else {
    // If text is empty or has no words, return a uniform vector
    const val = 1 / Math.sqrt(VECTOR_DIMENSION);
    vector.fill(val);
  }

  return vector;
}

/**
 * Gets embeddings from OpenAI API or falls back to local vectorizer
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey !== "YOUR_OPENAI_API_KEY") {
    try {
      const openai = new OpenAI({ apiKey });
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.warn("OpenAI Embedding API failed, falling back to local vectorizer:", error);
    }
  }
  return getLocalEmbedding(text);
}

/**
 * Calculates cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    return 0; // Dimension mismatch
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface SearchFilters {
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  brand?: string;
}

/**
 * Core semantic search engine with metadata filters and ranking
 */
export async function searchProducts(
  query: string,
  filters: SearchFilters = {},
  limit = 5
): Promise<{ product: IProduct; score: number }[]> {
  await connectToDatabase();

  // Generate vector representation of the query
  const queryVector = await getEmbedding(query);

  // Build MongoDB query filters
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

  // Fetch candidate products
  const products = (await Product.find(mongoQuery)) as IProduct[];

  // Calculate scores
  const scoredProducts = products.map((product) => {
    // If the product vector size does not match query vector size, re-compute embedding on the fly
    let prodEmbedding = product.embedding;
    if (!prodEmbedding || prodEmbedding.length !== queryVector.length) {
      // Re-generate local embedding for search consistency
      prodEmbedding = getLocalEmbedding(product.description + " " + product.title);
    }
    
    let score = cosineSimilarity(queryVector, prodEmbedding);

    // Apply small boost if keywords match in title
    const queryTerms = query.toLowerCase().split(/\s+/);
    let titleMatches = 0;
    for (const term of queryTerms) {
      if (term.length > 2 && product.title.toLowerCase().includes(term)) {
        titleMatches++;
      }
    }
    if (titleMatches > 0) {
      score += titleMatches * 0.05; // 5% boost per title word match
    }

    return { product, score };
  });

  // Sort and select top K
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
