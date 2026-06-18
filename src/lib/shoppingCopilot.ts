import { ChatMessage } from "./llm";
import Product, { IProduct } from "./models/Product";
import { connectToDatabase } from "./db";
import { rankAndExplainProducts } from "./recommendationEngine";

export interface CopilotSlots {
  category: string;
  budget?: number; // max budget
  purpose?: "gaming" | "office" | "camera" | "general" | "sports" | "travel";
  brand?: string;
}

export interface CopilotState {
  isActive: boolean;
  slots: CopilotSlots;
  nextPrompt?: string; // If slots are missing, the question to ask the user
  options?: string[]; // Quick reply options for the user interface
}

// Category lists
const CATEGORIES = ["laptop", "smartphone", "tablet", "smartwatch", "headphone", "earbud", "monitor", "keyboard", "mouse", "gaming accessory"];

/**
 * Extracts category from message text
 */
function extractCategory(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const cat of CATEGORIES) {
    if (normalized.includes(cat) || normalized.includes(cat + "s")) {
      return cat;
    }
  }
  // Common synonyms
  if (normalized.includes("phone") || normalized.includes("mobile")) return "smartphone";
  if (normalized.includes("notebook") || normalized.includes("pc") || normalized.includes("computer")) return "laptop";
  if (normalized.includes("watch")) return "smartwatch";
  if (normalized.includes("headset") || normalized.includes("earphone")) return "headphone";
  return null;
}

/**
 * Extracts price/budget from message text
 */
function extractBudget(text: string): number | undefined {
  const normalized = text.toLowerCase();
  
  // Look for patterns like "80k", "50k", "₹40000", "40,000", "under 30000"
  const kMatch = normalized.match(/(\d+)\s*k/);
  if (kMatch) {
    return parseInt(kMatch[1]) * 1000;
  }
  
  const numMatch = normalized.match(/(?:under|below|around|approx)?\s*(?:rs\.?|inr|₹)?\s*(\d{1,3}(?:,\d{3})+|\d{4,6})/);
  if (numMatch) {
    // Strip commas
    const val = numMatch[1].replace(/,/g, "");
    return parseInt(val);
  }
  
  // Check text representations
  if (normalized.includes("cheap") || normalized.includes("budget")) return 30000;
  if (normalized.includes("premium") || normalized.includes("expensive")) return 120000;

  return undefined;
}

/**
 * Extracts purpose/use case from message text
 */
function extractPurpose(text: string): "gaming" | "office" | "camera" | "general" | "sports" | "travel" | undefined {
  const normalized = text.toLowerCase();
  if (normalized.includes("gaming") || normalized.includes("game") || normalized.includes("play")) return "gaming";
  if (normalized.includes("office") || normalized.includes("work") || normalized.includes("school") || normalized.includes("college") || normalized.includes("study") || normalized.includes("coding")) return "office";
  if (normalized.includes("camera") || normalized.includes("photo") || normalized.includes("shoot") || normalized.includes("picture")) return "camera";
  if (normalized.includes("sport") || normalized.includes("run") || normalized.includes("workout") || normalized.includes("gym") || normalized.includes("fitness")) return "sports";
  if (normalized.includes("travel") || normalized.includes("commute") || normalized.includes("noise cancelling") || normalized.includes("anc")) return "travel";
  if (normalized.includes("general") || normalized.includes("daily") || normalized.includes("casual")) return "general";
  return undefined;
}

/**
 * Extracts brand name from message text
 */
function extractBrand(text: string): string | undefined {
  const brands = ["apple", "samsung", "dell", "hp", "lenovo", "asus", "acer", "sony", "bose", "sennheiser", "boat", "jbl", "oneplus", "xiaomi", "redmi", "realme", "logitech", "razer", "corsair"];
  const normalized = text.toLowerCase();
  for (const b of brands) {
    if (normalized.includes(b)) {
      return b.charAt(0).toUpperCase() + b.slice(1);
    }
  }
  return undefined;
}

/**
 * Evaluates the conversation history to fill slots and manage the guided copilot state.
 */
