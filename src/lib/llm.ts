import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { withRetry } from "./services/cacheService";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Local fallback RAG response generator.
 * Synthesizes a structured response from the products.
 */
function generateLocalRAGResponse(query: string, history: ChatMessage[], products: any[]): string {
  const normalized = query.toLowerCase();

  if (products.length === 0) {
    return `I searched our catalog but couldn't find any products matching that specific request. 

Could you try describing what features you're looking for, or specify a different category? We carry laptops, smartphones, headphones, tablets, and smartwatches.`;
  }

  const isComparisonQuery = normalized.includes("compare") || normalized.includes("vs") || normalized.includes("difference");
  const isBatteryQuery = normalized.includes("battery") || normalized.includes("charge") || normalized.includes("backup");
  const isCheapQuery = normalized.includes("cheap") || normalized.includes("budget") || normalized.includes("alternative");

  let response = "";

  // 1. Comparison query response
  if (isComparisonQuery && products.length >= 2) {
    const p1 = products[0];
    const p2 = products[1];
    response += `Here is a quick comparison between the **${p1.title}** and the **${p2.title}**:\n\n`;
    response += `* **Price**: ${p1.title} is priced at ₹${p1.price.toLocaleString()}, while ${p2.title} is ₹${p2.price.toLocaleString()}.\n`;
    response += `* **Rating**: ${p1.title} has a rating of ${p1.rating}/5, compared to ${p2.rating}/5 for ${p2.title}.\n`;
    
    // Spec overlap
    const p1Specs = p1.specifications || {};
    const p2Specs = p2.specifications || {};
    const commonKeys = Object.keys(p1Specs).filter(k => k in p2Specs);
    
    if (commonKeys.length > 0) {
      response += `* **Key Specifications**:\n`;
      commonKeys.slice(0, 4).forEach(k => {
        response += `  * **${k}**: ${p1.title} has *${p1Specs[k]}* | ${p2.title} has *${p2Specs[k]}*\n`;
      });
    }

    response += `\n### AI Recommendation Summary\n`;
    if (p1.price < p2.price) {
      response += `If budget is your priority, the **${p1.title}** is the clear choice, saving you ₹${(p2.price - p1.price).toLocaleString()}. However, the **${p2.title}** offers premium features and higher user satisfaction (${p2.rating}/5).`;
    } else {
      response += `The **${p2.title}** is more affordable at ₹${p2.price.toLocaleString()}. However, the **${p1.title}** provides superior specifications.`;
    }
    return response;
  }

  // 2. Battery query response
  if (isBatteryQuery) {
    const bestBatteryProd = [...products].sort((a, b) => {
      const getHours = (p: any) => {
        const desc = p.description.toLowerCase();
        const m = desc.match(/(\d+)\s*hours/);
        return m ? parseInt(m[1]) : 0;
      };
      return getHours(b) - getHours(a);
    })[0];

    response += `Based on battery performance, the **${bestBatteryProd.title}** stands out in this selection.\n\n`;
  } else if (isCheapQuery) {
    response += `Here are the most budget-friendly alternatives from our search:\n\n`;
  } else {
    response += `Based on your query, here are the top recommendations from our catalog:\n\n`;
  }

  // List products
  products.forEach((p, idx) => {
    response += `### ${idx + 1}. [${p.title}](file:///product/${p._id})\n`;
    response += `**Brand**: ${p.brand} | **Price**: ₹${p.price.toLocaleString()} | **Rating**: ⭐ ${p.rating}/5\n\n`;
    response += `> ${p.description}\n\n`;
    if (p.features && p.features.length > 0) {
      response += `**Key Highlights**:\n`;
      p.features.slice(0, 3).forEach((f: string) => {
        response += `* ${f}\n`;
      });
      response += `\n`;
    }
  });

  // Multi-turn contextual advice
  response += `*Tip: You can ask me to "compare the first two", "show a cheaper alternative", or ask "which of these has the best battery life?"*`;

  return response;
}

/**
 * Local fallback comparison analysis generator
 */
function generateLocalComparisonAnalysis(products: any[]) {
  const summary = `Based on our side-by-side analysis, we compared the ${products.map(p => p.title).join(", ")}. These items span different target segments, with prices ranging from ₹${Math.min(...products.map(p => p.price)).toLocaleString()} to ₹${Math.max(...products.map(p => p.price)).toLocaleString()}.`;
  
  const prosCons: Record<string, { pros: string[]; cons: string[] }> = {};
  
  products.forEach(p => {
    // Extract a mock pro and con from description or general category
    const isGaming = p.description.toLowerCase().includes("gaming") || p.title.toLowerCase().includes("gaming");
    const isApple = p.brand.toLowerCase() === "apple";
    const isBudget = p.price < 40000;

    const pros = [
      `Excellent rating of ${p.rating}/5 from customer reviews.`,
      p.features?.[0] || "High-quality premium build design.",
      p.features?.[1] || "Reliable battery performance for daily operations."
    ];

    const cons = [
      p.price > 100000 ? "Premium price tag makes it a substantial investment." : "Build materials include plastics to manage costs.",
      isApple ? "Limited compatibility outside the Apple ecosystem." : "Software UI contains some bloatware or lacks updates.",
      isGaming ? "Thermals can get warm under intense gaming sessions." : "Not designed for high-end gaming or 4K rendering."
    ];

    prosCons[p._id.toString()] = { pros, cons };
  });

  return { summary, prosCons };
}

/**
 * RAG generator supporting OpenAI, Gemini, and Local Fallbacks
 */
