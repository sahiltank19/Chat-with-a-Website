import { useState } from "react";
import api from "../services/api";

function CrawlForm({ onCrawlSuccess }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCrawl = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      alert("Please enter a website URL.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/crawl", {
        url,
      });

      onCrawlSuccess(data);
    } catch (error) {
      alert(error.response?.data?.message || "Crawl failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCrawl}>

      <input
        type="text"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Crawling..." : "Crawl Website"}
      </button>

    </form>
  );
}

export default CrawlForm;