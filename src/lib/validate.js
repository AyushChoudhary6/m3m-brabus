// ============================================================
// Shared lead-form validation. Used by every form on the site so
// the rules (and the wording) stay identical everywhere.
// ============================================================

/** Strip characters that can never be valid for a field, as the user types. */
export function sanitizeField(key, value = "") {
  if (key === "name") return value.replace(/[0-9_]/g, "").slice(0, 60);
  if (key === "phone") return value.replace(/[^\d+\s-]/g, "").slice(0, 16);
  if (key === "email") return value.replace(/\s/g, "").slice(0, 80);
  if (key === "message") return value.slice(0, 600);
  return value;
}

/**
 * Work out the country + local part of a typed number.
 * Supports India (+91, 10 digits starting 6-9) and the UAE / Dubai
 * (+971, 9 digits starting 5). Tolerates spaces, dashes, 00 and a leading 0.
 * @returns {{country: "IN"|"AE"|null, local: string}}
 */
export function parsePhone(value = "") {
  let d = String(value).replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2); // 0091… / 00971…

  // explicit country codes first
  if (d.startsWith("971")) return { country: "AE", local: d.slice(3).replace(/^0/, "") };
  if (d.startsWith("91") && d.length > 10) return { country: "IN", local: d.slice(2) };

  if (d.startsWith("0")) d = d.slice(1); // local trunk prefix (05x… / 0xxxxx)

  // otherwise infer from the shape
  if (/^5\d{8}$/.test(d)) return { country: "AE", local: d };
  if (/^[6-9]\d{9}$/.test(d)) return { country: "IN", local: d };
  return { country: null, local: d };
}

/** Back-compat helper: the local part of the number. */
export function localPhone(value = "") {
  return parsePhone(value).local;
}

/**
 * @returns {string} a translation KEY for the error, or "" when acceptable.
 * Components render it with t() so messages follow the chosen language.
 */
export function validateField(key, value = "", { requireEmail = false } = {}) {
  const v = String(value).trim();

  if (key === "name") {
    if (!v) return "err.nameRequired";
    if (v.length < 2) return "err.nameShort";
    // letters from any script (so Arabic names pass), plus . ' - and spaces
    if (/[\d_]/.test(v) || !/^\p{L}[\p{L}\p{M}\s.'’-]*$/u.test(v)) return "err.nameLetters";
    return "";
  }

  if (key === "phone") {
    if (!v) return "err.phoneRequired";
    const { country, local } = parsePhone(v);
    if (country === "IN") return /^[6-9]\d{9}$/.test(local) ? "" : "err.phoneIN";
    if (country === "AE") return /^5\d{8}$/.test(local) ? "" : "err.phoneAE";
    return "err.phoneEither";
  }

  if (key === "email") {
    if (!v) return requireEmail ? "err.emailRequired" : "";
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v)) return "err.emailInvalid";
    return "";
  }

  return "";
}

/** Validate a whole lead form. @returns {{[k:string]: string}} errors by field. */
export function validateLead(form = {}, opts = {}) {
  const errors = {};
  ["name", "phone", "email"].forEach((k) => {
    const msg = validateField(k, form[k], opts);
    if (msg) errors[k] = msg;
  });
  return errors;
}

/** True when the errors object has no messages. */
export function isClean(errors = {}) {
  return !Object.values(errors).some(Boolean);
}
