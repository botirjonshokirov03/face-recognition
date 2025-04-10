const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  generateEmbeddingFromImage,
  compareEmbeddings,
  checkLivenessFromPythonAPI,
} = require("../services/face.service");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRES_IN || "1d",
  });
};

const login = async (req, res) => {
  const { email } = req.body;
  const buffer = req.file?.buffer;

  if (!email || !buffer) {
    return res.status(400).json({ error: "Email and image are required" });
  }

  try {
    const admin = await User.findOne({ email });
    if (!admin || !admin.isAdmin || !admin.faceEmbedding) {
      return res.status(403).json({ error: "Access denied" });
    }

    const liveness = await checkLivenessFromPythonAPI(buffer);
    const isReal = liveness?.is_real === true;
    const spoofScore = parseFloat(liveness?.antispoof_score) || 0;

    if (!isReal || spoofScore < 0.8) {
      return res.status(401).json({
        error: "Liveness check failed",
        reason: !isReal ? "Spoof likely" : "Antispoof score too low",
        liveness,
      });
    }

    const newEmbedding = await generateEmbeddingFromImage(buffer);
    const { isMatch, similarity } = compareEmbeddings(
      admin.faceEmbedding,
      newEmbedding
    );

    if (!isMatch) {
      return res.status(401).json({ error: "Face verification failed" });
    }

    const token = generateToken(admin._id);
    res.json({ token, similarity, liveness });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const loginControllers = {
  login,
};

module.exports = loginControllers;
