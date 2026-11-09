require("dotenv").config();

const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await connectDatabase();

    const adminEmail = "admin@example.com";
    const adminPassword = "AdminPassword123";

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    await User.create({
      name: "Store Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    console.log("Admin account created successfully.");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
