const splitDocuments     = require("./chunker");
const { embedDocuments } = require("./embeddings");
const { insertDocuments } = require("./vectorStore");

// Gemini free tier: 100 embed requests per minute.
// Batching + delay spreads calls to leave quota for chat queries.
const EMBED_BATCH_SIZE    = 50;
const INTER_BATCH_DELAY_MS = 3000; // 3 s pause between batches

async function indexWebsite(pages) {

  // ── 1. Chunk ───────────────────────────────────────────────────
  console.log("[Indexer] Chunking documents...");
  const docs = await splitDocuments(pages);
  console.log(`[Indexer] Created ${docs.length} chunks from ${pages.length} pages`);

  // ── 2. Embed in batches ────────────────────────────────────────
  console.log(`[Indexer] Generating embeddings in batches of ${EMBED_BATCH_SIZE}...`);

  for (let i = 0; i < docs.length; i += EMBED_BATCH_SIZE) {
    const batch        = docs.slice(i, i + EMBED_BATCH_SIZE);
    const batchNum     = Math.floor(i / EMBED_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(docs.length / EMBED_BATCH_SIZE);

    console.log(`[Indexer] Embedding batch ${batchNum}/${totalBatches} (${batch.length} chunks)...`);

    const vectors = await embedDocuments(batch.map(doc => doc.pageContent));

    batch.forEach((doc, idx) => {
      doc.embedding = vectors[idx];
    });

    // Pause between batches to stay within Gemini free-tier quota (100 req/min)
    const isLastBatch = i + EMBED_BATCH_SIZE >= docs.length;
    if (!isLastBatch) {
      console.log(`[Indexer] Pausing ${INTER_BATCH_DELAY_MS / 1000}s between batches...`);
      await new Promise(res => setTimeout(res, INTER_BATCH_DELAY_MS));
    }
  }


  // ── 3. Filter out any chunks where embedding failed ────────────
  const validDocs = docs.filter(
    doc => Array.isArray(doc.embedding) && doc.embedding.length > 0
  );

  const skipped = docs.length - validDocs.length;
  if (skipped > 0) {
    console.warn(`[Indexer] Skipped ${skipped} chunk(s) with missing embeddings.`);
  }

  if (validDocs.length === 0) {
    throw new Error("All embeddings failed — nothing to store. Check your GEMINI_API_KEY.");
  }

  // ── 4. Store ───────────────────────────────────────────────────
  console.log(`[Indexer] Saving ${validDocs.length} chunks into ChromaDB...`);
  await insertDocuments(validDocs);

  console.log(`[Indexer] Done. ${validDocs.length} chunks indexed.`);

  return validDocs.length;
}

module.exports = indexWebsite;
