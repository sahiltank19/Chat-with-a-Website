const {
  insertDocuments,
  getCollection,
  clearCollection,
  searchDocuments,
} = require("../rag/vectorStore");

async function run() {
  console.log("Clearing collection...");
  await clearCollection();

  const sample = [
    {
      id: "doc-test-1",
      pageContent: "Node.js is a JavaScript runtime built on Chrome's V8 engine.",
      embedding: Array(3072).fill(0.1),
      metadata: {
        url: "https://example.com/node-intro",
        title: "Introduction to Node.js",
      },
    },
  ];

  console.log("Inserting document...");
  await insertDocuments(sample);

  console.log("Searching documents...");
  const results = await searchDocuments(Array(3072).fill(0.1), 1);
  console.log("Query Results:", JSON.stringify(results, null, 2));
}

run().catch(console.error);