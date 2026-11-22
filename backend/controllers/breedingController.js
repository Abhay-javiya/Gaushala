
const BreedingRecord = require("../models/BreedingRecord");
const Animal = require("../models/Animal");
const mongoose = require("mongoose");

// Calculate expected delivery date
const calculateDeliveryDate = (date) => {
  const expected = new Date(date);
  expected.setDate(expected.getDate() + 283);
  return expected;
};

// 1. Add Breeding Record
const addBreedingRecord = async (req, res) => {
  try {
    const {
      motherId,
      fatherId,
      breedingDate,
      notes
    } = req.body;

    if (!motherId || !breedingDate) {
      return res.status(400).json({
        success: false,
        message: "Mother ID and breeding date are required"
      });
    }

    const date = new Date(breedingDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid breeding date"
      });
    }

    // Check mother
    const mother = await Animal.findById(motherId);

    if (!mother) {
      return res.status(404).json({
        success: false,
        message: "Mother cow not found"
      });
    }

    if (mother.type !== "cow" || mother.gender !== "female") {
      return res.status(400).json({
        success: false,
        message: "Mother must be a female cow"
      });
    }

    if (mother.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Mother cow is not active"
      });
    }

    // Check father if provided
    if (fatherId) {
      const father = await Animal.findById(fatherId);

      if (!father) {
        return res.status(404).json({
          success: false,
          message: "Father bull not found"
        });
      }

      if (father.type !== "bull" || father.gender !== "male") {
        return res.status(400).json({
          success: false,
          message: "Father must be a male bull"
        });
      }

      if (father.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Father bull is not active"
        });
      }
    }

    const breeding = await BreedingRecord.create({
      motherId,
      fatherId: fatherId || null,
      breedingDate: date,
      expectedDeliveryDate: calculateDeliveryDate(date),
      status: "bred",
      notes
    });

    res.status(201).json({
      success: true,
      message: "Breeding record added successfully",
      data: breeding
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 2. Get All Breeding Records
const getBreedingRecords = async (req, res) => {
  try {
    const records = await BreedingRecord.find()
      .populate("motherId", "name tagNumber breed")
      .populate("fatherId", "name tagNumber breed")
      .populate("calfId", "name tagNumber gender")
      .sort({ breedingDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 3. Get Breeding History By Mother
const getBreedingByMother = async (req, res) => {
  try {
    const { motherId } = req.params;

    const mother = await Animal.findById(motherId);

    if (!mother) {
      return res.status(404).json({
        success: false,
        message: "Mother cow not found"
      });
    }

    const records = await BreedingRecord.find({ motherId })
      .populate("fatherId", "name tagNumber")
      .populate("calfId", "name tagNumber gender")
      .sort({ breedingDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid mother ID"
    });
  }
};


// 4. Update Breeding Status
const updateBreedingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const allowedStatuses = [
      "bred",
      "pregnant",
      "unsuccessful"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid breeding status"
      });
    }

    const breeding = await BreedingRecord.findById(
      req.params.id
    );

    if (!breeding) {
      return res.status(404).json({
        success: false,
        message: "Breeding record not found"
      });
    }

    if (breeding.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered breeding record cannot be changed"
      });
    }

    breeding.status = status;

    if (notes !== undefined) {
      breeding.notes = notes;
    }

    await breeding.save();

    res.status(200).json({
      success: true,
      message: "Breeding status updated successfully",
      data: breeding
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateBreedingRecord = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid breeding record ID" });
    const record = await BreedingRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Breeding record not found" });
    if (record.status === "delivered" || record.calfId) return res.status(409).json({ success: false, message: "Delivered records cannot be edited" });
    const { motherId, fatherId, breedingDate, expectedDeliveryDate, status, notes } = req.body;
    const nextMotherId = motherId ?? record.motherId;
    const nextFatherId = fatherId === undefined ? record.fatherId : fatherId || null;
    if (!mongoose.isValidObjectId(nextMotherId) || (nextFatherId && !mongoose.isValidObjectId(nextFatherId))) return res.status(400).json({ success: false, message: "Invalid parent animal ID" });
    const [mother, father] = await Promise.all([Animal.findById(nextMotherId), nextFatherId ? Animal.findById(nextFatherId) : null]);
    if (!mother || mother.type !== "cow" || mother.gender !== "female" || mother.status !== "active") return res.status(400).json({ success: false, message: "Mother must be an active female cow" });
    if (nextFatherId && (!father || father.type !== "bull" || father.gender !== "male" || father.status !== "active")) return res.status(400).json({ success: false, message: "Father must be an active male bull" });
    const nextBreedingDate = new Date(breedingDate ?? record.breedingDate);
    if (Number.isNaN(nextBreedingDate.getTime())) return res.status(400).json({ success: false, message: "Invalid breeding date" });
    const nextExpected = new Date(expectedDeliveryDate ?? record.expectedDeliveryDate ?? calculateDeliveryDate(nextBreedingDate));
    if (Number.isNaN(nextExpected.getTime()) || nextExpected < nextBreedingDate) return res.status(400).json({ success: false, message: "Expected delivery date must be on or after breeding date" });
    if (status && !["bred", "pregnant", "unsuccessful"].includes(status)) return res.status(400).json({ success: false, message: "Invalid breeding status" });
    record.motherId = nextMotherId; record.fatherId = nextFatherId; record.breedingDate = nextBreedingDate; record.expectedDeliveryDate = nextExpected;
    if (status) record.status = status;
    if (notes !== undefined) record.notes = notes;
    await record.save();
    return res.json({ success: true, message: "Breeding record updated successfully", data: record });
  } catch (error) { return res.status(500).json({ success: false, message: "Breeding record could not be updated" }); }
};

const deleteBreedingRecord = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid breeding record ID" });
    const record = await BreedingRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Breeding record not found" });
    if (record.calfId || record.status === "delivered") return res.status(409).json({ success: false, message: "Cannot delete a record with a registered calf" });
    await record.deleteOne();
    return res.json({ success: true, message: "Breeding record deleted successfully" });
  } catch { return res.status(500).json({ success: false, message: "Breeding record could not be deleted" }); }
};


