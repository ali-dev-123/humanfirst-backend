const prisma = require("../config/prisma");

const getUserProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            user,
        });
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user profile",
        });
    }
};
const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate the name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Update the logged-in user's profile
    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.userId,
      },
      data: {
        name: name.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user profile",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};