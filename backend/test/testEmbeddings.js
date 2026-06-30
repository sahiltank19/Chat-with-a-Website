require("dotenv").config();

const embeddings = require("../rag/embeddings");

async function test() {

    const vector = await embeddings.embedQuery(
        "What is Node.js?"
    );

    console.log("Vector Length:", vector.length);

    console.log(vector.slice(0, 10));

}

test();