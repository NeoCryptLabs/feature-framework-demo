import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../types.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// GET /api/analytics/events
router.get("/events", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category, startDate, endDate, page = "1", limit = "20" } = req.query;

    const where: Record<string, unknown> = {};

    if (category && typeof category === "string") {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate && typeof startDate === "string") {
        (where.date as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate && typeof endDate === "string") {
        (where.date as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.analyticsEvent.count({ where }),
    ]);

    res.json({
      events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Analytics events error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/analytics/metrics
router.get("/metrics", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.query;

    const where: Record<string, unknown> = {};
    if (category && typeof category === "string") {
      where.category = category;
    }

    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: { date: "asc" },
    });

    // Aggregate by category
    const categoryMetrics: Record<string, { totalCount: number; eventCount: number; avgCount: number }> = {};
    for (const event of events) {
      if (!categoryMetrics[event.category]) {
        categoryMetrics[event.category] = { totalCount: 0, eventCount: 0, avgCount: 0 };
      }
      categoryMetrics[event.category].totalCount += event.count;
      categoryMetrics[event.category].eventCount += 1;
    }

    for (const cat of Object.keys(categoryMetrics)) {
      categoryMetrics[cat].avgCount = Math.round(
        categoryMetrics[cat].totalCount / categoryMetrics[cat].eventCount
      );
    }

    // Aggregate by month
    const monthlyMetrics: Record<string, number> = {};
    for (const event of events) {
      const monthKey = event.date.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyMetrics[monthKey]) {
        monthlyMetrics[monthKey] = 0;
      }
      monthlyMetrics[monthKey] += event.count;
    }

    const monthlyData = Object.entries(monthlyMetrics)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Top events
    const topEvents = await prisma.analyticsEvent.groupBy({
      by: ["name"],
      _sum: { count: true },
      orderBy: { _sum: { count: "desc" } },
      take: 10,
    });

    res.json({
      categoryMetrics,
      monthlyData,
      topEvents: topEvents.map((e) => ({
        name: e.name,
        totalCount: e._sum.count || 0,
      })),
      totalEvents: events.length,
      totalCount: events.reduce((sum, e) => sum + e.count, 0),
    });
  } catch (error) {
    console.error("Analytics metrics error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
