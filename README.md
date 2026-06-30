# Chat with a Website — Crawl + RAG

A premium Full-Stack RAG (Retrieval-Augmented Generation) application that crawls a targeted website domain, extracts content, indexes it into a vector database, and hosts a grounded chatbot interface to answer questions about the site with full source citations.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React + Vite, styled using premium Vanilla CSS (Glassmorphism, Dark-first theme, responsive grids, and clean micro-animations).
- **Backend**: Node.js + Express.
- **RAG & AI**: LangChain, `@langchain/google-genai` (`gemini-2.5-flash` model), and `gemini-embedding-001` embeddings.
- **Vector DB**: ChromaDB.
- **Web Crawler**: Playwright (headless browser for JavaScript-rendered text) + Cheerio.

---

## 🚀 How to Run the Project

### Option A: Using Docker Compose (Recommended)
This option launches ChromaDB, the Backend, and Frontend containers simultaneously.

1. Ensure Docker is running.
2. In the project root, configure your environment keys in `./backend/.env` (see Environment Variables below).
3. Run:
   ```bash
   docker compose up --build
   ```
4. Access the application at: **`http://localhost:5173`**.

---

### Option B: Running Locally

#### 1. Start ChromaDB (Vector Store)
Run ChromaDB locally via Docker:
```bash
docker run -d -p 8000:8000 chromadb/chroma:latest
```

#### 2. Setup and Start Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure `.env` file (see below).
3. Install dependencies and browser binaries:
   ```bash
   npm install
   npx playwright install chromium
   ```
4. Start server in development mode:
   ```bash
   npm run dev
   ```
   *The server runs at `http://localhost:5000`.*

#### 3. Setup and Start Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
   *The client runs at `http://localhost:5173`.*

---

## 🔒 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
CHROMA_URL=http://localhost:8000
```

---

## 🕸️ Crawling Strategy

1. **JavaScript Support**: Leverages **Playwright** to execute headless sessions. This ensures modern JS-heavy frameworks (React, Angular, Next.js) render page content fully before extraction.
2. **Politeness & Compliance**:
   - Parses the target site's `robots.txt` using the standard `robots-parser` library.
   - Enforces a concurrency limit of `3` worker threads and adds a `250ms` delay between concurrent requests to ensure we do not flood target servers.
3. **Strict Domain Scoping**: Limits link extraction to the base domain (e.g. if starting at `docs.github.com`, it stays strictly inside `docs.github.com` and ignores redirects/links pointing to the wider internet or outer subdomains).
4. **Boilerplate & Noise Removal**:
   - Cheerio removes standard document noise: `<nav>`, `<footer>`, `<header>`, `<form>`, `<aside>`, `<script>`, `<style>`, `<svg>`.
   - Advanced selectors identify and strip cookies, GDPR consent dialogs, banner widgets, and privacy overlays (e.g., classes/IDs matching cookie/consent keywords) to prevent them from polluting the vector index.
5. **Visited Page Deduplication**: Strip trailing slashes and normalize URLs before checking the queue set to prevent identical pages (e.g., `https://example.com/` vs `https://example.com`) from being crawled multiple times.

---

## 🧠 Chunking & Retrieval

1. **Chunking**: Uses LangChain's `RecursiveCharacterTextSplitter` configured with a `chunkSize` of `1000` characters and `200` overlap characters. This boundary maintains structural semantic context while staying small enough for precision search.
2. **Embedding**: Generated via `gemini-embedding-001`. To respect Gemini API free tier limits (100 RPM), embeddings are created in batches of `50` chunks with a `3-second` timeout pause between batches.
3. **Vector Storage**: ChromaDB stores document content along with source titles and URLs.
4. **Retrieval**: User queries are embedded in real-time, and ChromaDB queries are executed to pull the top 5 most similar chunks.

---

## 🛡️ Grounding Control (No Hallucinations)

- **Zero-Temperature**: Prompting calls set the LLM temperature parameter to `0` to enforce determinism.
- **Strict Prompt Boundaries**: The assistant is explicitly instructed to answer queries **only** using context from the retrieved text chunks. If the details do not exist, it responds with the exact string:
  > *"I couldn't find that information on the crawled website."*
- **Empty State Fallback**: If the database is empty or queries yield zero chunks, the system automatically short-circuits to the fallback grounded message to prevent raw LLM speculation.
- **Citation Filtering**: Sources are dynamically stripped from response packets if the LLM emits the fallback text. Users will only see cited links if the AI actually succeeded in extracting a grounded answer.
