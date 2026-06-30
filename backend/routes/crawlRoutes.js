const express = require("express");
const crawlWebsite  = require("../crawler/crawlerService");
const indexWebsite  = require("../rag/indexer");
const { clearCollection } = require("../rag/vectorStore");

const router = express.Router();

/**
 * POST /api/crawl
 * Body: { url: string }
 *
 * Pipeline:
 *  1. Validate URL
 *  2. Crawl website (respects robots.txt, rate-limit, depth/page caps)
 *  3. Clear previous ChromaDB collection
 *  4. Chunk → Embed → Store pages into ChromaDB (via indexer)
 *  5. Return statistics + chunk count to the client
 */
router.post("/", async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid website URL is required.",
      });
    }

    // ── Step 1: Crawl ────────────────────────────────────────────────────
    console.log(`[Crawl] Starting crawl for: ${url}`);
    const crawlResult = await crawlWebsite(url.trim());

    if (!crawlResult.pages || crawlResult.pages.length === 0) {
      return res.status(422).json({
        success: false,
        message: "No pages could be crawled from the given URL. The site may block crawlers or be unreachable.",
      });
    }

    // ── Step 2: Clear old data ───────────────────────────────────────────
    console.log("[Index] Clearing previous collection...");
    await clearCollection();

    // ── Step 3: Index (chunk → embed → store) ───────────────────────────
    console.log(`[Index] Indexing ${crawlResult.pages.length} page(s)...`);
    const chunksIndexed = await indexWebsite(crawlResult.pages);

    console.log(`[Index] Done. ${chunksIndexed} chunks stored in ChromaDB.`);

    return res.status(200).json({
      success: true,
      message: "Website crawled and indexed successfully.",
      data: {
        statistics:    crawlResult.statistics,
        pages:         crawlResult.pages,
        chunksIndexed,
      },
    });

  } catch (error) {
    if (error.message === "ROBOTS_TXT_DISALLOWED") {
      return res.status(403).json({
        success: false,
        message: "This website cannot be crawled because its robots.txt file disallows crawlers. Please try a different URL.",
      });
    }
    if (error.message === "SECURITY_BLOCK") {
      return res.status(403).json({
        success: false,
        message: "This website cannot be crawled due to security restrictions (Cloudflare protection, CAPTCHA, or bot-detection). Please try a different website.",
      });
    }
    if (error.message.startsWith("CRAWL_FAILED")) {
      return res.status(422).json({
        success: false,
        message: `Unable to access this URL: ${error.message.replace("CRAWL_FAILED: ", "")}`,
      });
    }

    // Forward other errors to centralised error handler
    next(error);
  }
});

module.exports = router;