const splitDocuments = require("./chunker");
const { embedDocuments } = require("./embeddings");
const { insertDocuments } = require("./vectorStore");

async function indexWebsite(pages) {

  console.log("Chunking documents...");

  const docs = await splitDocuments(pages);

  console.log(`Created ${docs.length} chunks`);

  console.log("Generating embeddings...");

  const vectors = await embedDocuments(
    docs.map(doc => doc.pageContent)
  );

  docs.forEach((doc, index) => {
    doc.embedding = vectors[index];
  });

  console.log("Saving into ChromaDB...");

  await insertDocuments(docs);

  console.log("Indexing completed.");

  return docs.length;
}

module.exports = indexWebsite;