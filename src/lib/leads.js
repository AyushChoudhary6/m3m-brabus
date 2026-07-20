// ============================================================
// Lead capture → Google Sheet (Apps Script web app).
// Every form on the site posts through submitLead().
// ============================================================

const ENDPOINT =
  "https://script.google.com/macros/s/AKfycby15y1STKpEpp6FoRC21qLwDi7NLinkjZ1yqEXQJFKHjvXHNwKNYvAMSsLD4BKZsf9NAg/exec";

/**
 * Send a lead to the sheet.
 *
 * The Apps Script reads JSON via `JSON.parse(e.postData.contents)`, so the body
 * must be a JSON string. We deliberately send it with `Content-Type:
 * text/plain` — that is a CORS-safelisted type, so the browser makes a "simple"
 * request and skips the preflight `OPTIONS` that Apps Script cannot answer.
 * (`application/json` would trigger a preflight and fail.)
 *
 * Apps Script answers with a 302 to script.googleusercontent.com; both hops
 * send `Access-Control-Allow-Origin: *`, so we can read the real response and
 * report genuine success/failure rather than guessing.
 *
 * @param {{name?:string, phone?:string, email?:string, config?:string,
 *          message?:string, source?:string}} data
 * @returns {Promise<object>} the script's parsed response
 */
export async function submitLead(data = {}) {
  const name = data.name || "";
  const phone = data.phone || "";
  const email = data.email || "";
  const config = data.config || "";
  const now = new Date().toISOString();

  // The sheet's columns are Fullname / Phone / Email / Configuration / Timestamp.
  // We don't control the Apps Script, so each value is sent under every likely
  // key spelling — extra keys are simply ignored by the script.
  const payload = {
    name,
    fullname: name,
    fullName: name,
    Fullname: name,
    phone,
    Phone: phone,
    email,
    Email: email,
    config,
    configuration: config,
    Configuration: config,
    message: data.message || "",
    source: data.source || "",
    page: typeof window !== "undefined" ? window.location.pathname : "",
    submittedAt: now,
    timestamp: now,
    Timestamp: now,
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  const out = await res.json().catch(() => null);
  if (!out || out.success !== true) {
    throw new Error((out && out.error) || "Submission failed");
  }
  return out;
}

/** Marks the visitor as an existing lead so the timed invite stops nagging. */
export function markLeadCaptured() {
  try {
    localStorage.setItem("mb-lead", "1");
  } catch {
    /* private mode — ignore */
  }
}
