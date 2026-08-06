const prisma = require("../config/prisma");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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

    const dashboardData = {
      user,
      welcomeMessage: `Welcome back, ${user.name}!`,

      summary: {
        accountStatus: "ACTIVE",
        role: user.role,
        memberSince: user.createdAt,
      },
    };

    if (userRole === "ADMIN") {
      const [
        totalUsers,
        totalStudents,
        totalTeachers,
        totalAdmins,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            role: "STUDENT",
          },
        }),
        prisma.user.count({
          where: {
            role: "TEACHER",
          },
        }),
        prisma.user.count({
          where: {
            role: "ADMIN",
          },
        }),
      ]);

      dashboardData.statistics = {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalAdmins,
      };
    }

    return res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      dashboard: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard data",
    });
  }
};

module.exports = {
  getDashboard,
};