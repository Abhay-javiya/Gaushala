
const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    tagNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["cow", "bull", "calf"],
      required: true
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true
    },

    breed: {
      type: String,
      default: ""
    },

    dateOfBirth: {
      type: Date
    },

    motherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      default: null
    },

    fatherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      default: null
    },

    photo: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["active", "sold", "deceased"],
      default: "active"
    },

    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Animal", animalSchema);
