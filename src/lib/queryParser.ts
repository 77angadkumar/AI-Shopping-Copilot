import OpenAI from "openai";

export interface ParsedQuery {
  category: string; // 'laptops' | 'smartphones' | 'headphones' | 'tablets' | 'smartwatches' | 'all'
  maxPrice?: number;
  minPrice?: number;
  brand?: string;
  priority?: string; // 'battery' | 'camera' | 'gaming' | 'weight' | 'sound' | 'display' | 'budget'
  cleanedQuery: string;
}

// Local regex-based query parser
export function parseQueryLocally(query: string): ParsedQuery {
  const normalized = query.toLowerCase();
  const result: ParsedQuery = {
    category: "all",
    cleanedQuery: query,
  };

  // 1. Extract category
  if (/\blaptops?\b|\bnotebooks?\b|\bmacbooks?\b/i.test(normalized)) {
    result.category = "laptops";
  } else if (/\bphones?\b|\bsmartphones?\b|\bmobiles?\b|\biphones?\b/i.test(normalized)) {
    result.category = "smartphones";
  } else if (/\bheadphones?\b|\bearphones?\b|\bearbuds?\b|\baudio\b|\bpods?\b/i.test(normalized)) {
    result.category = "headphones";
  } else if (/\btablets?\b|\bipads?\b/i.test(normalized)) {
    result.category = "tablets";
  } else if (/\bwatch(es)?\b|\bsmartwatch(es)?\b/i.test(normalized)) {
    result.category = "smartwatches";
  }

  // 2. Extract brand preference
  const brands = ["apple", "samsung", "asus", "razer", "lenovo", "oneplus", "xiaomi", "redmi", "sony", "boat", "amazfit"];
  for (const brand of brands) {
    if (new RegExp(`\\b${brand}\\b`, "i").test(normalized)) {
      result.brand = brand;
      break;
    }
  }

  // 3. Extract price limits
  // Match patterns like: under 80000, below 80k, under 80,000, under rs 80000, under rs. 80k, below 30,000
  const underRegex = /(?:under|below|less\s+than|budget\s+of|max(?:imum)?\s+of)?\s*(?:rs\.?|inr|₹)?\s*(\d+(?:[.,]\d+)?)\s*(k|000|lakh|l)?\b/i;
  
  // Find price bounds
  let match = normalized.match(underRegex);
  
  // If we match "under 80k" or just "80k" or "80000"
  // Let's refine the search for general numbers followed by 'k' or '000' with prefix hints
  const budgetMatch = normalized.match(/(?:under|below|less\s+than|budget\s+of|max|max\.?|₹|rs\.?|inr)\s*(\d+(?:[.,]\d+)?)\s*(k|000)?\b/i) || 
                      normalized.match(/\b(\d+)\s*(k|000)\b/i);

  if (budgetMatch) {
    const rawVal = parseFloat(budgetMatch[1].replace(/,/g, ""));
    const unit = budgetMatch[2] ? budgetMatch[2].toLowerCase() : "";
    let price = rawVal;
    if (unit === "k") {
      price = rawVal * 1000;
    } else if (unit === "000") {
      price = rawVal;
    }
    
    // Validate if it is a realistic price target (not years, RAM size like 16, etc.)
    if (price > 100 && price !== 1080 && price !== 144 && price !== 240) {
      result.maxPrice = price;
    }
  }

  // Min price check (e.g., "above 50k", "more than 30000")
  const aboveMatch = normalized.match(/(?:above|over|more\s+than|greater\s+than|starting\s+at)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:[.,]\d+)?)\s*(k|000)?\b/i);
  if (aboveMatch) {
    const rawVal = parseFloat(aboveMatch[1].replace(/,/g, ""));
    const unit = aboveMatch[2] ? aboveMatch[2].toLowerCase() : "";
    let price = rawVal;
    if (unit === "k") {
      price = rawVal * 1000;
    }
    result.minPrice = price;
  }

  // 4. Extract priority / focus area
  if (/\bbattery\b|\bcharge\b|\bendurance\b/i.test(normalized)) {
    result.priority = "battery";
  } else if (/\bcamera\b|\bphoto\b|\bzoom\b|\blens\b/i.test(normalized)) {
    result.priority = "camera";
  } else if (/\bgaming\b|\bplay\b|\brtx\b|\bgraphics\b/i.test(normalized)) {
    result.priority = "gaming";
  } else if (/\blight\b|\bweight\b|\bheavy\b|\bportable\b|\bslim\b/i.test(normalized)) {
    result.priority = "weight";
  } else if (/\bsound\b|\baudio\b|\bass\b|\banc\b|\bnoise\b/i.test(normalized)) {
    result.priority = "sound";
  } else if (/\bdisplay\b|\bscreen\b|\bbright\b|\boled\b|\bamoled\b/i.test(normalized)) {
    result.priority = "display";
  } else if (/\bcheap\b|\bbudget\b|\bvalue\b|\balternative\b/i.test(normalized)) {
    result.priority = "budget";
  }

  // 5. Clean query (strip numerical expressions to avoid biasing the vector model on numbers rather than features)
  let clean = query;
  // Remove phrases like "under 80000", "below 80k", "under 80k", etc.
  clean = clean.replace(/(?:under|below|less\s+than|above|starting\s+at|budget\s+of|max)?\s*(?:rs\.?|inr|₹)?\s*\d+(?:[.,]\d+)?\s*(?:k|000)?/gi, "");
  // Remove extra whitespaces
  clean = clean.replace(/\s+/g, " ").trim();
  result.cleanedQuery = clean || query;

  return result;
}

/**
 * Parses user search terms and returns structured query filters
 */
export async function parseQuery(query: string): Promise<ParsedQuery> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey !== "YOUR_OPENAI_API_KEY") {
    try {
      const openai = new OpenAI({ apiKey });
      const systemPrompt = `You are an AI query parser for an Amazon-style shopping search engine.
Analyze the user's natural language shopping query and return a valid JSON object matching this TypeScript interface:
{
  category: 'laptops' | 'smartphones' | 'headphones' | 'tablets' | 'smartwatches' | 'all';
  maxPrice?: number; // Maximum price budget in INR (numbers only, convert 80k to 80000)
  minPrice?: number; // Minimum price budget in INR
  brand?: string; // Brand preference lowercase (e.g. apple, samsung, sony, asus)
  priority?: 'battery' | 'camera' | 'gaming' | 'weight' | 'sound' | 'display' | 'budget';
  cleanedQuery: string; // The query with budget/price expressions stripped out (e.g. "gaming laptop with good battery life")
}

Do NOT wrap the JSON in markdown code blocks. Return ONLY raw JSON text.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Query: "${query}"` },
        ],
        temperature: 0.0,
      });

      const text = response.choices[0].message.content?.trim() || "{}";
      const cleanText = text.replace(/^```json\s*|```$/g, "").trim(); // strip code blocks if returned
      const result = JSON.parse(cleanText);
      
      // Post-process to ensure cleanedQuery is present
      if (!result.cleanedQuery) {
        result.cleanedQuery = query;
      }
      return result;
    } catch (error) {
      console.warn("AI Query Parser failed, using regex fallback:", error);
    }
  }

  return parseQueryLocally(query);
}
