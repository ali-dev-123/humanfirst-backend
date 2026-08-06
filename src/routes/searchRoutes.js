const express = require("express");

const { searchUsers } = require("../controllers/searchController");

const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Search users
router.get("/users", authenticateToken, searchUsers);

module.exports = router;