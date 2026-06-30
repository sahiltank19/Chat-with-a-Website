const splitDocuments = require("../rag/chunker");

async function test() {
    const pages = [
        {
            url: "https://example.com",
            title: "Example",
            content: `
            Node.js is a JavaScript runtime.

            It is built on Chrome's V8 engine.

            Node.js allows developers to build scalable applications.

            Express.js is a framework built on Node.js.

            React is a frontend library.

            MongoDB is a NoSQL database.

            `.repeat(300)
        }
    ];

    const docs = await splitDocuments(pages);

    console.log("Total Chunks:", docs.length);

    docs.forEach((doc, index) => {
        console.log(`Chunk ${index + 1}: ${doc.pageContent.length} characters`);
    });
}

test();