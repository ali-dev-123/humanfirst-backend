const express = require("express");

const {
  getUserProfile,
} = require("../controllers/userController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get the currently logged-in user's profile
router.get("/profile", authenticateToken, getUserProfile);

module.exports = router;