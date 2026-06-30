import { useState } from "react";
import CrawlForm from "../components/CrawlForm";
import ChatBox   from "../components/ChatBox";
import Loader    from "../components/Loader";

/**
 * Home — two-stage layout:
 *   Stage 1: URL input (before crawl)
 *   Stage 2: Stats card + ChatBox (after successful crawl)
 *
 * Manages crawl lifecycle state so child components stay focused.
 */
function Home() {
  const [crawlResult, setCrawlResult] = useState(null); // API response .data
  const [isCrawling,  setIsCrawling]  = useState(false);
  const [crawlError,  setCrawlError]  = useState(null);

  /* ── Crawl handlers ──────────────────────────────────────────────── */
  const handleCrawlStart = () => {
    setIsCrawling(true);
    setCrawlError(null);
    setCrawlResult(null);
  };

  const handleCrawlSuccess = (responseData) => {
    setIsCrawling(false);
    // responseData = { success, message, data: { statistics, pages, chunksIndexed } }
    setCrawlResult(responseData.data);
  };

  const handleCrawlError = (message) => {
    setIsCrawling(false);
    setCrawlError(message);
  };

  const handleReset = () => {
    setCrawlResult(null);
    setCrawlError(null);
  };

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="home">

      {/* ── Header ───────────────────────────────────────── */}
      <header className="home__header">
        <div className="home__logo-container">
          <img src="/logo.png" alt="Logo" className="home__logo" />
        </div>
        <h1 className="home__title">Chat with a Website</h1>
        <p className="home__subtitle">
          Crawl any website and have an AI answer your questions — grounded in real content.
        </p>
      </header>

      {/* ── Stage 1 : Crawl ──────────────────────────────── */}
      {!crawlResult && (
        <section className="home__stage home__crawl-stage">

          <CrawlForm
            onCrawlStart={handleCrawlStart}
            onCrawlSuccess={handleCrawlSuccess}
            onCrawlError={handleCrawlError}
            disabled={isCrawling}
          />

          {/* Loading state */}
          {isCrawling && (
            <Loader message="Crawling and indexing website… this may take a minute." />
          )}

          {/* Error state */}
          {crawlError && (
            <div className="error-card" role="alert">
              <strong>Crawl failed:</strong> {crawlError}
            </div>
          )}

          {/* Empty state (default) */}
          {!isCrawling && !crawlError && (
            <p className="home__hint">
              Enter any publicly accessible website URL to begin.
            </p>
          )}

        </section>
      )}

      {/* ── Stage 2 : Chat ───────────────────────────────── */}
      {crawlResult && (
        <section className="home__stage home__chat-stage">

          {/* Stats card */}
          <div className="stats-card">
            <h3 className="stats-card__title">✅ Website Indexed Successfully</h3>

            <div className="stats-card__grid">
              <div className="stat">
                <span className="stat__value">{crawlResult.statistics?.pages ?? 0}</span>
                <span className="stat__label">Pages Crawled</span>
              </div>
              <div className="stat">
                <span className="stat__value">{crawlResult.chunksIndexed ?? 0}</span>
                <span className="stat__label">Chunks Indexed</span>
              </div>
              <div className="stat">
                <span className="stat__value">{crawlResult.statistics?.time ?? "—"}</span>
                <span className="stat__label">Crawl Time</span>
              </div>
            </div>

            <button className="btn-ghost" onClick={handleReset}>
              ↩ Crawl a different website
            </button>
          </div>

          {/* Chat interface */}
          <ChatBox />

        </section>
      )}

    </div>
  );
}

export default Home;