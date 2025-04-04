const User = require("../models/User");
const { getFaceEmbeddingFromBuffer } = require("./face.embedder");

async function generateAndSaveEmbedding(name, buffer) {
  const embedding = await getFaceEmbeddingFromBuffer(buffer);
  const user = await User.create({ name, faceEmbedding: embedding });
  return user;
}

async function generateEmbeddingFromImage(buffer) {
  const embedding = await getFaceEmbeddingFromBuffer(buffer);
  return embedding;
}

function normalizeEmbedding(embed) {
  const norm = Math.sqrt(embed.reduce((sum, val) => sum + val * val, 0));
  return embed.map((val) => val / norm);
}

function compareEmbeddings(embed1, embed2, threshold = 0.95) {
  if (!embed1 || !embed2 || embed1.length !== 128 || embed2.length !== 128) {
    throw new Error("Embeddings must both be 128-dimensional");
  }

  const norm1 = normalizeEmbedding(embed1);
  const norm2 = normalizeEmbedding(embed2);

  const dot = norm1.reduce((sum, a, i) => sum + a * norm2[i], 0);
  const similarity = dot;

  console.log("Cosine similarity:", similarity);

  return {
    isMatch: similarity >= threshold,
    similarity: parseFloat((similarity * 100).toFixed(2)),
  };
}

module.exports = {
  generateAndSaveEmbedding,
  generateEmbeddingFromImage,
  compareEmbeddings,
};
