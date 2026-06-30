const fs = require("fs/promises");
const path = require("path");

const VECTOR_DB_PATH = path.join(
  __dirname,
  "../storage/vectors.json"
);

async function loadVectors() {
  try {
    const data = await fs.readFile(VECTOR_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveVectors(vectors) {
  await fs.mkdir(path.dirname(VECTOR_DB_PATH), {
    recursive: true,
  });

  await fs.writeFile(
    VECTOR_DB_PATH,
    JSON.stringify(vectors, null, 2)
  );
}

module.exports = {
  loadVectors,
  saveVectors,
};