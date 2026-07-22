// ============================================================
// asyncHandler — wraps an async route handler so a rejected promise is passed
// to Express's error pipeline instead of crashing the process with an
// unhandledRejection. Every controller is wrapped with this.
// ============================================================
"use strict";

module.exports = function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
