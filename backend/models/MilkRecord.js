
const mongoose = require("mongoose");

const milkRecordSchema = new mongoose.Schema(
  {
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true
    },

    date: {
      type: String,
      required: true
    },

    session: {
      type: String,
      enum: ["morning", "evening"],
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 0
    },

    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

milkRecordSchema.index(
  { animalId: 1, date: 1, session: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "MilkRecord",
  milkRecordSchema
);
