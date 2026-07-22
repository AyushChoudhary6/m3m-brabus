// ============================================================
// Lead validation (server-side).
//
// The frontend already validates, but the server must never trust the client —
// anyone can POST to /api/leads directly. These rules mirror src/lib/validate.js
// so a lead the UI accepts is accepted here, and a hand-crafted junk request is
// rejected with a clear, per-field message.
// ============================================================
"use strict";

const { body, validationResult } = require("express-validator");
const { fail } = require("../utils/response");

// Name: starts with a letter (any script — Arabic passes), letters/marks/space
// and a few punctuation marks only, 2–120 chars.
const NAME_RE = /^\p{L}[\p{L}\p{M}\s.'’-]{1,119}$/u;

// RFC-shaped email, label-by-label (rejects .. , leading/trailing dots, bad TLD).
const EMAIL_RE =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

/**
 * Normalise a typed phone number to { country, local } for India (+91) and the
 * UAE / Dubai (+971). Tolerates spaces, dashes, parentheses, a leading 0 and a
 * 00 international prefix. Mirrors parsePhone() in the frontend.
 */
function parsePhone(value = "") {
  let d = String(value).replace(/[\s()-]/g, "");
  if (d.startsWith("00")) d = `+${d.slice(2)}`;

  if (d.startsWith("+91")) return { country: "IN", local: d.slice(3) };
  if (d.startsWith("+971")) return { country: "AE", local: d.slice(4).replace(/^0/, "") };
  if (d.startsWith("+")) return { country: "OTHER", local: d.slice(1) };

  d = d.replace(/^0/, "");
  if (/^5\d{8}$/.test(d)) return { country: "AE", local: d }; // 9-digit UAE mobile
  if (/^[6-9]\d{9}$/.test(d)) return { country: "IN", local: d }; // 10-digit Indian mobile
  return { country: "IN", local: d };
}

/** True when a phone number is a valid Indian or UAE mobile. */
function isValidPhone(value) {
  const { country, local } = parsePhone(value);
  if (country === "IN") return /^[6-9]\d{9}$/.test(local);
  if (country === "AE") return /^5\d{8}$/.test(local);
  return false;
}

/**
 * The validation chain for POST /api/leads.
 * Unknown extra fields (attribution, spam signals, aliases the frontend sends)
 * are ignored — only these are validated.
 */
const leadRules = [
  body("name")
    .exists({ checkFalsy: true }).withMessage("Name is required").bail()
    .isString()
    .trim()
    .matches(NAME_RE).withMessage("Please enter a valid full name"),

  body("phone")
    .exists({ checkFalsy: true }).withMessage("Phone number is required").bail()
    .isString()
    .custom((v) => isValidPhone(v))
    .withMessage("Enter a valid India (+91) or UAE (+971) mobile number"),

  // Email is optional on the site's forms; validate only when present.
  body("email")
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .custom((v) => EMAIL_RE.test(v) && v.length <= 160)
    .withMessage("Enter a valid email address"),

  // Budget is optional and free-form on the site; cap it and reject obvious junk.
  body("budget")
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 80 }).withMessage("Budget is too long"),

  body("message").optional({ checkFalsy: true }).isString().isLength({ max: 600 }),
  body("project").optional({ checkFalsy: true }).isString().isLength({ max: 160 }),
  body("config").optional({ checkFalsy: true }).isString().isLength({ max: 160 }),
  body("source").optional({ checkFalsy: true }).isString().isLength({ max: 60 }),
];

/** Turns express-validator failures into a single 422 with a field map. */
function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = {};
  for (const e of result.array()) {
    if (!details[e.path]) details[e.path] = e.msg;
  }
  return fail(res, {
    status: 422,
    code: "validation_failed",
    message: "Some fields need attention.",
    details,
  });
}

module.exports = { leadRules, handleValidation, isValidPhone, parsePhone };
