import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "pulseboard-secret-key-change-in-production";

// POST /api/auth/register
router.post("/register", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required." });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: "A user with this email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role === "ADMIN" ? "ADMIN" : "VIEWER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, user });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/auth/login
router.post("/login", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
