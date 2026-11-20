require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    if (
      !process.env.ADMIN_NAME ||
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD
    ) {
      throw new Error("Admin environment variables are missing");
    }

    await connectDB();

    const email = process.env.ADMIN_EMAIL.toLowerCase().trim();

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Account already exists. No changes made.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      12
    );

    await User.create({
      name: process.env.ADMIN_NAME,
      email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin account created successfully!");

  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
