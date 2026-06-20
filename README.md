# amzRufus - GenAI Conversational Shopping Assistant

amzRufus is a production-ready, full-stack conversational AI shopping advisor modeled after Amazon's intelligent assistant experience. The system is designed to parse natural language queries, retrieve context-grounded products via hybrid semantic search, perform side-by-side spec comparisons, synthesize user reviews, and manage multi-turn conversational memory.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend API**: Next.js App Router API Routes
- **Database**: MongoDB (Mongoose ODM)
- **AI RAG & Vectors**: OpenAI (GPT-4o) / Google Gemini API, with a **Zero-Config Local Cosine Hashing Fallback**

---

## 🧠 System Architecture & Design

### 1. Overall System Layout
```
+--------------------------------------------------------------+
|                        Next.js Modern UI                     |
|            (Chat, Comparison, Dashboard, Product pages)      |
+--------------------------------------------------------------+
                               |
                               v (JSON API Routes)
+--------------------------------------------------------------+
|                     Next.js API Handler                      |
|        (/api/chat, /api/search, /api/compare, /api/history)  |
+--------------------------------------------------------------+
          |                    |                    |
          v                    v                    v
+------------------+ +------------------+ +--------------------+
| MongoDB Database | | Vectorizer Layer | |    LLM Adapter     |
| (Products,       | | (OpenAI / Local  | | (OpenAI / Gemini / |
|  Chat Sessions)  | |  Cosine Hash)    | |  Local fallback)   |
+------------------+ +------------------+ +--------------------+
```

### 2. Smart Query Understanding & Parser Pipeline
When a user inputs a query like *"gaming laptop under 80k with good battery"*, the request goes through the parsing layer:
1. **Category Extraction**: Identifies product intent (e.g., `laptops`, `smartphones`, etc.).
2. **Numeric Limit Resolver**: Parses budget bounds (e.g., `under 80k` -> `maxPrice: 80000`).
3. **Feature Priority Detector**: Isolates main priorities (e.g., `battery life` -> `priority: battery`).
4. **Query Cleaning**: Strips out pricing indicators (e.g., leaving *"gaming laptop with good battery life"* for clean semantic text-matching, preventing numbers from distorting cosine vectors).

### 3. Dual-Mode Embedding Calculation
To enable immediate out-of-the-box local testing without API billing blocks, amzRufus implements a dual-mode vectorizer:
- **API Mode**: Generates 1536-dimensional embeddings using OpenAI `text-embedding-3-small` if an active API key is set.
- **Local Fallback Mode**: Employs **Feature Hashing (384-dimensions)**. Text is cleaned, tokenized, and mapped to a 384-length vector via polynomial rolling hashing of terms. It applies custom synonym expansions (e.g. mapping "notebook" -> "laptop", "budget" -> "cheap") to simulate semantic correlation, L2-normalizes the vectors, and computes fast cosine similarity dot products in JS.

### 4. Multi-Turn Context-Aware Memory
Conversational threads are saved in MongoDB under `ChatSession` models. When a user sends a follow-up pronoun query (e.g., *"compare the second one"* or *"show me a cheaper alternative"*):
1. The engine checks if the prompt contains references to previous items.
2. It fetches the IDs of the products returned in the last assistant turn (`productsRetrieved`).
3. It fetches their full records from MongoDB.
4. It resolves the references (e.g., "second one" -> retrieves `productsRetrieved[1]`) and feeds them into the RAG context or filters the next database query (e.g., category: same, price: cheaper than average).

---

## 📂 Folder Structure

