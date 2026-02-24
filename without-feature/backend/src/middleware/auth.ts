import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, JwtPayload } from "../types.js";

const JWT_SECRET = process.env.JWT_SECRET || "pulseboard-secret-key-change-in-production";

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(403).json({ error: "Access denied. Admin privileges required." });
    return;
  }

  next();
}
