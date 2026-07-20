/**
 * Step 2 of the CMS login — /api/callback
 *
 * GitHub returns the editor here with ?code and ?state. We verify the state
 * against the HttpOnly cookie set by /api/auth, exchange the code for a user
 * token server-side, and hand it to the CMS window using Decap's postMessage
 * protocol (see popupPage in ./_shared.js).
 *
 * Never logged: the code, the token, or GITHUB_CLIENT_SECRET. The only thing
 * this function writes to the console is a failure category.
 */
import { timingSafeEqual } from "node:crypto";
import {
  env,
  b64url,
  COOKIE,
  selfOrigin,
  resolveOrigin,
  readCookie,
  clearCookie,
  popupPage,
  sendHtml,
} from "./_shared.js";

/** Constant-time compare that tolerates unequal lengths without leaking them. */
function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export default async function handler(req, res) {
  const self = selfOrigin(req);

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end("Method Not Allowed");
  }

  const url = new URL(req.url, self);
  const cookie = readCookie(req, COOKIE);
  clearCookie(res); // one-time use, whatever happens next

  /* Resolve the reply origin from the cookie, then re-check it against env.
     Trusting the cookie alone would let a tampered cookie choose where the
     token is posted; re-checking means the worst a tampered cookie can do
     is fail the login. */
  const [expectedState, encodedOrigin] = String(cookie || "").split(".");
  const target = resolveOrigin(req, encodedOrigin ? b64url.decode(encodedOrigin) : "") || self;

  const fail = (msg, category) => {
    console.error(`[cms-oauth] ${category}`); // category only — never the code or token
    return sendHtml(res, 400, popupPage({ target, error: msg }));
  };

  if (url.searchParams.get("error")) {
    return fail("GitHub declined the sign-in request.", `github:${url.searchParams.get("error")}`);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return fail("The sign-in link was incomplete. Try again from /admin.", "missing code/state");
  if (!expectedState) return fail("Your sign-in session expired. Try again from /admin.", "missing state cookie");
  if (!safeEqual(state, expectedState)) return fail("Sign-in could not be verified. Try again from /admin.", "state mismatch");

  if (!env.clientId || !env.clientSecret) {
    return fail("This deployment is missing its GitHub OAuth credentials.", "missing env");
  }

  try {
    const gh = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: env.clientId,
        client_secret: env.clientSecret,
        code,
        redirect_uri: env.redirectUri || `${self}/api/callback`,
      }),
    });

    const data = await gh.json();
    if (!gh.ok || data.error || !data.access_token) {
      return fail("GitHub would not issue a token for this sign-in.", `exchange:${data.error || gh.status}`);
    }

    // Exactly the shape Decap/Sveltia's github backend reads off the message.
    return sendHtml(
      res,
      200,
      popupPage({
        target,
        provider: "github",
        payload: { token: data.access_token, provider: "github" },
      }),
    );
  } catch {
    return fail("Could not reach GitHub. Try again in a moment.", "network");
  }
}
