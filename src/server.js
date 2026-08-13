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

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://humanfirst-web.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(helmet());
app.use(apiLimiter);

// ==========================================
// ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/search", searchRoutes);

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "HumanFirst Backend is running successfully!",
  });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "HumanFirst API and database are connected!",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// ==========================================
// TEST EMAIL
// ==========================================

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

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`HumanFirst backend is running on port ${PORT}`);
  });
}

module.exports = app;