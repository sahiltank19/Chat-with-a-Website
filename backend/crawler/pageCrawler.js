const { getBrowser } = require("../config/browser");
const extractContent = require("./extractor");
const extractLinks   = require("./linkExtractor");
const { isAllowed }  = require("./robots");

// Resource types that carry no text content — blocking them speeds up crawls
// and prevents gaming/CDN sites from triggering bot-detection rate limits.
const BLOCKED_RESOURCE_TYPES = new Set(["image", "media", "font", "stylesheet"]);

// Realistic Chrome User-Agent so sites don't serve empty pages to raw headless browsers.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/125.0.0.0 Safari/537.36";

/**
 * Checks for common Cloudflare / bot-detection templates.
 */
function detectSecurityBlock(title, content) {
  const t = (title || "").toLowerCase();
  const c = (content || "").toLowerCase();

  const blockTitles = [
    "access denied",
    "cloudflare",
    "security check",
    "attention required",
    "just a moment",
    "ddos-guard",
    "error 403",
    "bot protection"
  ];
  const blockPhrases = [
    "please verify you are a human",
    "checking your browser",
    "checking if the site connection is secure",
    "enable javascript",
    "enable cookies",
    "sucuri security",
    "ddos-guard",
    "blocked by cloudflare",
    "verify you are human",
    "action required: checking your browser"
  ];

  if (blockTitles.some(bt => t.includes(bt))) return true;
  if (blockPhrases.some(bp => c.includes(bp))) return true;

  return false;
}

async function crawlPage(url, baseDomain) {

  // ── Respect robots.txt ─────────────────────────────────────────────────
  const allowed = await isAllowed(url);
  if (!allowed) {
    console.log(`[Skip] robots.txt disallows: ${url}`);
    throw new Error("ROBOTS_TXT_DISALLOWED");
  }

  const browser = await getBrowser();

  // ── Use a browser CONTEXT for UA / viewport (correct Playwright API) ───
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport:  { width: 1280, height: 800 },
    extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
  });

  const page = await context.newPage();

  try {

    // ── Block non-content resources ───────────────────────────────────────
    await page.route("**/*", (route) => {
      if (BLOCKED_RESOURCE_TYPES.has(route.request().resourceType())) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // ── Load page ─────────────────────────────────────────────────────────
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
    } catch (err) {
      console.warn(`[Warn] domcontentloaded timeout for ${url}, retrying with load: ${err.message}`);
      await page.goto(url, { waitUntil: "load", timeout: 5000 });
    }

    // Allow JS-rendered text content a brief moment to settle
    await page.waitForTimeout(800);

    const html = await page.content();

    const { title, content } = extractContent(html);
    const links = extractLinks(html, url, baseDomain);

    // ── Detect anti-bot block page ─────────────────────────────────────────
    if (detectSecurityBlock(title, content)) {
      console.log(`[Security Block] Access blocked by Cloudflare/Anti-bot on: ${url}`);
      throw new Error("SECURITY_BLOCK");
    }

    // Skip pages with no meaningful text
    if (!content || content.trim().length < 50) {
      console.log(`[Skip] No meaningful content at: ${url}`);
      return null;
    }

    console.log(`[OK] Crawled: ${url} (${content.length} chars, ${links.length} links)`);

    return { url, title, content, links };

  } catch (error) {
    // Propagate custom errors directly, wrap others
    if (error.message === "SECURITY_BLOCK" || error.message === "ROBOTS_TXT_DISALLOWED") {
      throw error;
    }
    throw new Error(`CRAWL_FAILED: ${error.message}`);

  } finally {
    await page.close();
    await context.close();
  }
}


module.exports = crawlPage;