```
amazon-shopping-assistant/
├── src/
│   ├── app/                    # App Router Pages & APIs
│   │   ├── api/                # API Handlers (/chat, /search, /compare, etc.)
│   │   ├── chat/               # Conversational Chat Panel
│   │   ├── compare/            # Side-by-side Comparison Matrix
+│   │   ├── dashboard/          # Profile & System Metrics Diagnostics
│   │   ├── product/[id]/       # Product Specification Sheet & AI Summary
│   │   ├── layout.tsx
│   │   ├── globals.css         # Typography, Transitions & Custom Variables
│   │   └── page.tsx            # Landing Showcase
│   ├── components/
│   │   ├── chat/               # ChatMessage, History Sidebar, VoiceInput
│   │   ├── product/            # ProductCard, ProductGrid, SpecTable Matrix
│   │   └── layout/             # Header Navbar & footer
│   └── lib/                    # core logic
│       ├── db.ts               # Serverless Mongo Mongoose Connector
│       ├── mockData.ts         # Seeding Catalog Data
│       ├── queryParser.ts      # Regex & AI JSON Query Parsers
│       ├── vectorStore.ts      # Embedding Vectors & Cosine Similarity search
│       ├── llm.ts              # OpenAI, Gemini & Rule-based RAG fallbacks
│       └── models/             # Mongoose schemas (Product, ChatSession)
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://localhost:27017` OR Docker

### Option A: Local Quickstart
1. **Clone & Open Workspace**:
   Set `amazon-shopping-assistant` as your editor's active workspace.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Setup**:
   Copy the env file and set your keys if available (otherwise it runs in local fallback mode):
   ```bash
   copy .env.example .env.local
   ```
4. **Seed the Database**:
   Start your local MongoDB instance. In another terminal, run:
   ```bash
   npm run dev
   ```
   Now send a `POST` request to `http://localhost:3000/api/db/seed` (via curl or Postman) to populate your database with vectorized products:
   ```bash
   curl -X POST http://localhost:3000/api/db/seed
   ```
5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

### Option B: Docker Compose Quickstart (Recommended)
You can spin up MongoDB and the Next.js app with one command:
1. Make sure Docker is running on your machine.
2. Run:
   ```bash
   docker-compose up --build
   ```
3. Once running, trigger the seeding endpoint to populate products:
   ```bash
   curl -X POST http://localhost:3000/api/db/seed
   ```
4. Access the web interface at `http://localhost:3000`.

---

## 🔌 API Documentation

### 1. Chat Completion API (`POST /api/chat`)
Ties multi-turn conversational chat, intent parsing, context pronoun resolution, and RAG.
- **Request Body**:
  ```json
  {
    "sessionId": "session_unique_id",
    "message": "gaming laptop under 80000 with a long battery life"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "response": "Markdown formatted AI response recommending the ASUS TUF Gaming A15...",
    "products": [ { "title": "ASUS TUF Gaming A15", "price": 75990, ... } ],
    "parsedQuery": { "category": "laptops", "maxPrice": 80000, "priority": "battery" }
  }
  ```

### 2. Search API (`GET /api/search?q=search_term`)
Retrieves products using vector similarity and custom filters.
- **Parameters**: `q` (query), `category` (optional), `brand` (optional), `maxPrice` (optional)
- **Response**:
  ```json
  {
    "success": true,
    "results": [ { "product": { ... }, "score": 0.89 } ]
  }
  ```

### 3. Comparison API (`POST /api/compare`)
Generates side-by-side pros, cons, and summary metrics.
- **Request Body**:
  ```json
  {
    "productIds": ["prod_id_1", "prod_id_2"]
  }
  ```

---

## 💬 Sample Prompts for Testing

Try inputs like these in the chat assistant to test smart parsing, RAG grounding, and multi-turn memory:

1. **Initial Search**:
   > *"Suggest a gaming laptop under ₹80,000 with good battery life."*
   - *Expected behavior*: AI recommends the **ASUS TUF Gaming A15** (priced at ₹75,990, with a 90Whr battery) and updates the right sidebar with its card.
2. **Contextual Follow-up**:
   > *"Which one is better for video editing?"*
   - *Expected behavior*: AI understands "which one" refers to the laptop discussed in the last turn and compares it against editing needs.
3. **Alternative Request**:
   > *"Do you have cheaper alternatives?"*
   - *Expected behavior*: AI identifies the category (laptops), calculates the average price of the previous items, searches the DB for cheaper laptops (e.g. Lenovo IdeaPad at ₹37,990), and returns them.
4. **Side-by-Side Comparison**:
   > *"Compare iPhone 15 Pro Max and Samsung S24 Ultra."*
   - *Expected behavior*: AI retrieves both flagship phones, shows a comparison breakdown, and structures cards in the sidebar.
