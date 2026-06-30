import { useState } from "react";
import api from "../services/api";

/**
 * CrawlForm — URL input and submit button.
 * Props:
 *   onCrawlStart   {() => void}              Called right before the API request fires.
 *   onCrawlSuccess {(data: object) => void}  Called with the full Axios response body on success.
 *   onCrawlError   {(msg: string) => void}   Called with an error message on failure.
 *   disabled       {boolean}                 Disables form while parent is busy.
 */
function CrawlForm({ onCrawlStart, onCrawlSuccess, onCrawlError, disabled }) {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    onCrawlStart?.();

    try {
      const { data } = await api.post("/crawl", { url: trimmed });
      onCrawlSuccess?.(data);
    } catch (err) {
      const message =
        err.response?.data?.message || "Crawl failed. Please check the URL and try again.";
      onCrawlError?.(message);
    }
  };

  return (
    <form className="crawl-form" onSubmit={handleSubmit} noValidate>
      <input
        className="crawl-form__input"
        id="crawl-url"
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={disabled}
        required
        aria-label="Website URL"
      />
      <button
        className="btn-primary"
        type="submit"
        disabled={disabled || !url.trim()}
      >
        {disabled ? "Crawling…" : "Crawl Website"}
      </button>
    </form>
  );
}

export default CrawlForm;