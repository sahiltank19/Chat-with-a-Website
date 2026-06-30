const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-embedding-001",
});

async function embedDocuments(texts) {
    return await embeddings.embedDocuments(texts);
}

async function embedQuery(text) {
    return await embeddings.embedQuery(text);
}

module.exports = {
    embedDocuments,
    embedQuery,
};