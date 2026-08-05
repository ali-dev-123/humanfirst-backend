const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const {
  authenticateToken,
} = require("../middleware/authMiddleware");
const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authenticateToken, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Protected route accessed successfully",
    user: req.user,
  });
});
router.get(
  "/admin-test",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Welcome to the HumanFirst admin area",
      user: req.user,
    });
  }
);
module.exports = router;