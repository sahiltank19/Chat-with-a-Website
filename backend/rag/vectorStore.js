const { ChromaClient } = require("chromadb");

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
console.log(`[ChromaDB] Using CHROMA_URL: ${CHROMA_URL}`);

const client = new ChromaClient({
  path: CHROMA_URL
});

const COLLECTION_NAME = "website_documents";

/**
 * ChromaDB v3 requires an embeddingFunction on every getCollection / createCollection call.
 * We provide our own precomputed Gemini embeddings directly in add() and query(),
 * so this stub is registered but never actually invoked.
 */
const NOOP_EMBEDDING_FN = {
  generate: async (texts) => texts.map(() => []),
};

/* -----------------------------
   WAIT FOR CHROMA TO WAKE UP
   Uses a raw HTTP fetch to ping the server, which works with ANY server version.
   Waits up to 2.5 minutes (30 retries × 5s) to handle Render free-tier cold starts.
------------------------------*/
async function waitForChroma(retries = 30, delayMs = 5000) {
  // Try both v1 and v2 heartbeat endpoints (covers all server versions)
  const endpoints = [
    `${CHROMA_URL}/api/v1/heartbeat`,
    `${CHROMA_URL}/api/v2/heartbeat`,
  ];

  for (let i = 1; i <= retries; i++) {
    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout per attempt
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok || res.status === 404 || res.status === 410) {
          // Any HTTP response (including 404/410) means the server IS alive
          console.log(`[ChromaDB] Server is alive (attempt ${i}, status: ${res.status}, url: ${url})`);
          return;
        }
        console.log(`[ChromaDB] Unexpected status ${res.status} from ${url}`);
      } catch (err) {
        console.log(`[ChromaDB] Fetch failed for ${url}: ${err.message}`);
      }
    }
    console.log(`[ChromaDB] Not ready yet (attempt ${i}/${retries}), retrying in ${delayMs / 1000}s...`);
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`ChromaDB at ${CHROMA_URL} did not become ready in time.`);
}


/* -----------------------------
   GET OR CREATE COLLECTION
------------------------------*/
async function getCollection() {
  await waitForChroma();
  try {
    return await client.getCollection({
      name: COLLECTION_NAME,
      embeddingFunction: NOOP_EMBEDDING_FN,
    });
  } catch (err) {
    return await client.createCollection({
      name: COLLECTION_NAME,
      embeddingFunction: NOOP_EMBEDDING_FN,
    });
  }
}

/* -----------------------------
   CLEAR COLLECTION (NEW ⭐)
------------------------------*/
async function clearCollection() {
  try {
    const collection = await getCollection();

    const all = await collection.get();

    if (all.ids && all.ids.length > 0) {
      await collection.delete({
        ids: all.ids,
      });
    }

    console.log("🧹 Chroma collection cleared");
  } catch (err) {
    console.error("Error clearing collection:", err.message);
  }
}

/* -----------------------------
   INSERT DOCUMENTS
------------------------------*/
async function insertDocuments(documents) {

  // Guard: ChromaDB v3 hard-rejects empty embedding arrays.
  // indexer.js already filters these, but we add a second check here.
  const valid = documents.filter(
    doc => Array.isArray(doc.embedding) && doc.embedding.length > 0
  );

  if (valid.length === 0) {
    throw new Error("insertDocuments received no documents with valid embeddings.");
  }

  const collection = await getCollection();

  await collection.add({
    ids: valid.map(
      (doc, index) => doc.id || `doc-${Date.now()}-${index}-${Math.random()}`
    ),
    documents: valid.map(doc => doc.pageContent || ""),
    embeddings: valid.map(doc => doc.embedding),       // guaranteed non-empty
    metadatas:  valid.map(doc => ({
      url:   doc.metadata?.url   || "",
      title: doc.metadata?.title || "",
    })),
  });
}


/* -----------------------------
   SEARCH
------------------------------*/
async function searchDocuments(queryEmbedding, limit = 5) {
  const collection = await getCollection();

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit,
  });

  return results;
}

/* -----------------------------
   EXPORTS
------------------------------*/
module.exports = {
  insertDocuments,
  searchDocuments,
  getCollection,
  clearCollection, // ⭐ IMPORTANT
};