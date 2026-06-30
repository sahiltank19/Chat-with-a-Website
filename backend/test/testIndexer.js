require("dotenv").config();

console.log(process.env.GEMINI_API_KEY ? "API Loaded ✅" : "API Missing ❌");

const indexWebsite = require("../rag/indexer");

async function run() {

    const pages = [
        {
            url: "https://example.com",
            title: "Example",
            content: `
Node.js is a JavaScript runtime.

Express is a backend framework.

React is a frontend library.

MongoDB stores documents.
      `,
        },
    ];

    const count = await indexWebsite(pages);

    console.log("Indexed:", count);

}

run();