// ============================================================
// Structured logger.
//
// A tiny zero-dependency JSON logger. Every line is a single JSON object so it
// is greppable and ingestible by any log platform (Datadog, Logtail, CloudWatch)
// without a parser. In development it prints a compact human-readable line.
// ============================================================
"use strict";

const { config } = require("./env");

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const activeLevel = LEVELS[process.env.LOG_LEVEL] ?? (config.isProd ? LEVELS.info : LEVELS.debug);

function emit(level, message, meta) {
  if (LEVELS[level] > activeLevel) return;

  const record = { ts: new Date().toISOString(), level, message, ...meta };

  if (config.isProd) {
    process.stdout.write(`${JSON.stringify(record)}\n`);
    return;
  }
  // Dev: readable one-liner, meta appended compactly.
  const rest = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  // eslint-disable-next-line no-console
  console.log(`${record.ts} ${level.toUpperCase().padEnd(5)} ${message}${rest}`);
}

const logger = {
  error: (message, meta = {}) => emit("error", message, meta),
  warn: (message, meta = {}) => emit("warn", message, meta),
  info: (message, meta = {}) => emit("info", message, meta),
  debug: (message, meta = {}) => emit("debug", message, meta),
};

module.exports = { logger };
