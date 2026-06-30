const axios = require("axios");
const robotsParser = require("robots-parser");

let robotsCache = new Map();

/**
 * Loads and caches robots.txt for a domain.
 */
async function loadRobots(baseUrl) {
    const origin = new URL(baseUrl).origin;

    if (robotsCache.has(origin)) {
        return robotsCache.get(origin);
    }

    try {
        const robotsUrl = `${origin}/robots.txt`;

        const response = await axios.get(robotsUrl, {
            timeout: 5000,
            validateStatus: () => true,
        });

        const robots = robotsParser(
            robotsUrl,
            response.status === 200 ? response.data : ""
        );

        robotsCache.set(origin, robots);

        return robots;
    } catch (error) {
        // If robots.txt can't be fetched, allow crawling.
        const robots = robotsParser(`${origin}/robots.txt`, "");
        robotsCache.set(origin, robots);
        return robots;
    }
}

/**
 * Checks if a URL is allowed for our crawler.
 */
async function isAllowed(url, userAgent = "*") {
    const robots = await loadRobots(url);

    return robots.isAllowed(url, userAgent);
}

module.exports = {
    isAllowed,
};