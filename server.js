require("dotenv").config();
require("./utils/winnerScheduler");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const bidRoutes = require("./routes/bidRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const { apiLimiter } = require("./middleware/rateLimiter");
const swaggerSpec = require("./config/swagger");
const influencerRoutes = require("./routes/influencerRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const apiKeyMiddleware = require("./middleware/apiKeyMiddleware");
const selectWinner = require("./utils/winnerScheduler");
const devRoutes = require("./routes/devRoutes");

const app = express();

// ─── Core Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS – restrict to known origins in production
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? [process.env.CLIENT_URL || "http://localhost:5173"]
    : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  credentials: true
}));

// Security headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for Swagger UI to work
}));

// Rate limiting on all API routes
app.use("/api", apiLimiter);

// ─── Swagger Documentation ─────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── API Routes ─────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/influencer", influencerRoutes);
app.use("/api/keys", apiKeyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dev", devRoutes);

// ─── Health Check ──────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ message: "Server is running", timestamp: new Date().toISOString() });
});

// Manual winner selection trigger (dev only)
app.get("/api/dev/run-winner", async (req, res) => {
  await selectWinner();
  res.json({ message: "Winner selection triggered manually" });
});

// Test API key endpoint (dev only)
app.get("/api/dev/test-key", apiKeyMiddleware("read:analytics"), (req, res) => {
  res.json({
    message: "API key works",
    keyId: req.apiKey.id,
    client: req.apiKey.client_name,
    permissions: req.apiKey.permissions,
    usageCount: req.apiKey.usage_count
  });
});

// ─── Database Connection & Sync ────────────────────────────────────
sequelize.authenticate()
  .then(() => console.log("Database connected"))
  .then(() => sequelize.sync({ alter: true }))
  .then(() => console.log("Models synced"))
  .catch((err) => console.error("DB error:", err));

// ─── Start Server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});