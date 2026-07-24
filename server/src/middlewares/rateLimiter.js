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
  // Key on Express's proxy-vetted req.ip, NOT req.clientIp. req.clientIp comes
  // straight from the first X-Forwarded-For token, which any client can spoof —
  // a bot could rotate that header to dodge the throttle. With trust proxy=1,
  // req.ip is the last-hop-verified client IP and cannot be forged that way.
  keyGenerator: (req) => req.ip || req.clientIp,
  handler: (req, res) =>
    fail(res, {
      status: 429,
      code: "rate_limited",
      message: "Too many requests. Please wait a moment and try again.",
    }),
});

module.exports = { leadRateLimiter };
