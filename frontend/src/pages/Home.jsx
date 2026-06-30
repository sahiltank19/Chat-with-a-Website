import { useState, useEffect } from "react";
import CrawlForm from "../components/CrawlForm";

function Home() {
  const [crawlResult, setCrawlResult] = useState(null);

  useEffect(() => {
    console.log("Crawl Result:", crawlResult);
  }, [crawlResult]);

  return (
    <div>
      <h1>Chat with a Website</h1>

      <CrawlForm onCrawlSuccess={setCrawlResult} />

      {crawlResult?.data && (
        <div>
          <h3>Crawl Completed ✅</h3>

          <p>
            Pages Crawled:{" "}
            {crawlResult.data.pages?.length ?? 0}
          </p>

          <p>
            Time:{" "}
            {crawlResult.data.statistics?.time ?? "0s"}
          </p>
        </div>
      )}
    </div>
  );
}

export default Home;