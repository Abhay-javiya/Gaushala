
const Animal = require("../models/Animal");

// 1. Add Animal
const addAnimal = async (req, res) => {
  try {
    const {
      name,
      tagNumber,
      type,
      gender,
      breed,
      dateOfBirth,
      motherId,
      fatherId,
      photo,
      notes
    } = req.body;

    if (!name || !tagNumber || !type || !gender) {
      return res.status(400).json({
        success: false,
        message: "Name, tag number, type and gender are required"
      });
    }

    const existingAnimal = await Animal.findOne({ tagNumber });

    if (existingAnimal) {
      return res.status(409).json({
        success: false,
        message: "Tag number already exists"
      });
    }

    const animal = await Animal.create({
      name,
      tagNumber,
      type,
      gender,
      breed,
      dateOfBirth,
      motherId: motherId || null,
      fatherId: fatherId || null,
      photo,
      notes
    });

    res.status(201).json({
      success: true,
      message: "Animal added successfully",
      data: animal
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 2. Get All Animals
const getAnimals = async (req, res) => {
  try {
    const animals = await Animal.find()
      .populate("motherId", "name tagNumber")
      .populate("fatherId", "name tagNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: animals.length,
      data: animals
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 3. Get Single Animal
const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .populate("motherId", "name tagNumber")
      .populate("fatherId", "name tagNumber");

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found"
      });
    }

    res.status(200).json({
      success: true,
      data: animal
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid animal ID"
    });
  }
};


// 4. Update Animal
const updateAnimal = async (req, res) => {
  try {
    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Animal updated successfully",
      data: animal
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// 5. Delete Animal
const deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.id);

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Animal deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid animal ID"
    });
  }
};


module.exports = {
  addAnimal,
  getAnimals,
  getAnimalById,
  updateAnimal,
  deleteAnimal
};
