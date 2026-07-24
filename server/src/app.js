// ============================================================
// Express application — middleware stack + routes + error handling.
//
// Order matters: security headers → CORS → body parsing (with a hard size
// limit) → compression → request logging → request context → routes →
// 404 → centralized error handler.
//
// app.js builds the app; server.js starts it. Keeping them separate makes the
// app importable by tests and by a serverless wrapper without opening a port.
// ============================================================
"use strict";

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");

const { config } = require("./config/env");
const { logger } = require("./config/logger");
const requestContext = require("./middlewares/requestContext");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const apiRouter = require("./routes");

const app = express();

// Real client IP behind Vercel/Render/Nginx (needed for rate limiting + logs).
app.set("trust proxy", 1);
app.disable("x-powered-by");

// 1. Security headers. This is a JSON API, so the browser features CSP normally
//    guards are irrelevant; the defaults plus HSTS/no-sniff are what matter.
app.use(helmet());

// 2. CORS — only the configured site origins may call the API from a browser.
//    config.corsOrigins is a list (CORS_ORIGIN is parsed comma-separated), so
//    several site origins can be allowed at once.
app.use(
  cors({
    origin(origin, cb) {
      // Non-browser callers (curl, server-to-server, health checks) send no Origin.
      if (!origin) return cb(null, true);
      if (config.corsOrigins.includes("*") || config.corsOrigins.includes(origin)) {
        return cb(null, true);
      }
      // Clean deny: cb(null, false) omits the ACAO header (the browser blocks
      // the request) without throwing. Passing an Error would surface as a 500
      // with no CORS header and spam the logs — a denied origin isn't an error.
      return cb(null, false);
    },
    methods: ["GET", "POST"],
    maxAge: 86400,
  }),
);

// 3. Body parsing with a hard size cap (payload-bomb / DoS defence). The site
//    posts JSON; text/plain is also parsed as JSON because the Apps-Script-era
//    frontend sends application/json now that it talks to us, but we accept
//    text/plain too for maximum compatibility.
app.use(express.json({ limit: config.jsonBodyLimit }));
app.use(express.text({ type: "text/plain", limit: config.jsonBodyLimit }));
app.use((req, _res, next) => {
  // Normalise a text/plain JSON body into req.body.
  if (typeof req.body === "string" && req.body.length) {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      req.body = {};
    }
  }
  next();
});

// 4. Response compression.
app.use(compression());

// 5. Request id + client IP + timing, then access logging correlated by id.
app.use(requestContext);
morgan.token("id", (req) => req.id);
app.use(
  morgan(
    config.isProd
      ? ':remote-addr :method :url :status :response-time ms - reqId=:id'
      : 'dev',
    { stream: { write: (line) => logger.info(line.trim()) } },
  ),
);

// 6. Routes.
app.get("/", (_req, res) => res.json({ success: true, service: "m3m-brabus-server" }));
app.use("/api", apiRouter);

// 7. 404 + centralized error handler (must be last).
app.use(notFound);
app.use(errorHandler);

module.exports = app;
