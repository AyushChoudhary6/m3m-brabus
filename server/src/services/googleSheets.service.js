// ============================================================
// Google Sheets forwarder.
//
// The existing Apps Script web app is unchanged; we simply call it from the
// server now instead of the browser. It reads JSON from e.postData.contents,
// so the body is a JSON string sent as text/plain — the exact content type the
// frontend used, chosen because Apps Script cannot answer a CORS preflight and
// text/plain is preflight-exempt. (Server-to-server there is no CORS, but
// keeping the content type identical means the script needs no change at all.)
// ============================================================
"use strict";

const { config } = require("../config/env");

// Node's built-in fetch (Node 18+) is used instead of axios here on purpose:
// Apps Script answers a POST with a 302 to script.googleusercontent.com, and
// fetch follows that hop as a GET exactly like the browser does. axios (via
// follow-redirects) re-POSTs to the echo URL, which 405s / hangs — the same
// behaviour that made the browser choose text/plain in the first place.

/**
 * Build the payload the Apps Script expects. The script writes columns named
 * Fullname / Phone / Email / Configuration / Timestamp, so every value is sent
 * under each likely spelling; unknown keys are ignored by the script. Any
 * attribution / spam / alias fields the client already sent (`extra`) ride
 * along so the sheet keeps whatever columns the owner has added.
 *
 * @param {import("./repositories/lead.repository").NormalisedLead} lead
 * @param {object} [extra] raw client fields to preserve (attribution, etc.)
 */
function buildSheetPayload(lead, extra = {}) {
  const now = new Date().toISOString();
  return {
    ...extra, // keep whatever the client sent (attribution, spam signals, page…)

    // Canonical values (win over anything in `extra`) under every column spelling.
    leadId: lead.externalId || extra.leadId,
    name: lead.name,
    fullname: lead.name,
    fullName: lead.name,
    Fullname: lead.name,
    phone: lead.phone,
    Phone: lead.phone,
    email: lead.email || "",
    Email: lead.email || "",
    config: lead.project || "",
    configuration: lead.project || "",
    Configuration: lead.project || "",
    budget: lead.budget || "",
    Budget: lead.budget || "",
    message: lead.message || "",
    source: lead.source,
    Source: lead.source,
    status: lead.status,
    page: lead.page || "",
    submittedAt: now,
    timestamp: now,
    Timestamp: now,
  };
}

/**
 * Forward a lead to the Apps Script. Resolves on a confirmed write, rejects
 * otherwise — the caller (lead.service) runs this alongside the DB write and
 * never lets one failure affect the other.
 *
 * @returns {Promise<{ ok: true, status: number }>}
 */
async function forwardLead(lead, extra) {
  if (!config.googleScriptUrl) {
    const err = new Error("GOOGLE_SCRIPT_URL is not configured");
    err.code = "sheets_not_configured";
    throw err;
  }

  const payload = buildSheetPayload(lead, extra);

  // Manual timeout — fetch has no timeout option; AbortController provides it.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.googleTimeoutMs);

  let res;
  try {
    res = await fetch(config.googleScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow", // follow the 302 → googleusercontent echo, as a GET
      signal: controller.signal,
    });
  } catch (e) {
    const err = new Error(e.name === "AbortError" ? "Apps Script timed out" : e.message);
    err.code = "sheets_unreachable";
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const err = new Error(`Apps Script HTTP ${res.status}`);
    err.code = "sheets_http_error";
    throw err;
  }

  // The script returns { success: boolean }. A 200 with success:false means it
  // read the lead and refused it (e.g. its own honeypot) — surface that.
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    /* non-JSON 200 — treat as accepted below */
  }
  const accepted = data == null || data.success === true || !/"success"\s*:\s*false/.test(text);

  if (!accepted) {
    const err = new Error((data && data.error) || "Apps Script rejected the lead");
    err.code = "sheets_rejected";
    throw err;
  }

  return { ok: true, status: res.status };
}

module.exports = { forwardLead, buildSheetPayload };