// 5. Register Newborn Calf
const registerCalf = async (req, res) => {
  try {
    const {
      name,
      tagNumber,
      gender,
      breed,
      dateOfBirth,
      notes
    } = req.body;

    if (!name || !tagNumber || !gender || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "Name, tag number, gender and birth date are required"
      });
    }

    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Gender must be male or female"
      });
    }

    const breeding = await BreedingRecord.findById(
      req.params.id
    );

    if (!breeding) {
      return res.status(404).json({
        success: false,
        message: "Breeding record not found"
      });
    }

    if (breeding.calfId || breeding.status === "delivered") {
      return res.status(409).json({
        success: false,
        message: "Calf is already registered"
      });
    }

    const birthDate = new Date(dateOfBirth);

    if (Number.isNaN(birthDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid birth date"
      });
    }

    if (birthDate < breeding.breedingDate) {
      return res.status(400).json({
        success: false,
        message: "Birth date cannot be before breeding date"
      });
    }

    const calf = await Animal.create({
      name,
      tagNumber,
      type: "calf",
      gender,
      breed: breed || "",
      dateOfBirth: birthDate,
      motherId: breeding.motherId,
      fatherId: breeding.fatherId,
      notes: notes || ""
    });

    breeding.calfId = calf._id;
    breeding.actualDeliveryDate = birthDate;
    breeding.status = "delivered";

    await breeding.save();

    res.status(201).json({
      success: true,
      message: "Calf registered successfully",
      data: {
        calf,
        breedingRecord: breeding
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Tag number already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  addBreedingRecord,
  getBreedingRecords,
  getBreedingByMother,
  updateBreedingStatus,
  updateBreedingRecord,
  deleteBreedingRecord,
  registerCalf
};
