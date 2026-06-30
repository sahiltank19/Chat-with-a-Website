const crypto = require("crypto");
const { ChromaClient } = require("chromadb");

const client = new ChromaClient();

const COLLECTION_NAME = "website_documents";

async function getCollection() {
    try {
        return await client.getCollection({
            name: COLLECTION_NAME,
        });
    } catch {
        return await client.createCollection({
            name: COLLECTION_NAME,
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