const mongoose = require("mongoose");

const getHealthStatus = (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: databaseConnected
      ? "E-commerce API is running"
      : "Database connection unavailable",
    database: databaseConnected ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealthStatus };
