// ============================================================
// Lead routes — POST /api/leads
// Pipeline: rate limit → validate → sanitize (handled in the service) → controller.
// ============================================================
"use strict";

const express = require("express");
const { leadRateLimiter } = require("../middlewares/rateLimiter");
const { leadRules, handleValidation } = require("../validators/lead.validator");
const { createLead } = require("../controllers/lead.controller");

const router = express.Router();

router.post("/", leadRateLimiter, leadRules, handleValidation, createLead);

module.exports = router;
