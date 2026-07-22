// ============================================================
// Rate limiting — per-IP throttle on the write endpoint, so the public leads
// API cannot be flooded (spam rows, database cost, Apps Script quota burn).
// Read/health endpoints are deliberately not limited here.
// ============================================================
"use strict";

const rateLimit = require("express-rate-limit");
const { config } = require("../config/env");
const { fail } = require("../utils/response");

const leadRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false,
  // Key by the forwarded client IP set in requestContext, not the proxy IP.
  keyGenerator: (req) => req.clientIp || req.ip,
  handler: (req, res) =>
    fail(res, {
      status: 429,
      code: "rate_limited",
      message: "Too many requests. Please wait a moment and try again.",
    }),
});

module.exports = { leadRateLimiter };
