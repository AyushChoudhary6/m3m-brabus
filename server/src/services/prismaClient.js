// ============================================================
// Prisma client singleton.
//
// One PrismaClient per process (a new one per request would exhaust the Neon
// connection pool). Instantiation is lazy and never connects on its own — the
// first query opens the pooled connection — so the API can boot and serve
// /health even before a database is reachable.
// ============================================================
"use strict";

const { config } = require("../config/env");
const { logger } = require("../config/logger");

let prisma = null;

/** Returns the shared PrismaClient, creating it on first use. */
function getPrisma() {
  if (prisma) return prisma;

  // Required lazily so the process can still start if the client has not been
  // generated yet (`prisma generate`) — the repository surfaces a clear error.
  // eslint-disable-next-line global-require
  const { PrismaClient } = require("@prisma/client");

  prisma = new PrismaClient({
    log: config.isProd ? ["warn", "error"] : ["warn", "error"],
    datasources: config.databaseUrl ? { db: { url: config.databaseUrl } } : undefined,
  });

  return prisma;
}

/** Graceful shutdown hook — closes the pool so Neon connections are released. */
async function disconnectPrisma() {
  if (!prisma) return;
  try {
    await prisma.$disconnect();
    logger.info("Prisma disconnected");
  } catch (err) {
    logger.warn("Prisma disconnect failed", { error: err.message });
  }
}

module.exports = { getPrisma, disconnectPrisma };
