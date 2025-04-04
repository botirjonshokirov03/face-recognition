const multer = require("multer");
const router = require("express").Router();
const { uploadFace, verifyFace } = require("../controllers/face.controller");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("image"), uploadFace);
router.post("/verify", upload.single("image"), verifyFace);

module.exports = router;
