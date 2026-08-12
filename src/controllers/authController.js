const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const prisma = require("../config/prisma");
const sendEmail = require("../utils/sendEmail");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createAuthToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const buildAuthResponse = (user, message = "Login successful") => {
  return {
    success: true,
    message,
    token: createAuthToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check whether the email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STUDENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register user",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Do not reveal whether the email exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare entered password with the stored hash
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create a JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    // Send a safe response
    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: "Google client ID is not configured",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google credential",
      });
    }

    const {
      email,
      email_verified: emailVerified,
      name,
      iss,
      aud,
    } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account email is missing",
      });
    }

    if (!emailVerified) {
      return res.status(401).json({
        success: false,
        message: "Google account email is not verified",
      });
    }

    if (!["accounts.google.com", "https://accounts.google.com"].includes(iss)) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token issuer",
      });
    }

    if (aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({
        success: false,
        message: "Google token audience does not match",
      });
    }

    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      user = await prisma.user.create({
        data: {
          name: name || email,
          email,
          password: hashedPassword,
          role: "STUDENT",
        },
      });
    }

    return res.status(200).json(buildAuthResponse(user, "Google login successful"));
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      success: false,
      message: "Unable to authenticate with Google",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        "success": true,
        "message": "If an account with that email exists, a password reset email has been sent."
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetTokenExpiry = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await sendEmail(
      user.email,
      "HumanFirst Password Reset",
      `
      <h2>Password Reset Request</h2>

      <p>Hello ${user.name},</p>

      <p>We received a request to reset your HumanFirst password.</p>

      <p>Click the link below to reset your password:</p>

      <a href="${resetLink}">Reset Password</a>

      <p>This link expires in <strong>15 minutes</strong>.</p>

      <p>If you did not request a password reset, you can safely ignore this email.</p>

      <br>

      <p>HumanFirst Team</p>
      `
    );

    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset email has been sent.",
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Validate request data
    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    // Find a user with this valid, unexpired token
    const user = await prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    // Token is invalid or expired
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or has expired",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and remove the used reset token
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
};