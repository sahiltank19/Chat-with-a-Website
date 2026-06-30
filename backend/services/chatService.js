const retrieve = require("../rag/retriever");
const buildPrompt = require("../prompts/chatPrompt");
const chatModel = require("../config/gemini");

async function chat(question) {

    const results = await retrieve(question);

    const documents = results.documents[0];

    const prompt = buildPrompt(
        question,
        documents
    );

    const response = await chatModel.invoke(prompt);

    return {
        answer: response.content,
        sources: results.metadatas[0]
    };

}

module.exports = chat;