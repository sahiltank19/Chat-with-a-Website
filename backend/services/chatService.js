const retrieve = require("../rag/retriever");
const buildPrompt = require("../prompts/chatPrompt");
const chatModel = require("../config/gemini");

async function chat(question) {

    const results = await retrieve(question);

    const fallbackText = "I couldn't find that information on the crawled website.";

    // Guard: Handle empty database/context safely without crashing
    if (!results || !results.documents || !results.documents[0] || results.documents[0].length === 0) {
        return {
            answer: fallbackText,
            sources: []
        };
    }

    const documents = results.documents[0];

    const prompt = buildPrompt(
        question,
        documents
    );

    const response = await chatModel.invoke(prompt);
    const answer = response.content || "";

    // Clear sources if the answer is the fallback text (grounding)
    const hasAnswer = !answer.includes(fallbackText);

    return {
        answer,
        sources: hasAnswer ? (results.metadatas[0] || []) : []
    };

}

module.exports = chat;