export async function evaluateCopilotState(
  history: ChatMessage[],
  currentMessage: string
): Promise<CopilotState> {
  const slots: CopilotSlots = { category: "" };
  
  // Combine all user messages to check which slots have been filled over the conversation
  const userMessages = history
    .filter(m => m.role === "user")
    .map(m => m.content)
    .concat([currentMessage]);

  // 1. Try to find the category interest
  for (const msg of userMessages) {
    const cat = extractCategory(msg);
    if (cat) {
      slots.category = cat;
      break; // set the primary category
    }
  }

  // If no category intent is found anywhere in history, copilot is inactive
  if (!slots.category) {
    return { isActive: false, slots };
  }

  // Pluralized category name for queries
  const pluralCategory = slots.category.endsWith("s") ? slots.category : slots.category + "s";

  // 2. Scan history to populate budget, purpose, and brand
  for (const msg of userMessages) {
    const budget = extractBudget(msg);
    if (budget !== undefined) slots.budget = budget;
    
    const purpose = extractPurpose(msg);
    if (purpose !== undefined) slots.purpose = purpose;

    const brand = extractBrand(msg);
    if (brand !== undefined) slots.brand = brand;
  }

  // 3. Determine if slot-filling is completed or if we need to ask next question
  if (slots.budget === undefined) {
    return {
      isActive: true,
      slots,
      nextPrompt: `What is your maximum budget for the ${slots.category}?`,
      options: [
        `Under ₹20,000`,
        `₹20,000 - ₹50,000`,
        `₹50,000 - ₹80,000`,
        `Above ₹80,000`
      ]
    };
  }

  if (slots.purpose === undefined) {
    // Tailor options depending on category
    let purposePrompt = `What is your primary use case for this ${slots.category}?`;
    let options = ["General Daily Use", "Office Work / Coding", "Gaming"];
    
    if (slots.category === "smartphone") {
      purposePrompt = "What feature matters most to you in this smartphone?";
      options = ["High-end Camera", "Gaming & Performance", "All-day Battery life"];
    } else if (slots.category === "headphone" || slots.category === "earbud") {
      purposePrompt = "How do you plan to use these headphones?";
      options = ["Gym / Fitness", "Office & Calls", "Travel & Noise Cancellation"];
    }

    return {
      isActive: true,
      slots,
      nextPrompt: purposePrompt,
      options
    };
  }

  if (slots.brand === undefined) {
    // Let's check which brands are actually in the catalog for this category
    await connectToDatabase();
    const distinctBrands = await Product.distinct("brand", { category: pluralCategory.toLowerCase() });
    
    return {
      isActive: true,
      slots,
      nextPrompt: `Do you have a specific brand preference for your ${slots.category}?`,
      options: distinctBrands.slice(0, 3).concat(["Any Brand"])
    };
  }

  // All slots are successfully filled!
  return {
    isActive: false,
    slots
  };
}

/**
 * Fetches products matching slots, using the recommendation engine.
 */
export async function executeCopilotSearch(slots: CopilotSlots): Promise<any[]> {
  await connectToDatabase();
  
  const pluralCategory = slots.category.endsWith("s") ? slots.category : slots.category + "s";
  const mongoQuery: any = {
    category: pluralCategory.toLowerCase()
  };

  // Build spec / text filters based on purpose
  let purposeKeywords = "";
  if (slots.purpose === "gaming") {
    mongoQuery.$or = [
      { description: /gaming|graphics|gpu/i },
      { "specifications.GPU": { $exists: true } }
    ];
    purposeKeywords = "gaming gpu performance high-end graphics";
  } else if (slots.purpose === "office") {
    purposeKeywords = "business office student work battery slim lightweight";
  } else if (slots.purpose === "camera") {
    purposeKeywords = "camera megapixel photo zoom optic lens";
  } else if (slots.purpose === "sports") {
    mongoQuery.features = /water resistant|sweat|fit|sport/i;
    purposeKeywords = "sports sweatproof fitness run workout";
  }

  const products = await Product.find(mongoQuery);
  
  const budgetFilter = slots.budget ? { max: slots.budget } : undefined;
  const query = `${slots.brand || ""} ${slots.purpose || ""} ${slots.category} ${purposeKeywords}`;

  const rankedResults = await rankAndExplainProducts({
    query,
    products,
    budget: budgetFilter
  });

  return rankedResults;
}
