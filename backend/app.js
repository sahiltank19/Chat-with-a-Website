const express = require("express");
const cors = require("cors");

const crawlRoutes = require("./routes/crawlRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Website Chat RAG Backend Running...");
});

app.use("/api/crawl", crawlRoutes);

module.exports = app;