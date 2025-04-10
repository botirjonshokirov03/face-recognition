const express = require("express");
const router = express.Router();

const authRoutes = require("./admin/routes/auth.routes");
const adminUserRoutes = require("./admin/routes/admin.routes");

router.use("/admin/auth", authRoutes);
router.use("/admin/users", adminUserRoutes);

module.exports = router;
