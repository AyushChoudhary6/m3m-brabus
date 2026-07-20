import { randomBytes } from "node:crypto";

/**
 * Shared helpers for the two OAuth relay functions.
 *
 * These are the only server-side code in the project. Everything else is a
 * static SPA on a CDN, so this file stays dependency-free and small on
 * purpose: fetch, node:crypto and nothing else. Node 18+ supplies both.
 */

/** The GitHub App credentials and policy, all from env. Never hard-coded. */
export const env = {
  clientId: process.env.GITHUB_CLIENT_ID || "",
  clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  /**
   * "repo" for a private repository, "public_repo" for a public one.
   * Default to the narrower of the two that still works everywhere the
   * repo might be private — an over-broad default is how a marketing
   * site ends up handing out write access to everything an editor owns.
   */
  scope: process.env.GITHUB_OAUTH_SCOPE || "repo",
  /** Extra origins allowed to receive the token, e.g. a local dev server. */
  extraOrigins: (process.env.ALLOWED_CMS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  /** Override when the deployment host is not the registered callback host. */
  redirectUri: process.env.OAUTH_REDIRECT_URI || "",
};

export const COOKIE = "cms_oauth";

/** Origin of this deployment, from the proxy headers Vercel sets. */
export function selfOrigin(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}

/**
 * The single origin we are willing to postMessage a token to.
 *
 * Defaults to this deployment, because /admin is served from it. A caller
 * may ask for a different one only if it is on the ALLOWED_CMS_ORIGINS
 * list. This is re-checked in the callback against env, not against the
 * cookie alone, so tampering with the cookie cannot redirect the token.
 */
export function resolveOrigin(req, requested) {
  const self = selfOrigin(req);
  if (!requested || requested === self) return self;
  return env.extraOrigins.includes(requested) ? requested : null;
}

export const b64url = {
  encode: (s) => Buffer.from(s, "utf8").toString("base64url"),
  decode: (s) => Buffer.from(s, "base64url").toString("utf8"),
};

/** Read one cookie without pulling in a parser. */
export function readCookie(req, name) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

export const setCookie = (res, value, maxAge) =>
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=${encodeURIComponent(value)}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
  );

export const clearCookie = (res) =>
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);

const escapeJs = (s) => JSON.stringify(String(s)).slice(1, -1);

/**
 * The page the OAuth popup lands on.
 *
 * The message format is Decap's, and it is not negotiable — Sveltia
 * implements the same protocol, and a near-miss produces a login that
 * spins forever with nothing in the console. The handshake is:
 *
 *   1. popup  -> opener : "authorizing:github"
 *   2. opener -> popup  : "authorizing:github"          (acknowledgement)
 *   3. popup  -> opener : "authorization:github:success:{json}"
 *
 * Step 1 is what makes the opener attach its authorize listener; sending
 * the payload without it is the classic silent hang. We only reply on
 * step 2, and only to `target`, so the token is never broadcast to "*"
 * and never sent to a window we did not expect to be talking to.
 */
export function popupPage({ target, provider = "github", payload, error }) {
  const kind = error ? "error" : "success";
  const body = error ? JSON.stringify({ message: String(error) }) : JSON.stringify(payload);
  // Per-response nonce so this page needs no 'unsafe-inline'. The script
  // content varies with the token, so a CSP hash could not be pinned.
  const nonce = randomBytes(16).toString("base64");
  /* `provider` is interpolated into the page as bare JS, not as a string
     literal, so it is restricted to the shape a backend name can have. No
     caller passes a request value today — but the callers are two files away,
     and "nobody passes it yet" is not a property this line should depend on. */
  const backend = /^[a-z0-9-]{1,32}$/i.test(String(provider)) ? String(provider) : "github";

  return { nonce, html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Signing in…</title>
<style nonce="${nonce}">body{margin:0;display:grid;place-items:center;min-height:100vh;background:#0d0b0a;color:#c9c3bb;
font:400 14px/1.6 ui-sans-serif,system-ui,sans-serif;letter-spacing:.02em}</style></head>
<body><p>${error ? "Sign-in failed. You may close this window." : "Signed in. Returning to the editor…"}</p>
<script nonce="${nonce}">
(function () {
  var target = "${escapeJs(target)}";
  var message = "authorization:${backend}:${kind}:" + ${JSON.stringify(body)};
  var opener = window.opener;
  if (!opener) { document.body.textContent = "Open the editor at /admin and sign in from there."; return; }

  function onAck(e) {
    if (e.origin !== target) return;                       // only our editor
    if (e.data !== "authorizing:${backend}") return;       // only the ack
    window.removeEventListener("message", onAck, false);
    opener.postMessage(message, target);
    setTimeout(function () { window.close(); }, 400);
  }

  window.addEventListener("message", onAck, false);
  opener.postMessage("authorizing:${backend}", target);
})();
</script></body></html>` };
}

/**
 * Send a popup page with headers appropriate to an OAuth popup.
 *
 * Two of these are load-bearing and easy to lose:
 *
 * COOP MUST BE unsafe-none. The popup is navigated to github.com (which
 * sends no COOP) and then back here. If this response carried the site's
 * `same-origin-allow-popups`, the COOP values across that navigation would
 * differ, the browser would move the popup into a new browsing context
 * group, and `window.opener` would be null — the token would have nowhere
 * to go and the login would hang with no error. This is the standard
 * OAuth-popup exemption, not a weakening of the site's policy: this
 * response contains no application state worth isolating.
 *
 * CSP IS SET PER RESPONSE, with a nonce, because the script is inline and
 * its contents change with every login (it carries the token). A hash could
 * not be pinned, and 'unsafe-inline' would be a real weakening. Being a real
 * server, this function can mint a nonce per request — and the result is
 * stricter than the site-wide policy, not looser: default-src 'none'.
 *
 * ── HEADER OWNERSHIP: /api/* RESPONSES ARE SET HERE, NOT IN vercel.json ──
 * vercel.json used to carry a blanket `headers` rule on `/(.*)`, which
 * matched /api/auth too. That sent the site CSP (script-src 'self', which
 * refuses a nonced inline script) alongside this one — and a browser enforces
 * the INTERSECTION of every policy it receives, so the popup's script was
 * blocked and the login hung with no error. The same collision sent
 * X-Frame-Options twice, SAMEORIGIN and DENY, which some proxies resolve by
 * dropping both.
 *
 * That is now structural, not a comment asking to be careful: the site rule's
 * source is `/((?!api/|admin$|admin/).*)`, so it cannot match this path, and
 * the `/api/(.*)` rule beside it sets only Strict-Transport-Security and
 * X-Content-Type-Options — two headers this function does not set and never
 * wants to vary. Everything policy-bearing below is uncontested:
 * Content-Security-Policy, Cross-Origin-Opener-Policy, X-Frame-Options,
 * Referrer-Policy and Cache-Control reach the browser exactly as written.
 * make-vercel-output.mjs fails the build if any URL would receive a duplicate
 * header key, so the collision cannot come back unnoticed.
 */
export function sendHtml(res, status, { nonce, html }) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
  );
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.end(html);
}
