const express = require("express");
const router = express.Router();

const {
  addAnimal,
  getAnimals,
  getAnimalById,
  updateAnimal,
  deleteAnimal
} = require("../controllers/animalController");

// Add Animal
router.post("/", addAnimal);

// Get All Animals
router.get("/", getAnimals);

// Get Single Animal
router.get("/:id", getAnimalById);

// Update Animal
router.put("/:id", updateAnimal);

// Delete Animal
router.delete("/:id", deleteAnimal);

module.exports = router;
