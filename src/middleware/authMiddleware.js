const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    // Check whether the Authorization header exists
    if (!authorizationHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    // Expected format: Bearer YOUR_JWT_TOKEN
    const token = authorizationHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    // Verify the JWT token
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Make user information available to the next route
    req.user = decodedToken;

    // Continue to the protected route
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

module.exports = {
  authenticateToken,
};