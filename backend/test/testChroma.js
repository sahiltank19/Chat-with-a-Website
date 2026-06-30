const { getCollection } = require("../rag/vectorStore");

async function run() {
    try {
        const collection = await getCollection();
        console.log(`=== ChromaDB Collection: "${collection.name}" ===`);

        // Fetch all items from the collection
        const data = await collection.get();

        const count = data.ids ? data.ids.length : 0;
        console.log(`Total Indexed Chunks: ${count}\n`);

        if (count === 0) {
            console.log("The database is currently empty. Please crawl a site first!");
            return;
        }

        // Print details of each stored document chunk
        data.ids.forEach((id, index) => {
            const document = data.documents[index];
            const metadata = data.metadatas[index];
            console.log(`--- [Chunk ${index + 1}] ID: ${id} ---`);
            console.log(`Source URL  : ${metadata.url}`);
            console.log(`Source Title: ${metadata.title}`);
            console.log(`Text Content: ${document.substring(0, 150)}...\n`);
        });

    } catch (err) {
        console.error("Error reading from ChromaDB:", err.message);
    }
}

run();