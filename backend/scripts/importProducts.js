require("dotenv").config();

const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const importProducts = require("../services/productImportService");

const runImport = async () => {
  try {
    await connectDatabase();
    await importProducts();

    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Import process failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runImport();
