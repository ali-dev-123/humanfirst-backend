require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const contactRoutes = require("./routes/contactRoutes");
const searchRoutes = require("./routes/searchRoutes");
const errorHandler = require("./middleware/errorHandler");
const helmet = require("helmet");
const apiLimiter = require("./middleware/rateLimiter");
const sendEmail = require("./utils/sendEmail");

const PORT = process.env.PORT || 5000;

const app = express();
// Allows the backend to read JSON data
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/search", searchRoutes);

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

app.get("/api/test-email", async (req, res) => {
  try {
    await sendEmail(
      process.env.EMAIL_USER,
      "HumanFirst Test Email",
      `
        <h2>HumanFirst Email Test</h2>
        <p>If you received this email, Nodemailer is configured successfully. 🎉</p>
      `
    );

    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("Email error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send test email",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`HumanFirst backend is running on port ${PORT}`);
});