const {
  generateAndSaveEmbedding,
  generateEmbeddingFromImage,
  compareEmbeddings,
  checkLivenessFromPythonAPI,
} = require("../services/face.service");

const User = require("../models/User");

const uploadFace = async (req, res) => {
  const { name } = req.body;
  const buffer = req.file.buffer;

  try {
    const result = await generateAndSaveEmbedding(name, buffer);
    res.json({ success: true, user: result });
  } catch (error) {
    const isDuplicate = error.message.includes("E11000");
    res.status(400).json({
      success: false,
      error: isDuplicate ? "Name already exists" : error.message,
    });
  }
};

const verifyFace = async (req, res) => {
  const { userId } = req.body;
  const buffer = req.file.buffer;

  try {
    // 👉 1. Check liveness from Python API
    const liveness = await checkLivenessFromPythonAPI(buffer);

    // If not confidently real, block
    if (!liveness || liveness.result !== "real" || liveness.confidence < 0.8) {
      return res.json({
        result: "Fake Face Detected",
        liveness,
      });
    }

    // 👉 2. Proceed with embedding match
    const user = await User.findById(userId);
    if (!user || !user.faceEmbedding) {
      return res
        .status(404)
        .json({ success: false, error: "User or embedding not found" });
    }

    const newEmbedding = await generateEmbeddingFromImage(buffer);
    const { isMatch, similarity } = compareEmbeddings(
      user.faceEmbedding,
      newEmbedding
    );

    res.json({
      result: isMatch ? "Verified" : "Not Verified",
      similarity,
      liveness,
    });
  } catch (error) {
    console.error("Verification error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  uploadFace,
  verifyFace,
};
