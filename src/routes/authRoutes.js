const express = require("express");
const {
  register,
  login,
} = require("../controllers/authController");
const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Protected route accessed successfully",
    user: req.user,
  });
});
module.exports = router;