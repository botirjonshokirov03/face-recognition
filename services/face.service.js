const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

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

function compareEmbeddings(embed1, embed2, threshold = 0.7) {
  if (!embed1 || !embed2 || embed1.length !== 128 || embed2.length !== 128) {
    throw new Error("Embeddings must be 128-dimensional");
  }

  let sumSquared = 0;
  for (let i = 0; i < embed1.length; i++) {
    sumSquared += Math.pow(embed1[i] - embed2[i], 2);
  }
  const euclideanDistance = Math.sqrt(sumSquared);

  const similarityPercentage = Math.max(0, 100 - euclideanDistance * 100);

  console.log(`Similarity: ${similarityPercentage.toFixed(2)}%`);

  return {
    isMatch: similarityPercentage >= threshold * 100,
    similarity: parseFloat(similarityPercentage.toFixed(2)),
    euclideanDistance: parseFloat(euclideanDistance.toFixed(4)),
  };
}

async function checkLivenessFromPythonAPI(buffer) {
  const form = new FormData();
  form.append("image", buffer, {
    filename: "face.jpg",
    contentType: "image/jpeg",
  });

  const url =
    process.env.PYTHON_LIVENESS_API || "http://localhost:5000/liveness";

  const res = await axios.post(url, form, {
    headers: form.getHeaders(),
    timeout: 5000,
  });

  return res.data;
}

module.exports = {
  generateAndSaveEmbedding,
  generateEmbeddingFromImage,
  compareEmbeddings,
  checkLivenessFromPythonAPI,
};
