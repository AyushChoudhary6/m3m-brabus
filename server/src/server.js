// ============================================================
// Server bootstrap — validates config, opens the port, and shuts down cleanly.
// ============================================================
"use strict";

const app = require("./app");
const { config, assertConfig } = require("./config/env");
const { logger } = require("./config/logger");
const { disconnectPrisma } = require("./services/prismaClient");

assertConfig(); // throws in production if DATABASE_URL / GOOGLE_SCRIPT_URL are missing

const server = app.listen(config.port, () => {
  logger.info("Server listening", {
    port: config.port,
    env: config.nodeEnv,
    leadStore: config.leadStore,
  });
});

/** Close the HTTP server and the DB pool, then exit. */
async function shutdown(signal) {
  logger.info("Shutting down", { signal });
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
  // Don't hang forever if a connection refuses to close.
  setTimeout(() => process.exit(1), 10000).unref();
}

["SIGINT", "SIGTERM"].forEach((sig) => process.on(sig, () => shutdown(sig)));

// Never let an unhandled rejection/exception silently wedge the process.
process.on("unhandledRejection", (reason) =>
  logger.error("Unhandled promise rejection", { reason: String(reason) }),
);
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { error: err.message, stack: err.stack });
  shutdown("uncaughtException");
});

module.exports = server;
