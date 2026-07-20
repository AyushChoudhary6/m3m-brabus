/**
 * Step 1 of the CMS login — /api/auth
 *
 * Decap's git-gateway is a Netlify service and does not exist on Vercel, so
 * the CMS is configured with `backend: github` and this pair of functions
 * stands in as the OAuth relay. The client secret never leaves the server;
 * the browser only ever sees the resulting user token.
 *
 * Flow: /admin opens this URL in a popup -> we redirect to GitHub with a
 * one-time `state` -> GitHub returns the user to /api/callback with that
 * state -> the callback exchanges the code and postMessages the token back.
 */
import { randomBytes } from "node:crypto";
import { env, b64url, selfOrigin, resolveOrigin, setCookie, popupPage, sendHtml } from "./_shared.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end("Method Not Allowed");
  }

  const self = selfOrigin(req);
  const url = new URL(req.url, self);

  // Which window may receive the token at the end. Defaults to this
  // deployment; anything else must be on the env allowlist.
  const target = resolveOrigin(req, url.searchParams.get("origin"));
  if (!target) {
    return sendHtml(res, 400, popupPage({ target: self, error: "Sign-in was requested from an origin this relay is not configured to trust." }));
  }

  if (!env.clientId || !env.clientSecret) {
    return sendHtml(res, 500, popupPage({ target, error: "GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET are not set on this deployment." }));
  }

  /* CSRF: a fresh 256-bit state, stored in an HttpOnly cookie and required to
     match on the way back. Without it, an attacker can hand the editor a
     pre-baked ?code= and have their own account authorised into the CMS. */
  const state = randomBytes(32).toString("base64url");
  const provider = url.searchParams.get("provider") || "github";
  setCookie(res, `${state}.${b64url.encode(target)}`, 600);

  const redirectUri = env.redirectUri || `${self}/api/callback`;

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", env.scope);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("allow_signup", "false");

  res.statusCode = 302;
  res.setHeader("Location", authorize.toString());
  res.setHeader("Cache-Control", "no-store");
  res.end(`Redirecting to GitHub (${provider})…`);
}
