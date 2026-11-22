const express = require("express");
const router = express.Router();

const {
  addMilkRecord,
  updateMilkRecord,
  deleteMilkRecord,
  getMilkRecords,
  getMilkByDate,
  getAnimalMilkHistory,
  getDailySummary,
  getMonthlySummary
} = require("../controllers/milkController");

const {
  verifyToken,
  requireAdmin
} = require("../middleware/authMiddleware");

// Add milk record
router.post("/", verifyToken, requireAdmin, addMilkRecord);
router.put("/:id", verifyToken, requireAdmin, updateMilkRecord);
router.delete("/:id", verifyToken, requireAdmin, deleteMilkRecord);

// Get all records (optional filters)
router.get("/", getMilkRecords);

// Get records by date
router.get("/date/:date", getMilkByDate);

// Get individual animal history
router.get("/animal/:animalId", getAnimalMilkHistory);

// Daily summary
router.get("/summary/daily/:date", getDailySummary);

// Monthly summary
router.get("/summary/monthly/:month", getMonthlySummary);

module.exports = router;
