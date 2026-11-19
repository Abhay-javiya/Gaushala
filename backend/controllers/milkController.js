
const MilkRecord = require("../models/MilkRecord");
const Animal = require("../models/Animal");

// Validate YYYY-MM-DD date
const isValidDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date;
};

// 1. Add Milk Record
const addMilkRecord = async (req, res) => {
  try {
    const { animalId, date, session, quantity, notes } = req.body;

    if (!animalId || !date || !session || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Animal, date, session and quantity are required"
      });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format"
      });
    }

    if (!["morning", "evening"].includes(session)) {
      return res.status(400).json({
        success: false,
        message: "Session must be morning or evening"
      });
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid non-negative number"
      });
    }

    const animal = await Animal.findById(animalId);

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found"
      });
    }

    if (animal.type !== "cow" || animal.gender !== "female" ||
        animal.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Milk records can only be added for active female cows"
      });
    }

    const record = await MilkRecord.create({
      animalId,
      date,
      session,
      quantity,
      notes
    });

    res.status(201).json({
      success: true,
      message: "Milk record added successfully",
      data: record
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Milk record already exists for this cow, date and session"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 2. Get All Milk Records
const getMilkRecords = async (req, res) => {
  try {
    const { date, session, animalId } = req.query;
    const filter = {};

    if (date) {
      if (!isValidDate(date)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format"
        });
      }
      filter.date = date;
    }

    if (session) {
      if (!["morning", "evening"].includes(session)) {
        return res.status(400).json({
          success: false,
          message: "Invalid session"
        });
      }
      filter.session = session;
    }

    if (animalId) filter.animalId = animalId;

    const records = await MilkRecord.find(filter)
      .populate("animalId", "name tagNumber breed")
      .sort({ date: -1, createdAt: -1 });

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


// 3. Get Records By Date
const getMilkByDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }

    const records = await MilkRecord.find({ date })
      .populate("animalId", "name tagNumber")
      .sort({ session: 1 });

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


// 4. Get Individual Cow Milk History
const getAnimalMilkHistory = async (req, res) => {
  try {
    const { animalId } = req.params;

    if (!await Animal.exists({ _id: animalId })) {
      return res.status(404).json({
        success: false,
        message: "Animal not found"
      });
    }

    const records = await MilkRecord.find({ animalId })
      .sort({ date: -1, session: 1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid animal ID"
    });
  }
};


// 5. Daily Milk Summary
const getDailySummary = async (req, res) => {
  try {
    const { date } = req.params;

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format"
      });
    }

    const summary = await MilkRecord.aggregate([
      { $match: { date } },
      {
        $group: {
          _id: "$session",
          totalQuantity: { $sum: "$quantity" },
          totalEntries: { $sum: 1 }
        }
      }
    ]);

    const morning = summary.find(
      item => item._id === "morning"
    );

    const evening = summary.find(
      item => item._id === "evening"
    );

    const morningTotal = morning?.totalQuantity || 0;
    const eveningTotal = evening?.totalQuantity || 0;

    res.status(200).json({
      success: true,
      date,
      morning: morningTotal,
      evening: eveningTotal,
      dailyTotal: morningTotal + eveningTotal,
      morningEntries: morning?.totalEntries || 0,
      eveningEntries: evening?.totalEntries || 0
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 6. Monthly Milk Summary
const getMonthlySummary = async (req, res) => {
  try {
    const { month } = req.params;

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Month must be in YYYY-MM format"
      });
    }

    const records = await MilkRecord.aggregate([
      {
        $match: {
          date: {
            $regex: `^${month}-`
          }
        }
      },
      {
        $group: {
          _id: {
            date: "$date",
            session: "$session"
          },
          totalQuantity: { $sum: "$quantity" }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    let morningTotal = 0;
    let eveningTotal = 0;

    const dailyBreakdown = {};

    records.forEach(record => {
      const { date, session } = record._id;

      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          morning: 0,
          evening: 0,
          total: 0
        };
      }

      dailyBreakdown[date][session] = record.totalQuantity;
      dailyBreakdown[date].total += record.totalQuantity;

      if (session === "morning") {
        morningTotal += record.totalQuantity;
      } else {
        eveningTotal += record.totalQuantity;
      }
    });

    res.status(200).json({
      success: true,
      month,
      morningTotal,
      eveningTotal,
      monthlyTotal: morningTotal + eveningTotal,
      dailyBreakdown
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  addMilkRecord,
  getMilkRecords,
  getMilkByDate,
  getAnimalMilkHistory,
  getDailySummary,
  getMonthlySummary
};
