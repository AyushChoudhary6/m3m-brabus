// ============================================================
// requestContext — attaches a per-request id, the client IP, and a start time.
// Every log line for a request can then be correlated, and the leads controller
// records the IP and processing time as the spec requires.
// ============================================================
"use strict";

const { randomUUID } = require("crypto");

module.exports = function requestContext(req, res, next) {
  req.id = req.headers["x-request-id"] || randomUUID();
  req.startTime = process.hrtime.bigint();

  // Behind a proxy (Vercel/Render/Nginx) the real client IP is the first hop in
  // X-Forwarded-For. `app.set('trust proxy', ...)` makes req.ip honour it too.
  req.clientIp =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    "unknown";

  res.setHeader("X-Request-Id", req.id);
  next();
};
