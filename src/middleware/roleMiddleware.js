const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // authMiddleware must run before this middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required",
      });
    }

    // Check whether the user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    // User has the required role
    next();
  };
};

module.exports = {
  authorizeRoles,
};