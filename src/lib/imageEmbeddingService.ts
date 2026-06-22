import { getLocalEmbedding } from "./vectorStore";

const VISUAL_DIMENSION = 384;

/**
 * Generates a mock visual feature embedding vector for a product image
 * based on its category, brand, and key visual attributes.
 */
export function getProductImageEmbedding(
  category: string,
  brand: string,
  title: string
): number[] {
  // We use our local feature hash vectorizer as the base for the visual vector,
  // focusing on visual adjectives (color, shape, material) to simulate a CLIP vector.
  const visualText = `${category} ${brand} ${title} metallic sleek gloss premium screen lens straps`;
  return getLocalEmbedding(visualText);
}

/**
 * Analyzes an uploaded image file buffer to determine its simulated visual embedding.
 * In a real production system, this would run a TensorFlow / ONNX / CLIP model.
 * Here we inspect the image metadata / buffer structure to generate a reproducible signature,
 * mapping it to product categories to simulate highly accurate visual searches.
 */
export function getImageBufferEmbedding(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): number[] {
  const hash = computeBufferHash(buffer);
  
  // Predict category based on filename or random seed from hash
  const categories = ["laptop", "smartphone", "headphone", "tablet", "smartwatch"];
  const categoryIndex = hash % categories.length;
  const predictedCategory = categories[categoryIndex];

  // Map filename terms to category hints if possible
  let finalCategory = predictedCategory;
  const lowerName = fileName.toLowerCase();
  if (lowerName.includes("laptop") || lowerName.includes("macbook") || lowerName.includes("dell") || lowerName.includes("hp")) {
    finalCategory = "laptop";
  } else if (lowerName.includes("phone") || lowerName.includes("iphone") || lowerName.includes("samsung") || lowerName.includes("pixel")) {
    finalCategory = "smartphone";
  } else if (lowerName.includes("headphone") || lowerName.includes("ear") || lowerName.includes("sony") || lowerName.includes("bose")) {
    finalCategory = "headphone";
  } else if (lowerName.includes("watch") || lowerName.includes("band") || lowerName.includes("fitbit")) {
    finalCategory = "smartwatch";
  } else if (lowerName.includes("ipad") || lowerName.includes("tablet")) {
    finalCategory = "tablet";
  }

  // Generate a visual vector for the predicted category, with slight variation from the hash seed
  const vector = getProductImageEmbedding(finalCategory, "generic", fileName);
  
  // Inject some noise based on the hash to represent unique visual features
  for (let i = 0; i < VISUAL_DIMENSION; i++) {
    const noise = (( (hash + i) % 100) / 500) - 0.1; // small noise [-0.1, 0.1]
    vector[i] += noise;
  }

  // Re-normalize vector
  let sumSq = 0;
  for (let i = 0; i < VISUAL_DIMENSION; i++) {
    sumSq += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < VISUAL_DIMENSION; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

/**
 * Helper to compute a quick integer hash of a buffer
 */
function computeBufferHash(buffer: Buffer): number {
  let hash = 0;
  // Sample 20 positions in the buffer to make hashing extremely fast
  const step = Math.max(1, Math.floor(buffer.length / 20));
  for (let i = 0; i < buffer.length; i += step) {
    hash = (hash << 5) - hash + buffer[i];
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
