const chat = require("../services/chatService");

async function chatController(req, res, next) {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const result = await chat(question.trim());

    return res.json({
      success: true,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  chatController,
};