const cheerio = require("cheerio");

function extractContent(html) {

    const $ = cheerio.load(html);

    // Remove unwanted elements
    $(
        "script, style, noscript, iframe, svg, canvas, footer, nav, header, aside, form, " +
        ".cookie-banner, .cookie-consent, #cookie-banner, #cookie-consent, " +
        ".gdpr-banner, .gdpr-consent, #gdpr-consent, [class*='cookie-'], [id*='cookie-']"
    ).remove();

    const title = $("title").first().text().trim();

    let text = $("body").text();

    text = text
        .replace(/\s+/g, " ")
        .replace(/\n+/g, " ")
        .trim();

    return {
        title,
        content: text,
    };
}

module.exports = extractContent;