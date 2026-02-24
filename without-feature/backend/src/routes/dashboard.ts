import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../types.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// GET /api/dashboard/stats
router.get("/stats", authenticate, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stats = await prisma.dashboardStat.findMany({
      orderBy: { order: "asc" },
    });

    res.json({ stats });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/dashboard/chart-data
router.get("/chart-data", authenticate, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const months = [
      "Mar", "Apr", "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec", "Jan", "Feb",
    ];

    const revenueData = [
      { month: "Mar", revenue: 42500, expenses: 28400, profit: 14100 },
      { month: "Apr", revenue: 48200, expenses: 30100, profit: 18100 },
      { month: "May", revenue: 51800, expenses: 31500, profit: 20300 },
      { month: "Jun", revenue: 46900, expenses: 29800, profit: 17100 },
      { month: "Jul", revenue: 55300, expenses: 33200, profit: 22100 },
      { month: "Aug", revenue: 59100, expenses: 34700, profit: 24400 },
      { month: "Sep", revenue: 52400, expenses: 32100, profit: 20300 },
      { month: "Oct", revenue: 61800, expenses: 36400, profit: 25400 },
      { month: "Nov", revenue: 67200, expenses: 38900, profit: 28300 },
      { month: "Dec", revenue: 72500, expenses: 41200, profit: 31300 },
      { month: "Jan", revenue: 68900, expenses: 39800, profit: 29100 },
      { month: "Feb", revenue: 74100, expenses: 42500, profit: 31600 },
    ];

    res.json({
      months,
      revenueData,
      summary: {
        totalRevenue: revenueData.reduce((sum, d) => sum + d.revenue, 0),
        totalExpenses: revenueData.reduce((sum, d) => sum + d.expenses, 0),
        totalProfit: revenueData.reduce((sum, d) => sum + d.profit, 0),
        avgMonthlyRevenue: Math.round(
          revenueData.reduce((sum, d) => sum + d.revenue, 0) / revenueData.length
        ),
      },
    });
  } catch (error) {
    console.error("Chart data error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
