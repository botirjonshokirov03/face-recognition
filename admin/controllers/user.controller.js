const {
  generateAndSaveEmbedding,
  generateEmbeddingFromImage,
  compareEmbeddings,
  checkLivenessFromPythonAPI,
} = require("../services/face.service");

const User = require("../models/User");

const createUser = async (req, res) => {
  const { name, email } = req.body;
  const buffer = req.file?.buffer;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = await generateAndSaveEmbedding(name, email, buffer);

    user.email = email;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyUser = async (req, res) => {
  const { email } = req.body;
  const buffer = req.file?.buffer;

  try {
    const liveness = await checkLivenessFromPythonAPI(buffer);
    const isReal = liveness?.is_real === true;
    const spoofScore = parseFloat(liveness?.antispoof_score) || 0;

    if (!isReal || spoofScore < 0.8) {
      return res.json({
        result: "Liveness check failed",
        reason: !isReal ? "Spoof likely" : "Antispoof score too low",
        liveness,
      });
    }

    const user = await User.findOne({ email });
    if (!user || !user.faceEmbedding) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const newEmbedding = await generateEmbeddingFromImage(buffer);
    const { isMatch, similarity } = compareEmbeddings(
      user.faceEmbedding,
      newEmbedding
    );

    return res.json({
      result: isMatch ? "Verified" : "Not Verified",
      similarity,
      liveness,
    });
  } catch (error) {
    console.error("Verification error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

const updateUser = async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
};

const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

const userControllers = {
  createUser,
  verifyUser,
  getAllUsers,
  updateUser,
  deleteUser,
};

module.exports = userControllers;
