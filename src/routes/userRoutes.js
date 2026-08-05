const express = require("express");

const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const validate = require("../middleware/validate");

const {
  updateProfileSchema,
} = require("../validators/authValidator");

const router = express.Router();

// Get the currently logged-in user's profile
router.get(
  "/profile",
  authenticateToken,
  getUserProfile
);

// Update the currently logged-in user's profile
router.put(
  "/profile",
  authenticateToken,
  validate(updateProfileSchema),
  updateUserProfile
);

module.exports = router;