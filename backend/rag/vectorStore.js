const { ChromaClient } = require("chromadb");

const client = new ChromaClient();

const COLLECTION_NAME = "website_documents";

/* -----------------------------
   GET OR CREATE COLLECTION
------------------------------*/
async function getCollection() {
  try {
    return await client.getCollection({
      name: COLLECTION_NAME,
    });
  } catch (err) {
    return await client.createCollection({
      name: COLLECTION_NAME,
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
  const collection = await getCollection();

  await collection.add({
    ids: documents.map(
      (doc, index) => doc.id || `doc-${Date.now()}-${index}-${Math.random()}`
    ),

    documents: documents.map(doc => doc.pageContent || ""),

    // ⚠️ only include embeddings if they exist
    embeddings: documents.map(doc => doc.embedding || []),

    metadatas: documents.map(doc => ({
      url: doc.metadata?.url || "",
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