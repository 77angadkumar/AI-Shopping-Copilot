import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IReview } from "./models/Review";

export interface ReviewAnalysisResult {
  pros: string[];
  cons: string[];
  sentiment: number; // Scale: 1.0 to 5.0
  summary: string;
}

/**
 * Heuristic fallback for review analysis when LLM API keys are unavailable.
 * Analyzes word patterns, rating balances, and extracts key phrases.
 */
function analyzeReviewsLocally(reviews: IReview[], category: string = ""): ReviewAnalysisResult {
  if (!reviews || reviews.length === 0) {
    return {
      pros: ["No customer reviews available yet."],
      cons: ["No customer reviews available yet."],
      sentiment: 3.0,
      summary: "There are no reviews for this product yet to summarize."
    };
  }

  // Calculate average rating
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  
  // Basic positive/negative keyword lists for simple sentiment extracting
  const proKeywords = [
    "great", "love", "excellent", "best", "perfect", "awesome", "fast", "good", 
    "smooth", "premium", "amazing", "crisp", "beautiful", "solid", "durable", 
    "easy", "battery", "screen", "display", "clear", "value", "cheap", "lightweight"
  ];
  
  const conKeywords = [
    "bad", "slow", "worst", "poor", "disappointed", "break", "fragile", "heavy", 
    "expensive", "battery drain", "heating", "warm", "lag", "stuck", "stopped", 
    "charging", "plastic", "bloatware", "crash", "scratch", "short", "loud", "noisy"
  ];

  const proSentences: string[] = [];
  const conSentences: string[] = [];

  // Parse review texts to find positive and negative sentences
  reviews.forEach(review => {
    const text = review.reviewText.toLowerCase();
    const title = review.reviewTitle.toLowerCase();
    const sentences = (title + ". " + text).split(/[.!?]+/).map(s => s.trim()).filter(Boolean);

    sentences.forEach(sentence => {
      // Avoid sentence duplicates
      if (sentence.length < 15 || sentence.length > 80) return;

      const hasPro = proKeywords.some(keyword => sentence.includes(keyword));
      const hasCon = conKeywords.some(keyword => sentence.includes(keyword));

      if (review.rating >= 4 && hasPro && !hasCon) {
        if (proSentences.length < 5 && !proSentences.some(s => s.toLowerCase() === sentence.toLowerCase())) {
          proSentences.push(sentence);
        }
      } else if (review.rating <= 2 && hasCon && !hasPro) {
        if (conSentences.length < 5 && !conSentences.some(s => s.toLowerCase() === sentence.toLowerCase())) {
          conSentences.push(sentence);
        }
      }
    });
  });

  // Default pros/cons if none extracted
  if (proSentences.length === 0) {
    proSentences.push("Highly rated by majority of verified buyers.");
    proSentences.push("Performs well under standard operational conditions.");
    proSentences.push("Meets expectations for specifications in its category.");
  }
  if (conSentences.length === 0) {
    conSentences.push("Price point may feel premium to some budget-conscious buyers.");
    conSentences.push("Standard accessories package is basic.");
  }

  // Capitalize first letters of sentences
  const formatSentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Generate a dynamic summary paragraph based on average rating and category
  let summary = "";
  if (avgRating >= 4.5) {
    summary = `Customers are overwhelmingly positive about this ${category || "product"}. They frequently highlight its premium build, high performance, and reliable usability. It represents a top-tier choice with minimal reported issues.`;
  } else if (avgRating >= 3.8) {
    summary = `Overall satisfaction is solid for this ${category || "product"}. Verified purchasers note that it delivers great value and handles daily duties perfectly, though a few minor drawbacks are noted regarding battery life or materials.`;
  } else if (avgRating >= 3.0) {
    summary = `Reviews for this ${category || "product"} are mixed. While many users appreciate its core utility, others complain about specific performance throttling, warm temperatures, or quality control quirks.`;
  } else {
    summary = `This ${category || "product"} has received below-average ratings. Shoppers are generally dissatisfied, raising complaints about reliability, device lag, or poor price-to-performance ratio.`;
  }

  return {
    pros: proSentences.map(formatSentence),
    cons: conSentences.map(formatSentence),
    sentiment: parseFloat(avgRating.toFixed(1)),
    summary
  };
}

/**
 * Analyzes raw review list for a product and returns pros, cons, average sentiment, and summary.
 */
export async function analyzeReviews(
  reviews: IReview[],
  productInfo: { title: string; category: string }
): Promise<ReviewAnalysisResult> {
  if (!reviews || reviews.length === 0) {
    return {
      pros: ["No customer reviews yet"],
      cons: ["No customer reviews yet"],
      sentiment: 0.0,
      summary: "This product does not have any reviews yet."
    };
  }

  const openAIApiKey = process.env.OPENAI_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // Format reviews for LLM processing
  const reviewTexts = reviews
    .slice(0, 30) // limit context size to top 30 reviews
    .map((r, i) => `[Review #${i + 1}] Rating: ${r.rating}/5 | Title: "${r.reviewTitle}" | Body: "${r.reviewText}"`)
    .join("\n");

  const systemPrompt = `You are a premium AI Shopping Assistant specializing in parsing customer reviews.
Analyze the provided customer reviews for the product "${productInfo.title}" (Category: ${productInfo.category}).
Summarize the reviews into:
1. Pros: Top 3 to 5 clear advantages mentioned by verified buyers. Keep them brief and descriptive.
2. Cons: Top 2 to 4 disadvantages or common complaints. Keep them brief.
3. Sentiment score: A floating-point number between 1.0 and 5.0 indicating overall customer sentiment (where 5.0 is extremely positive, 1.0 is extremely negative). Align this with the review ratings.
4. Summary: A concise 2-3 sentence executive paragraph synthesizing user consensus.

Your response MUST be a valid JSON object matching the following structure:
{
  "pros": ["brief pro 1", "brief pro 2", ...],
  "cons": ["brief con 1", "brief con 2", ...],
  "sentiment": 4.6,
  "summary": "Shoppers generally love this product for its..."
}

Do NOT wrap the JSON response in markdown blocks. Return ONLY the raw JSON string.`;

  // 1. Try OpenAI if configured
  if (openAIApiKey && openAIApiKey !== "YOUR_OPENAI_API_KEY") {
    try {
      const openai = new OpenAI({ apiKey: openAIApiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Customer reviews list:\n\n${reviewTexts}` }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const text = response.choices[0].message.content?.trim() || "";
      return JSON.parse(text) as ReviewAnalysisResult;
    } catch (e) {
      console.warn("OpenAI review analysis failed, falling back to other methods:", e);
    }
  }

  // 2. Try Gemini if configured
  if (geminiApiKey && geminiApiKey !== "YOUR_GEMINI_API_KEY") {
    try {
      const ai = new GoogleGenerativeAI(geminiApiKey);
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nCustomer reviews list:\n\n${reviewTexts}` }] }
        ]
      });

      const text = result.response.text().trim();
      return JSON.parse(text) as ReviewAnalysisResult;
    } catch (e) {
      console.warn("Gemini review analysis failed, falling back to local analysis:", e);
    }
  }

  // 3. Fallback to Local Heuristic Analysis
  return analyzeReviewsLocally(reviews, productInfo.category);
}
