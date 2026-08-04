require("dotenv").config();

const express = require("express");
const prisma = require("./config/prisma");

const app = express();

const PORT = process.env.PORT || 5000;

// Allows the backend to read JSON data
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "HumanFirst Backend is running successfully with Nodemon!"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "HumanFirst API and database are connected!"
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`HumanFirst backend is running on port ${PORT}`);
});