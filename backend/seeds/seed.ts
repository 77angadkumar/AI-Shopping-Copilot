import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../../src/lib/models/Product";
import Review from "../../src/lib/models/Review";
import PriceHistory from "../../src/lib/models/PriceHistory";
import { getEmbedding } from "../../src/lib/vectorStore";

// Load environment configurations
dotenv.config({ path: path.join(__dirname, "..", "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/amazon-assistant";

async function runSeeder() {
  console.log("==================================================");
  console.log("⚡ Starting amzRufus Catalog Database Seeding ⚡");
  console.log("==================================================");

  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB Connection Successful.");

    // Load JSON datasets
    const productsPath = path.join(__dirname, "..", "data", "products.json");
    const reviewsPath = path.join(__dirname, "..", "data", "reviews.json");

    if (!fs.existsSync(productsPath) || !fs.existsSync(reviewsPath)) {
      throw new Error("Missing dataset files. Run 'node backend/scripts/generateCatalog.js' first.");
    }

    console.log("Reading products.json...");
    const rawProducts = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
    
    console.log("Reading reviews.json...");
    const rawReviews = JSON.parse(fs.readFileSync(reviewsPath, "utf-8"));

    console.log(`Loaded ${rawProducts.length} products and ${rawReviews.length} reviews.`);

    // 1. Clean collections
    console.log("Clearing existing collections (Products & Reviews)...");
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log("🧹 Database cleared.");

    // 2. Insert Products and generate vector embeddings
    console.log("Processing and embedding products (This may take a few moments)...");
    const seededProductsMap = new Map<string, mongoose.Types.ObjectId>();
    const productsToSave = [];

    // Check if we are using OpenAI API key
    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "YOUR_OPENAI_API_KEY";
    console.log(`Embedding generator: ${hasOpenAI ? "OpenAI API Mode" : "Local Cosine Hashing Mode (Offline)"}`);

    let count = 0;
    for (const prod of rawProducts) {
      count++;
      if (count % 50 === 0 || count === rawProducts.length) {
        console.log(`- Progress: Embedded ${count}/${rawProducts.length} products...`);
      }

      // Generate embedding vector
      const embeddingText = `${prod.title} ${prod.brand} ${prod.category} ${prod.description} ${prod.features.join(" ")}`;
      const embedding = await getEmbedding(embeddingText);

      // Create new MongoDB ObjectID so we can map reviews correctly
      const newId = new mongoose.Types.ObjectId(prod._id);
      seededProductsMap.set(prod._id, newId);

      // Map field details
      productsToSave.push({
        ...prod,
        _id: newId,
        image: prod.imageUrl, // sync fallback field
        embedding
      });
    }

    console.log("Bulk-inserting products into MongoDB...");
    const insertedProducts = await Product.insertMany(productsToSave);
    console.log(`✅ Seeded ${insertedProducts.length} products successfully.`);

    // 2b. Seed Price History snapshots (Phase 9)
    console.log("Generating price history snapshots...");
    await PriceHistory.deleteMany({});
    const priceHistoriesToSave = [];
    const today = new Date();

    for (const p of insertedProducts) {
      const historyPoints = [];
      const basePrice = p.price;

      for (let i = 14; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        let factor = 1.0;
        if (i === 10) factor = 1.05;
        else if (i === 7) factor = 0.95;
        else if (i === 3) factor = 0.90;
        else if (i === 0) factor = 1.0;
        else {
          factor = 0.9 + Math.random() * 0.15;
        }

        const priceVal = i === 0 ? basePrice : Math.round((basePrice * factor) / 10) * 10;
        historyPoints.push({
          price: priceVal,
          date
        });
      }

      priceHistoriesToSave.push({
        productId: p._id,
        currentPrice: basePrice,
        history: historyPoints
      });
    }

    await PriceHistory.insertMany(priceHistoriesToSave);
    console.log(`✅ Seeded ${priceHistoriesToSave.length} price histories successfully.`);

    // 3. Insert Reviews, mapping their referenced product ID
    console.log("Processing and mapping review entries...");
    const reviewsToSave = [];

    for (const rev of rawReviews) {
      const dbProductId = seededProductsMap.get(rev.productId);
      if (dbProductId) {
        reviewsToSave.push({
          ...rev,
          productId: dbProductId,
          date: new Date(rev.date)
        });
      }
    }

    console.log(`Bulk-inserting ${reviewsToSave.length} reviews into MongoDB (batch mode)...`);
    
    // Batch inserts to prevent memory spikes
    const BATCH_SIZE = 2000;
    let reviewsInserted = 0;
    
    for (let i = 0; i < reviewsToSave.length; i += BATCH_SIZE) {
      const batch = reviewsToSave.slice(i, i + BATCH_SIZE);
      const inserted = await Review.insertMany(batch);
      reviewsInserted += inserted.length;
      console.log(`- Progress: Seeded ${reviewsInserted}/${reviewsToSave.length} reviews...`);
    }

    console.log(`✅ Seeded ${reviewsInserted} reviews successfully.`);

    // 4. Create Indexes
    console.log("Creating database search indices...");
    try {
      await Product.collection.dropIndexes();
      console.log("🧹 Dropped old custom indices to avoid conflicts.");
    } catch (e) {
      console.log("No previous custom indices to drop.");
    }
    await Product.createIndexes();
    await Review.createIndexes();
    await PriceHistory.createIndexes();
    console.log("✅ Text and reference indices created successfully.");

    console.log("\n==================================================");
    console.log("🎉 Seeding Completed Successfully! 🎉");
    console.log(`Total Products: ${insertedProducts.length}`);
    console.log(`Total Reviews : ${reviewsInserted}`);
    console.log("==================================================");

  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
}

runSeeder();
