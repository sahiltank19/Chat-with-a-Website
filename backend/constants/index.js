/**
 * Shared application-wide constants.
 * Import from here instead of hard-coding values inline.
 */

/* ─── Crawler ─────────────────────────────────────────── */
const MAX_PAGES      = 30;    // Maximum pages to crawl per run
const MAX_DEPTH      = 3;     // Maximum link-follow depth
const REQUEST_DELAY  = 500;   // ms between page fetches (be polite)
const PAGE_TIMEOUT   = 30000; // ms before abandoning a single page

/* ─── RAG / Chunking ─────────────────────────────────── */
const CHUNK_SIZE     = 1000;  // characters per chunk
const CHUNK_OVERLAP  = 200;   // overlap between consecutive chunks
const RETRIEVAL_LIMIT = 5;    // number of chunks to retrieve per query

/* ─── Vector Store ───────────────────────────────────── */
const COLLECTION_NAME = "website_documents";

/* ─── AI Models ──────────────────────────────────────── */
const CHAT_MODEL      = "gemini-2.5-flash";
const EMBEDDING_MODEL = "gemini-embedding-001";

module.exports = {
  MAX_PAGES,
  MAX_DEPTH,
  REQUEST_DELAY,
  PAGE_TIMEOUT,
  CHUNK_SIZE,
  CHUNK_OVERLAP,
  RETRIEVAL_LIMIT,
  COLLECTION_NAME,
  CHAT_MODEL,
  EMBEDDING_MODEL,
};
