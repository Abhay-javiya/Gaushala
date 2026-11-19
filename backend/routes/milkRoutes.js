const express = require("express");
const router = express.Router();

const {
  addMilkRecord,
  getMilkRecords,
  getMilkByDate,
  getAnimalMilkHistory,
  getDailySummary,
  getMonthlySummary
} = require("../controllers/milkController");

// Add milk record
router.post("/", addMilkRecord);

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
