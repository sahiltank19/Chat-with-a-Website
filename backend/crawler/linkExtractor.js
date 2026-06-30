const cheerio = require("cheerio");

const INVALID_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".svg",
    ".webp",
    ".pdf",
    ".zip",
    ".rar",
    ".mp4",
    ".mp3",
    ".avi",
    ".mov",
    ".css",
    ".js",
    ".xml",
    ".json"
];

function isValidLink(url) {
    return !INVALID_EXTENSIONS.some(ext =>
        url.toLowerCase().endsWith(ext)
    );
}

function extractLinks(html, currentUrl, baseDomain) {
    const $ = cheerio.load(html);

    const links = new Set();

    $("a[href]").each((_, element) => {

        let href = $(element).attr("href");

        if (!href) return;

        href = href.trim();

        // Ignore anchors
        if (href.startsWith("#")) return;

        // Ignore email links
        if (href.startsWith("mailto:")) return;

        // Ignore telephone links
        if (href.startsWith("tel:")) return;

        // Ignore javascript links
        if (href.startsWith("javascript:")) return;

        try {

            const absoluteUrl = new URL(href, currentUrl);

            // Stay inside same domain
            if (absoluteUrl.hostname !== baseDomain)
                return;

            // Ignore unwanted file types
            if (!isValidLink(absoluteUrl.pathname))
                return;

            // Remove URL fragment (#section)
            absoluteUrl.hash = "";

            // Remove trailing slash
            let cleanUrl = absoluteUrl.toString();

            if (cleanUrl.endsWith("/")) {
                cleanUrl = cleanUrl.slice(0, -1);
            }

            links.add(cleanUrl);

        } catch (err) {
            // Ignore invalid URLs
        }

    });

    return [...links];
}

module.exports = extractLinks;