export async function generateRAGResponse(
  query: string,
  history: ChatMessage[],
  products: any[],
  userPreference?: any
): Promise<string> {
  const openAIApiKey = process.env.OPENAI_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  const productContext = products.map((p, idx) => {
    return `Product #${idx + 1}:
ID: ${p._id}
Title: ${p.title}
Brand: ${p.brand}
Category: ${p.category}
Price: ₹${p.price}
Rating: ${p.rating}/5
Description: ${p.description}
Specs: ${JSON.stringify(p.specifications)}
Features: ${p.features.join(", ")}
Reviews: ${p.reviews.join(" | ")}`;
  }).join("\n\n");

  let preferencePrompt = "";
  if (userPreference) {
    const brands = userPreference.favoriteBrands?.length > 0 ? userPreference.favoriteBrands.join(", ") : "None specified";
    const categories = userPreference.preferredCategories?.length > 0 ? userPreference.preferredCategories.join(", ") : "None specified";
    const budget = userPreference.budgetRange ? `₹${userPreference.budgetRange.min} to ₹${userPreference.budgetRange.max}` : "No preference";
    
    preferencePrompt = `
Shopper Personalization Preferences:
- Favorite Brands: ${brands}
- Preferred Categories: ${categories}
- Target Budget Range: ${budget}
- Viewed Products History Count: ${userPreference.viewedProducts?.length || 0}
- Purchase History Count: ${userPreference.purchaseHistory?.length || 0}

Rules for Personalization:
1. Prioritize recommending products matching the shopper's favorite brands and target budget range.
2. If suggesting products outside their target budget or from different brands, briefly explain the value proposition (e.g. "While this is slightly above your budget, it offers superior performance...").
3. Make reference to these preferences in a helpful, advisor-like tone where natural (e.g., "Since you prefer Apple...").`;
  }

  const systemPrompt = `You are a helpful, professional, and knowledgeable AI Shopping Assistant. Your goal is to replicate a premium, personalized shopping advisor named Shop product.
You will be provided with a user query, previous chat history, a set of retrieved products matching their search criteria, and optional shopper preferences.

Follow these strict rules:
1. Ground your answers ONLY in the retrieved products details. Do NOT hallucinate products that are not in the list.
2. Present products in a polished, readable Markdown format. Always link the product using Markdown syntax: [Product Title](file:///product/PRODUCT_ID) where PRODUCT_ID is the product's actual ID string.
3. Be conversational. Understand multi-turn references (e.g. if the user says "compare the second one", look at the previous context to identify which item is referenced).
4. If a user's question cannot be answered by the retrieved products, politely state that you don't have that information.
5. Provide clear, honest comparisons, highlighting pricing, pros, and cons. Keep your tone objective.
${preferencePrompt}

Retrieved Products Context:
${productContext}`;

  // 1. Try OpenAI
  if (openAIApiKey && openAIApiKey !== "YOUR_OPENAI_API_KEY") {
    try {
      const openai = new OpenAI({ apiKey: openAIApiKey });
      const apiMessages: any[] = [
        { role: "system", content: systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: "user", content: query }
      ];

      const response = await withRetry(() =>
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: apiMessages,
          temperature: 0.4,
        })
      );

      return response.choices[0].message.content || "";
    } catch (e) {
      console.error("OpenAI chat failed, trying Gemini or falling back...", e);
    }
  }

  // 2. Try Gemini
  if (geminiApiKey && geminiApiKey !== "YOUR_GEMINI_API_KEY") {
    try {
      // Import/configure GoogleGenerativeAI
      const ai = new GoogleGenerativeAI(geminiApiKey);
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Structure chat history for Gemini
      const contents = [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...history.map(h => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }]
        })),
        { role: "user", parts: [{ text: query }] }
      ];

      const result = await withRetry(() => model.generateContent({ contents }));
      const response = await result.response;
      return response.text();
    } catch (e) {
      console.error("Gemini chat failed, falling back to local...", e);
    }
  }

  // 3. Fallback to Local Engine
  return generateLocalRAGResponse(query, history, products);
}

/**
 * Generates side-by-side product comparison summary and pros/cons using AI
 */
export async function generateComparisonAnalysis(
  products: any[]
): Promise<{ summary: string; prosCons: Record<string, { pros: string[]; cons: string[] }> }> {
  const openAIApiKey = process.env.OPENAI_API_KEY;
  
  if (openAIApiKey && openAIApiKey !== "YOUR_OPENAI_API_KEY") {
    try {
      const openai = new OpenAI({ apiKey: openAIApiKey });
      const systemPrompt = `You are a premium AI product comparison advisor. Compare the following products side-by-side.
Analyze their specifications, user reviews, features, and price tags.
Provide a JSON response matching this interface:
{
  "summary": "A detailed 2-3 sentence overview recommendation advising which type of buyer should choose which product.",
  "prosCons": {
    "PRODUCT_ID_1": {
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2"]
    },
    "PRODUCT_ID_2": { ... }
  }
}

Do NOT wrap the response in markdown blocks. Return ONLY valid raw JSON.`;

      const productText = products.map(p => `
ID: ${p._id}
Title: ${p.title}
Price: ₹${p.price}
Specs: ${JSON.stringify(p.specifications)}
Reviews: ${(p.reviews || []).join(" | ")}`).join("\n\n");

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Compare these products:\n\n${productText}` }
        ],
        temperature: 0.2,
      });

      const text = response.choices[0].message.content?.trim() || "";
      const cleanText = text.replace(/^```json\s*|```$/g, "").trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("AI Comparison analysis failed, falling back to local analysis...", e);
    }
  }

  return generateLocalComparisonAnalysis(products);
}
