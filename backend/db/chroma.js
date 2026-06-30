const crypto = require("crypto");
const { ChromaClient } = require("chromadb");

const client = new ChromaClient({
  path: process.env.CHROMA_URL,
});
const COLLECTION_NAME = "website_documents";

/**
 * ChromaDB v3 requires an embeddingFunction on every getCollection / createCollection call.
 * We supply embeddings directly in add() calls, so this stub is never invoked.
 */
const NOOP_EMBEDDING_FN = {
  generate: async (texts) => texts.map(() => []),
};

async function getCollection() {
  try {
    return await client.getCollection({
      name: COLLECTION_NAME,
      embeddingFunction: NOOP_EMBEDDING_FN,
    });
  } catch {
    return await client.createCollection({
      name: COLLECTION_NAME,
      embeddingFunction: NOOP_EMBEDDING_FN,
    });
  }
}


async function addDocuments(documents) {
  const collection = await getCollection();

  await collection.add({
    ids: documents.map((_, i) => crypto.randomUUID()),

    documents: documents.map(doc => doc.pageContent),

    embeddings: documents.map(doc => doc.embedding),

    metadatas: documents.map(doc => ({
      url: doc.metadata.url,
      title: doc.metadata.title,
    })),
  });

  return true;
}

module.exports = {
  getCollection,
  addDocuments,
};