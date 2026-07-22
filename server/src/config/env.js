// ============================================================
// Environment configuration — the single place env vars are read.
//
// Nothing else in the app touches process.env directly; they import `config`.
// This keeps secrets in one place, gives every value a sane default, and lets
// us fail fast at boot when something required is missing in production.
// ============================================================
"use strict";

require("dotenv").config();

const NODE_ENV = process.env.NODE_ENV || "development";
const isProd = NODE_ENV === "production";

/** Parse a comma-separated env var into a trimmed, non-empty array. */
function list(value, fallback = []) {
  if (!value) return fallback;
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const config = Object.freeze({
  nodeEnv: NODE_ENV,
  isProd,
  port: Number(process.env.PORT) || 4000,

  // Postgres (Neon) connection string used by Prisma.
  databaseUrl: process.env.DATABASE_URL || "",

  // The existing Google Apps Script web-app URL. The backend forwards every
  // lead here so Google Sheets keeps working exactly as before.
  googleScriptUrl: process.env.GOOGLE_SCRIPT_URL || "",

  // Which persistence adapter the service layer uses. Swap to "crm" (once that
  // adapter exists) to point at White Collar CRM without touching the frontend.
  leadStore: process.env.LEAD_STORE || "prisma",

  // CORS: exact origins allowed to call the API. "*" allows any (dev only).
  corsOrigins: list(process.env.CORS_ORIGIN, ["http://localhost:5173"]),

  // Rate limit: max requests per window, per IP, on the leads endpoint.
  rateLimit: {
    max: Number(process.env.RATE_LIMIT) || 30,
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  },

  // Reject request bodies larger than this (defends against payload-bomb DoS).
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || "16kb",

  // Timeout for the outbound call to Google Apps Script.
  googleTimeoutMs: Number(process.env.GOOGLE_TIMEOUT_MS) || 10000,
});

/**
 * Fail fast if a production deployment is missing something it cannot run
 * without. In development we only warn, so a contributor can boot the API and
 * exercise validation/health before wiring up a database.
 */
function assertConfig() {
  const missing = [];
  if (!config.databaseUrl) missing.push("DATABASE_URL");
  if (!config.googleScriptUrl) missing.push("GOOGLE_SCRIPT_URL");

  if (missing.length) {
    const msg = `Missing required environment variables: ${missing.join(", ")}`;
    if (config.isProd) throw new Error(msg);
    // eslint-disable-next-line no-console
    console.warn(`[config] ${msg} — running in ${config.nodeEnv} with reduced functionality.`);
  }
}

module.exports = { config, assertConfig };
