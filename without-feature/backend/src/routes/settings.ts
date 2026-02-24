import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../types.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// GET /api/settings
router.get("/", authenticate, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const settings = await prisma.setting.findMany({
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { key: "asc" },
    });

    res.json({ settings });
  } catch (error) {
    console.error("Settings fetch error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// PUT /api/settings/:id
router.put("/:id", authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
      res.status(400).json({ error: "Value is required." });
      return;
    }

    const existing = await prisma.setting.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Setting not found." });
      return;
    }

    const setting = await prisma.setting.update({
      where: { id },
      data: {
        value: String(value),
        updatedById: req.user!.userId,
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({ setting });
  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
