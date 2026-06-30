const express = require("express");
const cors = require("cors");

const crawlRoutes = require("./routes/crawlRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
    res.send("Website Chat RAG Backend Running...");
});

// Routes
app.use("/api/crawl", crawlRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;