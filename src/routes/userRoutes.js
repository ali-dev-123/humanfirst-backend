const express = require("express");

const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get the currently logged-in user's profile
router.put(
  "/profile",
  authenticateToken,
  updateUserProfile
);

module.exports = router;