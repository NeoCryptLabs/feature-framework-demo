import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import analyticsRoutes from "./routes/analytics.js";
import settingsRoutes from "./routes/settings.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
);

app.listen(PORT, () => {
  console.log(`PulseBoard API server running on http://localhost:${PORT}`);
});

export default app;
