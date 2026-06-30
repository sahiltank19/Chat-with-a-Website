function buildPrompt(question, documents) {
    const context = documents.join("\n\n------------------------\n\n");

    return `
You are an AI assistant.

Answer ONLY using the information provided in the context.

If the answer is not available in the context, reply:

"I couldn't find that information on the crawled website."

==========================
CONTEXT
==========================

${context}

==========================
QUESTION
==========================

${question}

==========================
ANSWER
==========================
`;
}

module.exports = buildPrompt;