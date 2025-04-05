const faceapi = require("@vladmandic/face-api");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
const path = require("path");

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;

  const modelPath = path.join(__dirname, "..", "models", "face-api");
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);

  modelsLoaded = true;
  console.log("Face-api models loaded");
}

function l2Normalize(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector; // avoid division by zero
  return vector.map((val) => val / magnitude);
}

async function getFaceEmbeddingFromBuffer(buffer) {
  await loadModels();
  const img = await canvas.loadImage(buffer);

  const detection = await faceapi
    .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error("No face detected in the image");
  }

  const normalizedDescriptor = l2Normalize(Array.from(detection.descriptor));

  return normalizedDescriptor;
}

module.exports = {
  getFaceEmbeddingFromBuffer,
};
