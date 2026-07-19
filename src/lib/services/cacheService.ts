// Production-grade caching and api resilience service

interface CacheEntry {
  value: any;
  expiry: number;
}

// In-memory key-value fallback cache (Redis simulator)
const localCache = new Map<string, CacheEntry>();

/**
 * Gets a cached item. Resolves null if not found or expired.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const entry = localCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    localCache.delete(key); // clear expired entry
    return null;
  }

  return entry.value as T;
}

/**
 * Caches an item with a specified TTL (in seconds).
 */
export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds: number = 300 // default 5 minutes
): Promise<void> {
  const expiry = Date.now() + ttlSeconds * 1000;
  localCache.set(key, { value, expiry });
}

/**
 * Removes an item from the cache.
 */
export async function cacheDel(key: string): Promise<void> {
  localCache.delete(key);
}

/**
 * Clears expired keys to prevent memory leak
 */
export function purgeExpiredCacheKeys(): void {
  const now = Date.now();
  localCache.forEach((entry, key) => {
    if (now > entry.expiry) {
      localCache.delete(key);
    }
  });
}

/**
 * Executes a function with automatic retries and exponential backoff.
 * Extremely useful for making LLM APIs and visual embedding models highly resilient.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 500
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    console.warn(`[Retry Warning] Operation failed. Retrying in ${delayMs}ms... (${retries} attempts remaining). Error:`, error);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return withRetry(fn, retries - 1, delayMs * 2); // Double backoff delay
  }
}
