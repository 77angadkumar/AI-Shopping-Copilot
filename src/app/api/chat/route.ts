import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ChatSession, { IMessage } from "@/lib/models/ChatSession";
import Product from "@/lib/models/Product";
import { parseQuery } from "@/lib/queryParser";
import { searchProducts } from "@/lib/vectorStore";
import { generateRAGResponse } from "@/lib/llm";
import { rankAndExplainProducts } from "@/lib/recommendationEngine";
import UserPreference from "@/lib/models/UserPreference";
import { evaluateCopilotState, executeCopilotSearch } from "@/lib/shoppingCopilot";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { sessionId, message, userId = "anonymous" } = await req.json();
    
    if (!sessionId || !message) {
      return NextResponse.json({ success: false, error: "Missing sessionId or message" }, { status: 400 });
    }

    // 1. Fetch or create chat session
    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({ sessionId, messages: [] });
    }

    const history: IMessage[] = session.messages;

    // Load user preferences profile
    const preference = await UserPreference.findOne({ userId });

    // Evaluate Copilot state
    const formattedHistory = history.map(h => ({
      role: h.role,
      content: h.content,
    }));
    const copilotState = await evaluateCopilotState(formattedHistory, message);

    if (copilotState.isActive && copilotState.nextPrompt) {
      // Save user message to history
      const userMsg: IMessage = {
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      session.messages.push(userMsg);

      // Save assistant message to history
      const assistantMsg: IMessage = {
        role: "assistant",
        content: copilotState.nextPrompt,
        timestamp: new Date(),
        productsRetrieved: []
      };
      session.messages.push(assistantMsg);
      await session.save();

      return NextResponse.json({
        success: true,
        response: copilotState.nextPrompt,
        products: [],
        copilotState: {
          isActive: true,
          slots: copilotState.slots,
          options: copilotState.options
        }
      }, { status: 200 });
    }

    // If we completed the slot filling, let's run the copilot search and return recommendations
    const wasSlotFillingInHistory = formattedHistory.length > 0 && 
      (await evaluateCopilotState(formattedHistory.slice(0, -1), formattedHistory[formattedHistory.length - 1]?.content || "")).isActive;

    if (wasSlotFillingInHistory && !copilotState.isActive) {
      const rankedResults = await executeCopilotSearch(copilotState.slots);
      const retrievedProducts = rankedResults.map(r => r.product);
      const slotSummary = `shopper preferences: Category: ${copilotState.slots.category}, Budget: under ₹${copilotState.slots.budget?.toLocaleString()}, Use: ${copilotState.slots.purpose || "general"}, Brand: ${copilotState.slots.brand || "any"}.`;

      // Save user message to history
      const userMsg: IMessage = {
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      session.messages.push(userMsg);

      const rHistory = session.messages.map(h => ({ role: h.role, content: h.content }));
      const responseContent = await generateRAGResponse(
        `Provide a helpful shopping comparison and recommendation for products matching: ${slotSummary}`,
        rHistory.slice(0, -1),
        retrievedProducts,
        preference
      );

      // Save assistant message to history
      const assistantMsg: IMessage = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        productsRetrieved: retrievedProducts.map(p => p._id),
      };
      session.messages.push(assistantMsg);
      await session.save();

      return NextResponse.json({
        success: true,
        response: responseContent,
        products: rankedResults.map(r => ({
          _id: r.product._id,
          title: r.product.title,
          brand: r.product.brand,
          price: r.product.price,
          rating: r.product.rating,
          category: r.product.category,
          description: r.product.description,
          features: r.product.features,
          image: r.product.image,
          specifications: r.product.specifications,
          explanations: r.explanations,
          score: r.score
        })),
        copilotState: {
          isActive: false,
          slots: copilotState.slots
        }
      }, { status: 200 });
    }

    // 2. Query Understanding (Extract filters)
    const parsed = await parseQuery(message);
    
    // 3. Context Analysis (Is it a follow-up reference?)
    const lowerMessage = message.toLowerCase();
    const isReference = /\b(first|second|third|last|previous|it|them|alternative|cheaper|better|lighter|heavier|compare|vs)\b/i.test(lowerMessage);
    
    let retrievedProducts: any[] = [];
    let isFollowUpSearch = false;
    let referencedCategory = parsed.category;

    // Extract products from the last assistant message if this is a follow-up reference
    let lastAssistantMessage: IMessage | undefined;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === "assistant") {
        lastAssistantMessage = history[i];
        break;
      }
    }

    const lastProducts = lastAssistantMessage?.productsRetrieved || [];

    if (isReference && lastProducts.length > 0) {
      // Fetch full product objects from the last turn
      const prevProducts = await Product.find({ _id: { $in: lastProducts } });
      
      // Keep them in the original order they were returned
      const prevProductsOrdered = lastProducts
        .map(id => prevProducts.find(p => p._id.toString() === id.toString()))
        .filter(Boolean);

      if (prevProductsOrdered.length > 0) {
        referencedCategory = prevProductsOrdered[0]?.category || parsed.category;
        
        // Scenario A: "show cheaper alternatives" or "do you have cheaper options?"
        if (/\b(cheap|cheaper|less\s+expensive|budget)\b/i.test(lowerMessage)) {
          const avgPrice = prevProductsOrdered.reduce((sum, p: any) => sum + p.price, 0) / prevProductsOrdered.length;
          
          // Search for products in the same category but cheaper than the average price of previous products
          const cheaperProducts = await Product.find({
            category: referencedCategory,
            price: { $lt: avgPrice },
          }).sort({ price: 1 }).limit(3);

          if (cheaperProducts.length > 0) {
            retrievedProducts = cheaperProducts;
            isFollowUpSearch = true;
          } else {
            // If no cheaper products, fall back to general database search
            retrievedProducts = prevProductsOrdered;
          }
        }
        // Scenario B: "compare the second one" or "show details of first"
        else if (/\b(first|1st|second|2nd|third|3rd|last)\b/i.test(lowerMessage)) {
          let index = -1;
          if (/\b(first|1st)\b/i.test(lowerMessage)) index = 0;
          else if (/\b(second|2nd)\b/i.test(lowerMessage)) index = 1;
          else if (/\b(third|3rd)\b/i.test(lowerMessage)) index = 2;
          else if (/\b(last)\b/i.test(lowerMessage)) index = prevProductsOrdered.length - 1;

          if (index >= 0 && index < prevProductsOrdered.length) {
            const targetProd = prevProductsOrdered[index];
            if (targetProd) {
              // If comparing the second one, we compare it with the first one, or search for items to compare it with
              if (lowerMessage.includes("compare") || lowerMessage.includes("vs")) {
                retrievedProducts = [prevProductsOrdered[0], targetProd].filter(Boolean);
              } else {
                retrievedProducts = [targetProd];
              }
              isFollowUpSearch = true;
            }
          }
        }
        
        // Scenario C: General spec comparisons e.g., "which is lighter?", "which has the best battery?"
        // We will pass the previous products to the LLM so it can directly evaluate them.
        if (retrievedProducts.length === 0) {
          retrievedProducts = prevProductsOrdered;
        }
      }
    }

    // 4. Default database search (if not resolved by contextual follow-up)
    if (retrievedProducts.length === 0) {
      // Build search query filters based on NL extraction
      const filters: any = {};
      if (parsed.category && parsed.category !== "all") {
        filters.category = parsed.category;
      }
      if (parsed.maxPrice) {
        filters.maxPrice = parsed.maxPrice;
      }
      if (parsed.minPrice) {
        filters.minPrice = parsed.minPrice;
      }
      if (parsed.brand) {
        filters.brand = parsed.brand;
      }

      // Run semantic search over the database
      const searchResults = await searchProducts(parsed.cleanedQuery, filters, 4);
      retrievedProducts = searchResults.map(r => r.product);
    }

    // Load user preferences profile (already fetched at top, just re-use)

    // 5. Rank and generate explanations for retrieved products
    const budget = (parsed.minPrice || parsed.maxPrice) 
      ? { min: parsed.minPrice, max: parsed.maxPrice }
      : (preference?.budgetRange ? { min: preference.budgetRange.min, max: preference.budgetRange.max } : undefined);

    const rankedResults = await rankAndExplainProducts({
      query: message,
      products: retrievedProducts,
      budget
    });

    const orderedProducts = rankedResults.map(r => r.product);

    // Save user message to history
    const userMsg: IMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    session.messages.push(userMsg);

    // 6. Generate grounded RAG response
    const formattedHistory = history.map(h => ({
      role: h.role,
      content: h.content,
    }));

    const responseContent = await generateRAGResponse(message, formattedHistory, orderedProducts, preference);

    // Save assistant message to history with links to retrieved products
    const assistantMsg: IMessage = {
      role: "assistant",
      content: responseContent,
      timestamp: new Date(),
      productsRetrieved: orderedProducts.map(p => p._id),
    };
    session.messages.push(assistantMsg);

    await session.save();

    return NextResponse.json({
      success: true,
      response: responseContent,
      products: rankedResults.map(r => ({
        _id: r.product._id,
        title: r.product.title,
        brand: r.product.brand,
        price: r.product.price,
        rating: r.product.rating,
        category: r.product.category,
        description: r.product.description,
        features: r.product.features,
        image: r.product.image,
        specifications: r.product.specifications,
        explanations: r.explanations,
        score: r.score
      })),
      parsedQuery: parsed,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
