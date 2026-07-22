// ============================================================
// System controller — health and version endpoints for uptime monitors,
// load balancers and deploy checks.
// ============================================================
"use strict";

const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/response");
const { config } = require("../config/env");
const { getPrisma } = require("../services/prismaClient");

// Read once at load. package.json sits two levels up from src/controllers.
// eslint-disable-next-line global-require
const pkg = require("../../package.json");
const startedAt = Date.now();

/**
 * GET /api/health
 * Reports process liveness and a best-effort database probe. Returns 200 even
 * when the DB is unreachable (the API itself is up); the body says which
 * dependencies are healthy so a monitor can alert precisely.
 */
const health = asyncHandler(async (req, res) => {
  let database = "unknown";
  if (config.databaseUrl) {
    try {
      await getPrisma().$queryRaw`SELECT 1`;
      database = "up";
    } catch {
      database = "down";
    }
  } else {
    database = "not_configured";
  }

  return ok(res, {
    data: {
      status: "ok",
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      environment: config.nodeEnv,
      dependencies: {
        database,
        googleSheets: config.googleScriptUrl ? "configured" : "not_configured",
        leadStore: config.leadStore,
      },
      timestamp: new Date().toISOString(),
    },
  });
});

/** GET /api/version — build/version metadata. */
const version = asyncHandler(async (req, res) =>
  ok(res, {
    data: { name: pkg.name, version: pkg.version, node: process.version, environment: config.nodeEnv },
  }),
);

module.exports = { health, version };
