const express = require("express");
const router = express.Router();

const {
  addBreedingRecord,
  getBreedingRecords,
  getBreedingByMother,
  updateBreedingStatus,
  registerCalf
} = require("../controllers/breedingController");

const {
  verifyToken,
  requireAdmin
} = require("../middleware/authMiddleware");

// Add breeding record
router.post("/", verifyToken, requireAdmin, addBreedingRecord);

// Get all breeding records
router.get("/", getBreedingRecords);

// Get breeding history of a cow
router.get("/mother/:motherId", getBreedingByMother);

// Update breeding status
router.put("/:id/status", verifyToken, requireAdmin, updateBreedingStatus);

// Register newborn calf
router.post("/:id/calf", verifyToken, requireAdmin, registerCalf);

module.exports = router;
