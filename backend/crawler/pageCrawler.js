const { getBrowser } = require("../config/browser");
const extractContent = require("./extractor");
const extractLinks = require("./linkExtractor");
const { isAllowed } = require("./robots");

async function crawlPage(url, baseDomain) {

    // Check robots.txt
    const allowed = await isAllowed(url);

    if (!allowed) {
        return null;
    }

    const browser = await getBrowser();

    const page = await browser.newPage();

    try {

        await page.goto(url, {
            waitUntil: "networkidle",
            timeout: 30000,
        });

        const html = await page.content();

        const { title, content } = extractContent(html);

        const links = extractLinks(
            html,
            url,
            baseDomain
        );

        return {
            url,
            title,
            content,
            links,
        };

    } catch (error) {

        console.error("Error crawling:", url);

        return null;

    } finally {

        await page.close();

    }

}

module.exports = crawlPage;