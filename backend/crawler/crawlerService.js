const CrawlQueue = require("./queue");
const crawlPage  = require("./pageCrawler");
const delay      = require("../utils/delay");

const MAX_PAGES     = 10;   // Maximum pages to crawl per run
const MAX_DEPTH     = 3;    // Maximum link-follow depth
const REQUEST_DELAY = 250;  // ms between concurrent page fetches (polite but fast)
const CONCURRENCY   = 3;    // Number of concurrent page crawl workers

async function crawlWebsite(startUrl) {

  let cleanStartUrl = startUrl.trim();
  if (!/^https?:\/\//i.test(cleanStartUrl)) {
    cleanStartUrl = "https://" + cleanStartUrl;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(cleanStartUrl);
  } catch {
    throw new Error(`Invalid URL: "${startUrl}"`);
  }

  // Normalize by stripping trailing slash
  let normalizedStartUrl = parsedUrl.toString();
  if (normalizedStartUrl.endsWith("/")) {
    normalizedStartUrl = normalizedStartUrl.slice(0, -1);
  }

  const baseDomain = parsedUrl.hostname;
  const queue      = new CrawlQueue();
  const visited    = new Set();
  const pages      = [];

  const statistics = {
    pages: 0,
    duplicatesSkipped: 0,
    robotsBlocked: 0,
    errors: 0,
    startTime: Date.now(),
  };

  // Mark as visited immediately when enqueued to prevent duplicate queuing
  queue.enqueue({ url: normalizedStartUrl, depth: 0 });
  visited.add(normalizedStartUrl);

  console.log(`[Crawler] Starting — domain: ${baseDomain}, limit: ${MAX_PAGES} pages, concurrency: ${CONCURRENCY}`);

  // We maintain a set of active crawl tasks
  const activeTasks = new Set();

  while ((!queue.isEmpty() || activeTasks.size > 0) && pages.length < MAX_PAGES) {

    // Spawn workers up to concurrency limit
    while (
      activeTasks.size < CONCURRENCY &&
      !queue.isEmpty() &&
      (pages.length + activeTasks.size) < MAX_PAGES
    ) {
      const current = queue.dequeue();

      if (current.depth > MAX_DEPTH) continue;

      const currentNum = pages.length + activeTasks.size + 1;
      console.log(`[Crawler] Spawning worker (${currentNum}/${MAX_PAGES}) depth=${current.depth} → ${current.url}`);

      // Define the async worker promise that returns result and error
      const promise = (async () => {
        try {
          const result = await crawlPage(current.url, baseDomain);
          return { result, error: null };
        } catch (err) {
          console.error(`[Crawler] Worker error for ${current.url}:`, err.message);
          return { result: null, error: err };
        }
      })();

      const taskObj = {
        current,
        promise,
      };

      activeTasks.add(taskObj);

      // Short delay between spawning concurrent requests to avoid overwhelming target server
      await delay(REQUEST_DELAY);
    }

    if (activeTasks.size === 0) break;

    // Map active tasks to raceable promises
    const raceable = Array.from(activeTasks).map(t =>
      t.promise.then(({ result, error }) => ({ taskObj: t, result, error }))
    );

    // Wait for the quickest worker to complete
    const { taskObj, result, error } = await Promise.race(raceable);
    activeTasks.delete(taskObj);

    if (error) {
      // Propagate errors from the main entry URL immediately so the client gets a specific warning
      if (taskObj.current.url === normalizedStartUrl) {
        throw error;
      }
      if (error.message === "ROBOTS_TXT_DISALLOWED") {
        statistics.robotsBlocked++;
      } else {
        statistics.errors++;
      }
      continue;
    }

    if (!result) {
      statistics.errors++;
      continue;
    }

    pages.push({
      url:     result.url,
      title:   result.title,
      content: result.content,
    });
    statistics.pages++;

    // Process extracted links
    for (const link of result.links) {
      if (!visited.has(link)) {
        visited.add(link); // Mark immediately when discovered to prevent duplicate queuing!
        queue.enqueue({ url: link, depth: taskObj.current.depth + 1 });
      }
    }
  }

  // Cancel / await remaining active tasks gracefully
  if (activeTasks.size > 0) {
    console.log(`[Crawler] Awaiting ${activeTasks.size} remaining workers to complete...`);
    await Promise.all(Array.from(activeTasks).map(t => t.promise));
  }

  statistics.time =
    ((Date.now() - statistics.startTime) / 1000).toFixed(2) + " sec";

  delete statistics.startTime;

  console.log(
    `[Crawler] Done — pages: ${statistics.pages}, errors: ${statistics.errors}, ` +
    `duplicates: ${statistics.duplicatesSkipped}, time: ${statistics.time}`
  );

  return { success: true, statistics, pages };
}

module.exports = crawlWebsite;
