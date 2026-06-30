const chat = require("../services/chatService");

async function chatController(req, res) {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Question is required",
            });
        }

        const result = await chat(question);

        res.json({
            success: true,
            answer: result.answer,
            sources: result.sources,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports = {
    chatController,
};