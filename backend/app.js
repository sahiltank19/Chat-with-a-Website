const express = require("express");
const cors    = require("cors");

const crawlRoutes  = require("./routes/crawlRoutes");
const chatRoutes   = require("./routes/chatRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Website Chat RAG Backend Running." });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/crawl", crawlRoutes);
app.use("/api/chat",  chatRoutes);

// ── Centralised Error Handler (must be last) ──────────────────────────────────
app.use(errorHandler);

module.exports = app;