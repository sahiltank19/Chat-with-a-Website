const { ChromaClient } = require("chromadb");

const client = new ChromaClient({
  path: process.env.CHROMA_URL || "http://localhost:8000"
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
   GET OR CREATE COLLECTION
------------------------------*/
async function getCollection() {
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