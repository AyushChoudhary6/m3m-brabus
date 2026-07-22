// ============================================================
// System routes — GET /api/health, GET /api/version
// ============================================================
"use strict";

const express = require("express");
const { health, version } = require("../controllers/system.controller");

const router = express.Router();

router.get("/health", health);
router.get("/version", version);

module.exports = router;
