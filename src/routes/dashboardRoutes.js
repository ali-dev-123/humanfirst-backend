const express = require("express");

const {
  getDashboard,
} = require("../controllers/dashboardController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get dashboard data for the currently logged-in user
router.get(
  "/",
  authenticateToken,
  getDashboard
);

module.exports = router;