
const mongoose = require("mongoose");

const breedingRecordSchema = new mongoose.Schema(
  {
    motherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true
    },

    fatherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      default: null
    },

    breedingDate: {
      type: Date,
      required: true
    },

    expectedDeliveryDate: {
      type: Date
    },

    actualDeliveryDate: {
      type: Date
    },

    calfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      default: null
    },

    status: {
      type: String,
      enum: [
        "planned",
        "bred",
        "pregnant",
        "delivered",
        "unsuccessful"
      ],
      default: "bred"
    },

    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "BreedingRecord",
  breedingRecordSchema
);
