const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});

async function splitDocuments(pages) {

    const documents = [];

    for (const page of pages) {

        const chunks = await splitter.createDocuments(
            [page.content],
            [
                {
                    url: page.url,
                    title: page.title,
                },
            ]
        );

        documents.push(...chunks);

    }

    return documents;
}

module.exports = splitDocuments;