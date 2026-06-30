const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const chatModel = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash",
    temperature: 0,
});

module.exports = chatModel;