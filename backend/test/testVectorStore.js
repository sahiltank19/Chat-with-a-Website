const {
  saveVectors,
  loadVectors,
} = require("../rag/vectorStore");

async function run() {

  const sample = [
    {
      text: "Node.js is a runtime.",
      embedding: [1, 2, 3],
      metadata: {
        url: "https://example.com",
      },
    },
  ];

  await saveVectors(sample);

  const vectors = await loadVectors();

  console.log(vectors);

}

run();