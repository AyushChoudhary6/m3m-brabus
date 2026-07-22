// ============================================================
// API router — mounts every route group under /api.
// ============================================================
"use strict";

const express = require("express");
const leadRoutes = require("./lead.routes");
const systemRoutes = require("./system.routes");

const router = express.Router();

router.use("/leads", leadRoutes);
router.use("/", systemRoutes); // /health, /version

module.exports = router;
