// const cv = require("@u4/opencv4nodejs");
// const { getFaceEmbeddingFromBuffer } = require("./face.embedder");

// // 1. Detect face and extract ROI (Region of Interest)
// async function extractFaceROI(buffer) {
//   const img = await cv.imdecode(buffer);
//   const gray = img.cvtColor(cv.COLOR_BGR2GRAY);

//   // Load Haar Cascade for face detection
//   const faceClassifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
//   const faces = faceClassifier.detectMultiScale(gray).objects;

//   if (faces.length === 0) throw new Error("No face detected");

//   const face = faces[0];
//   return gray.getRegion(face).resize(128, 128);
// }

// // 2. Compute LBP (Local Binary Patterns)
// function computeLBP(faceROI) {
//   const lbp = new cv.Mat();
//   const radius = 1;
//   const neighbors = 8;
//   const gridSize = 8;

//   // Compute LBP
//   faceROI.lbp(radius, neighbors, lbp, gridSize);

//   // Calculate histogram (spooffing tends to have uniform patterns)
//   const hist = lbp.calcHist([0], new cv.Mat(), [256], [0, 256]);
//   return hist;
// }

// // 3. Check if texture is natural (real) or spoofed (photo/screen)
// function isRealFace(lbpHist) {
//   // Real faces have varied textures → higher entropy
//   const entropy = computeEntropy(lbpHist);
//   return entropy > 4.5; // Threshold (adjust based on testing)
// }

// function computeEntropy(hist) {
//   const total = hist.sum();
//   let entropy = 0;

//   for (let i = 0; i < 256; i++) {
//     const p = hist.at(i) / total;
//     if (p > 0) entropy -= p * Math.log2(p);
//   }

//   return entropy;
// }

// // 4. Main Liveness Check
// async function checkLiveness(buffer) {
//   try {
//     const faceROI = await extractFaceROI(buffer);
//     const lbpHist = computeLBP(faceROI);
//     const isReal = isRealFace(lbpHist);

//     return {
//       isReal,
//       confidence: isReal ? "High (Live)" : "Low (Spoof)",
//     };
//   } catch (err) {
//     return { error: err.message };
//   }
// }

// module.exports = { checkLiveness };
