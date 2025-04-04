const faceapi = require("@vladmandic/face-api");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
const path = require("path");

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;

  const modelPath = path.join(__dirname, "..", "models", "face-api");
  await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);

  modelsLoaded = true;
  console.log("Face-api models loaded");
}

async function getFaceEmbeddingFromBuffer(buffer) {
  await loadModels();
  const img = await canvas.loadImage(buffer);
  const detection = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error("No face detected in the image");
  }

  return Array.from(detection.descriptor);
}

module.exports = {
  getFaceEmbeddingFromBuffer,
};
