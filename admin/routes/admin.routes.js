const express = require("express");
const multer = require("multer");
const userControllers = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", verifyToken, userControllers.getAllUsers);
router.post(
  "/create",
  verifyToken,
  upload.single("image"),
  userControllers.createUser
);
router.post(
  "/verify",
  verifyToken,
  upload.single("image"),
  userControllers.verifyUser
);
router.patch("/:id", verifyToken, userControllers.updateUser);
router.delete("/:id", verifyToken, userControllers.deleteUser);

module.exports = router;
