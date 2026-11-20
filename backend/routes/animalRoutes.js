const express = require("express");
const router = express.Router();

const {
  addAnimal,
  getAnimals,
  getAnimalById,
  updateAnimal,
  deleteAnimal
} = require("../controllers/animalController");

const {
  verifyToken,
  requireAdmin
} = require("../middleware/authMiddleware");

// Public read
router.get("/", getAnimals);
router.get("/:id", getAnimalById);

// Admin only
router.post("/", verifyToken, requireAdmin, addAnimal);
router.put("/:id", verifyToken, requireAdmin, updateAnimal);
router.delete("/:id", verifyToken, requireAdmin, deleteAnimal);

module.exports = router;
