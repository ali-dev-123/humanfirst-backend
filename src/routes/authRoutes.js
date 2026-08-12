const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  googleAuth,
} = require("../controllers/authController");

const validate = require("../middleware/validate");

const {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators/authValidator");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");
const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);
router.post(
  "/google",
  validate(googleAuthSchema),
  googleAuth
);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPassword
);
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