require("dotenv").config();

const retrieve = require("../rag/retriever");

async function run() {

  const results = await retrieve(
    "What is Node.js?"
  );

  console.dir(results, {
    depth: null,
  });

}

run();