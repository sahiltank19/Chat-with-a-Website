const { getCollection } = require("../db/chroma");
async function run() {

    const collection = await getCollection();

    console.log("Collection Name:");
    console.log(collection.name);

}

run();