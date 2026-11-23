import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import explainRouter from "./routes/explain.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Render sits behind a proxy; this lets the rate limiter see real client IPs
app.set("trust proxy", 1);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

// Protects your free Gemini quota from abuse
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please wait a minute and try again." },
  })
);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/explain", explainRouter);

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err.message);
  const status = err.name === "MulterError" || /allowed/i.test(err.message) ? 400 : 500;
  res.status(status).json({
    error: status === 400 ? err.message : "Something went wrong. Please try again.",
  });
});

app.listen(PORT, () => console.log(`HealthLens server running on port ${PORT}`));
