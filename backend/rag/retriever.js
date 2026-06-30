const { embedQuery } = require("./embeddings");
const { searchDocuments } = require("./vectorStore");

async function retrieve(query) {
  console.log("Generating query embedding...");
  const embedding = await embedQuery(query);

  console.log("Searching ChromaDB...");
  const results = await searchDocuments(embedding);

  return results;
}

module.exports = retrieve;