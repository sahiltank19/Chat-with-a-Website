const express = require("express");
const crawlWebsite = require("../crawler/crawlerService");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: "Website URL is required",
            });
        }

        const result = await crawlWebsite(url);

        return res.json(result);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Crawler failed",
            error: error.message,
        });

    }
});

module.exports = router;