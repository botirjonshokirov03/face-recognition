const express = require("express");
const multer = require("multer");
const { loginValidation } = require("../middleware/validation");
const loginControllers = require("../controllers/auth.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/login",
  upload.single("image"),
  loginValidation,
  loginControllers.login
);

module.exports = router;
