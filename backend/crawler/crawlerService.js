const CrawlQueue = require("./queue");
const crawlPage = require("./pageCrawler");
const delay = require("../utils/delay");

const MAX_PAGES = 30;
const MAX_DEPTH = 3;
const REQUEST_DELAY = 500;

async function crawlWebsite(startUrl) {
    const baseDomain = new URL(startUrl).hostname;

    const queue = new CrawlQueue();
    const visited = new Set();

    const pages = [];

    const statistics = {
        pages: 0,
        duplicatesSkipped: 0,
        errors: 0,
        startTime: Date.now(),
    };

    queue.enqueue({
        url: startUrl,
        depth: 0,
    });
    while (!queue.isEmpty() && pages.length < MAX_PAGES) {

        const current = queue.dequeue();

        if (visited.has(current.url)) {
            statistics.duplicatesSkipped++;
            continue;
        }

        visited.add(current.url);

        if (current.depth > MAX_DEPTH)
            continue;

        const result = await crawlPage(
            current.url,
            baseDomain
        );

        if (!result) {
            statistics.errors++;
            continue;
        }

        pages.push({
            url: result.url,
            title: result.title,
            content: result.content,
        });

        statistics.pages++;
        for (const link of result.links) {

            if (!visited.has(link)) {

                queue.enqueue({
                    url: link,
                    depth: current.depth + 1,
                });

            }

        }

        await delay(REQUEST_DELAY);

    }
    statistics.time =
        ((Date.now() - statistics.startTime) / 1000).toFixed(2) + " sec";

    delete statistics.startTime;

    return {
        success: true,
        statistics,
        pages,
    };
}

module.exports = crawlWebsite;