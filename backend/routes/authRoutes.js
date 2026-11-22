
const express = require("express");
const router = express.Router();

const { adminLogin, getCurrentAdmin } = require("../controllers/authController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// Admin Login
router.post("/login", adminLogin);
router.get("/me", verifyToken, requireAdmin, getCurrentAdmin);

module.exports = router;
