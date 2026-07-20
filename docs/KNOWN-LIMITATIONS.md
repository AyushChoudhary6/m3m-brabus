# Known limitations

This is the honest document. Its purpose is that the owner of this site knows
exactly what has been built, what has been half-built, and what cannot be built
at all without changing the shape of the project.

Nothing below is an apology. Most of these limitations are the direct, correct
consequence of a decision that was made for good reasons — a static site on a
CDN is fast, cheap, effectively un-hackable and never goes down. But a static
site cannot do certain things, and a marketing document that implies otherwise
is worse than useless.

Verified against the code on 20 July 2026. Chapter numbers are the ones the
source files cite in their own headers.

**Legend**

| | |
| --- | --- |
| ✅ | Implemented and working. Code read and traced. |
| 🟡 | Partial. Works, with a stated caveat. |
| 🔴 | Not implemented. Code exists but is not wired, or does not exist. |
| ⛔ | **Impossible on a static host.** Requires a server. |

---

## The one paragraph that explains most of this page

The site is, with two narrow exceptions, a folder of files on Vercel's CDN. The
only code of ours that runs on a server is `server/apps-script/Code.gs` (inside
Google Apps Script, reachable as a single POST endpoint) and the two Vercel
serverless functions in `api/` that exist solely as the CMS's GitHub OAuth relay.
Neither is in the path of an ordinary page view or a lead submission.
Everything else — every validation,
every rate limit, every spam check, every "security" measure in `src/` — runs
inside the visitor's own browser and can be read, modified or skipped entirely by
anyone who opens developer tools. That is not a flaw in the implementation. It is
what "client-side" means.

So when this document says something is advisory, it means: it will stop a bot
and a mistake, and it will not stop a person who wants to bypass it.

---

## 1. Lead capture and delivery (Ch. 74)

**✅ The pipeline works.** Four form surfaces post through `submitLead()`
(`src/lib/leads.js`) to a Google Apps Script web app, which validates, rate
limits, deduplicates, writes a row to a Google Sheet, mints a reference and
emails the sales desk. Traced end to end in
[CRM-FIELD-MAPPING.md](CRM-FIELD-MAPPING.md).

**✅ Offline retry queue.** A failed send is written to `localStorage` and
retried on reconnect, on tab focus, 2.5 s after load, and on a capped
exponential backoff (15 s → 30 min, 12 attempts, 7-day expiry). A crude
cross-tab lock reduces double-posting.

**🟡 …but the durability has a hard edge.** The queue survives a flaky network,
a short Google outage, and a tab left open. It does **not** survive the visitor
closing the tab and never returning, private-browsing mode, or a cleared browser
store. There is no server of ours to hand the lead to, so a device that never
comes back takes the lead with it.
*To fix:* a serverless function that accepts the POST and owns the retry. That
makes this a hybrid deployment, not a static one.

**🟡 The cross-tab lock is best-effort.** `localStorage` offers no atomic
compare-and-swap, so two tabs can in principle flush the same entry. `leadId` is
sent so duplicates *could* be collapsed — but `Code.gs` does not read it today.
*To fix:* have `Code.gs` reject a `leadId` it has already written. Perhaps thirty
lines.

**🔴 `components/sections/LeadForm.jsx` sends nothing — and is currently dead
code.** It renders a complete form, shows a thank-you message, and never calls
`submitLead`; its handler carries `// TODO: wire to CRM / email endpoint /
WhatsApp API`. Verified: nothing in `src/` imports it, so it is not rendered on
any live route today and no leads are being lost. The risk is future: it looks
finished, and anyone who drops it onto a page will silently discard every buyer
who fills it in. Wire it or delete it.

**⛔ No server-side delivery guarantee.** If Google Apps Script is down when a
visitor submits, and that visitor never returns, the lead is lost. No queue in
the browser can change that.

---

## 2. Attribution (Ch. 75)

**✅ First-touch and last-touch capture works.** `src/lib/attribution.js` records
UTMs, `gclid`/`fbclid`/`msclkid`/`ttclid`/`li_fat_id`, partner `?ref=`, external
referrer, landing path, a coarse channel label and a visit counter. First touch
holds for 90 days (Google Ads' maximum click window), last touch for 30 (GA4's
default lookback).

**🟡 Three fields are captured, transmitted and then dropped.** `UTM Term`,
`UTM Content` and `Referrer` columns exist in the sheet and stay permanently
empty, because the client sends them only under prefixed keys
(`first_term`, `last_referrer`, …) and `Code.gs` looks for the bare names. A
three-line change to `PAYLOAD_ALIASES` in `Code.gs` fixes it. Not done.

**🟡 Attribution is per-device and per-browser.** It lives in `localStorage`. A
buyer who clicks the ad on their phone and enquires from their laptop appears as
two unrelated people, and the ad gets no credit. This is not identity
resolution and cannot be, without accounts and a server.

**⛔ No cross-device or offline attribution.** A lead who calls the number
printed on a hoarding is invisible to all of this.

---

## 3. WhatsApp (Ch. 76)

**✅ Context-aware deep links.** `src/lib/whatsapp.js` builds one `wa.me` URL per
page context, so a tap from `/floor-plan` asks for floor plans and a tap from
`/price` asks for the price list. It appends a compact campaign line
(`[google/cpc · brabus-launch]`) to the message, because nothing else survives
the hop into WhatsApp — no referrer, no cookie, no callback, and `wa.me` accepts
no parameter but `text`.

**🟡 It reads campaign data from its own local reader, not from
`attribution.js`.** The file says so in a marked integration comment: it reads
the current URL and falls back to a `mb-attr` `localStorage` key, which
`attribution.js` does not write (it uses `mb-attr-first` / `mb-attr-last`). So a
visitor who landed on an ad and then browsed three pages before tapping WhatsApp
carries **no** campaign line. Swapping `readCampaign()` for
`getAttribution()` closes the gap. One import and one function deleted.

**🔴 `PROJECT.whatsapp` is still a placeholder** (`910000000000`) in
`src/lib/site.js`, as is `PROJECT.phone` (`+91 00000 00000`). Every WhatsApp
link and every `tel:` on the site is built from these.

**⛔ No WhatsApp Business API.** Messages open the visitor's own WhatsApp client.
There is no delivery receipt, no conversation record on our side, and no way to
know a tap became a conversation. Server-side WhatsApp requires a Business API
account and a server to hold the token.

---

## 4. Spam and abuse (Ch. 78)

This is the section most likely to be misread, so it is written plainly.

**✅ Client-side screening exists** (`src/lib/spam.js`): a honeypot field, a
sub-2.5-second fill-time check, a disposable-domain list, pattern checks on the
typed values, a duplicate check and a per-browser rate cap. Only two things hard
block — a tripped honeypot and an abusive rate — because a false positive throws
away a crore-plus buyer. Everything else is tagged and sent through for a human
to triage.

**✅ Server-side enforcement exists too** (`Code.gs`): six honeypot field names,
a 12 kB body cap, a 60-key cap, full revalidation of name/phone/email, per-phone
limits (4/hour), an identical-payload fingerprint window (90 s) and a global
ceiling (120/hour) with a one-shot flood-alert email. A tripped honeypot returns
`success: true` so the bot stops retrying and never learns it was caught.

**⛔ No IP-based rate limiting. At all.** Google Apps Script never exposes the
caller's IP address — there is no header, no `e.remoteAddress`, nothing. The
global 120/hour ceiling is the nearest approximation available, and it is a blunt
one: a genuine campaign spike and a flood look the same to it.
*To fix:* put a Cloudflare Worker or a Vercel function in front of the endpoint
and rate-limit there. That is a real, well-understood piece of work, and it is
the correct answer if spam ever becomes a genuine problem.

**⛔ No CAPTCHA verification.** A CAPTCHA widget could be rendered, but its token
must be verified against the provider's API using a **secret key**. That key
cannot live in a static bundle. It could live in `Code.gs` — Apps Script can make
an outbound `UrlFetchApp` call and hold the secret in Properties Service. That is
the viable path if it is ever needed. It is not built.

**⛔ Nothing stops a determined script POSTing the Apps Script endpoint
directly.** The URL is in the JavaScript bundle, in plain sight, and must be, for
the form to work. The server-side limits above cap the damage; they do not
prevent the attempt.

**🟡 Everything in `src/lib/spam.js` is bypassable in ten seconds** with
devtools. Its own header says so. It exists to keep casual bots and fat-finger
duplicates out of the sheet, not to defend anything.

---

## 5. Security posture

The most useful thing to say here is what the *attack surface actually is*,
because it is much smaller than the checklist implies.

**⛔ No server-side sessions for visitors.** There is nothing on the public site
to log in to. No session cookie is set for a visitor, no session state exists,
no visitor session can be hijacked or fixated.

**⛔ No CSRF protection on the lead endpoint, and none possible or required.**
CSRF is an attack against an authenticated session — it tricks a logged-in
user's browser into making a state-changing request that a server honours
because the cookie rides along. The lead endpoint has no session and no
authenticated state; it accepts anonymous posts from anyone, by design, because
that is what a public enquiry form is. A CSRF token would protect nothing,
because there is no privilege for a forged request to borrow. **This is not a
gap left open. It is a category that does not apply here.**

**✅ CSRF protection where it *does* apply — the CMS login.** `api/auth.js`
mints a fresh 256-bit `state`, stores it in an `HttpOnly; Secure; SameSite=Lax`
cookie scoped to `/api`, and `api/callback.js` requires it to match on the way
back. Without it an attacker could hand an editor a pre-baked `?code=` and have
their own GitHub account authorised into the CMS. The reply origin is also
re-checked against the environment allowlist rather than against the cookie
alone, so tampering with the cookie cannot redirect the token. This is the one
place in the project with an authenticated server-side flow, and it is handled
properly.

**⛔ No SQL injection surface.** There is no SQL, no database and no query
builder anywhere in the project. Data lands in a Google Sheet through the Sheets
API. The analogous risk is **formula injection**, and that one is real — a cell
beginning `=`, `+`, `-` or `@` is evaluated by Sheets, and every Indian phone
number starts with `+`. It is handled: `safeCell_()` in `Code.gs` prefixes an
apostrophe to any such string before writing. ✅

**⛔ No IP logging, no IP blocking, no geo-blocking, no WAF.** Vercel's platform
provides some of this at the edge on paid plans; nothing is configured, and the
Apps Script endpoint sits outside Vercel entirely.

**🟡 XSS.** React escapes by default, and `dangerouslySetInnerHTML` appears in
exactly two places — `Seo.jsx` and `sections/Faq.jsx` — both emitting a JSON-LD
`<script>` from an object constructed in our own code and serialised with
`JSON.stringify`. There is no user-generated content rendered anywhere. The residual risk is low but not zero — a future blog
post is authored content, and `src/lib/cms.js` deliberately flattens inline
markup to text rather than emitting HTML, which closes that door.

**✅ Security headers are written.** `vercel.json` sets a real
Content-Security-Policy derived from what the app actually loads — no
`unsafe-inline` and no `unsafe-eval` for scripts, with `connect-src` covering
*both* `script.google.com` and `script.googleusercontent.com` because the Apps
Script endpoint 302s between them and CSP re-checks every redirect hop — plus
HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and a
COOP value chosen to let the OAuth popup work. The reasoning is written up in
`.vercelignore`, because `vercel.json` is schema-validated and permits no
comments.

**🟡 `style-src` carries `'unsafe-inline'`, knowingly.** The prerendered HTML is
a Chrome DOM dump, so every inline style React, GSAP and Leaflet wrote is baked
into the markup as a literal `style="…"` attribute. Hashes cannot cover values
that change per render, and a nonce needs a server to mint one per request. It
is much weaker than script `'unsafe-inline'` would be, but it is not free.

**🔴 Those headers may not be reaching the live site.** The production pipeline
deploys with `vercel deploy --prebuilt`, and a prebuilt deployment is configured
by `.vercel/output/config.json`, not by `vercel.json`. The generator
(`.github/workflows/scripts/make-vercel-output.mjs`) currently emits only
`routes` — no `headers`. On the evidence in the repository, a CI-deployed
production site therefore serves **none** of the policy above.
*Verify, do not assume:* `curl -sI https://<domain>/ | grep -i content-security`.
*To fix:* emit the same headers from `make-vercel-output.mjs`. See
[DEPLOYMENT.md](DEPLOYMENT.md) §1.

**✅ HTTPS everywhere.** Vercel issues and renews the certificate automatically.

**🟡 The lead endpoint URL is public.** It is compiled into the bundle. It has to
be. Anyone can find it and post to it. The mitigations are the server-side limits
in §4.

**⛔ No secret can live in the browser bundle.** Every `VITE_`-prefixed variable
is inlined into the JavaScript at build time and is readable by every visitor.
Vercel's "Sensitive" toggle hides the value in Vercel's dashboard and does
nothing about the fact that the built file contains it in plain text.

**✅ There are now exactly two places a real secret *can* live:** Apps Script
Properties Service, and `process.env` inside the `api/` serverless functions —
which is where `GITHUB_CLIENT_SECRET` correctly lives. Note that this is safe
only because those variables have **no** `VITE_` prefix. Adding one would move
the client secret out of the server and into every visitor's browser, handing
out repository write access.

---

## 6. Administration and reporting

**⛔ There is no admin dashboard.** No login, no leads UI, no charts, no
assignment, no status pipeline, no notes, no export button. The Google Sheet is
the admin interface, and the notification email is the alert.

To be concrete about what the owner does and does not have:

| Want to… | Today |
| --- | --- |
| See new leads | Email notification, or open the Sheet |
| Search or filter leads | Sheet filters |
| Mark a lead as contacted | Add a column in the Sheet yourself |
| See lead volume by source | Sheet pivot table on `Source` / `UTM Source` |
| Assign a lead to an agent | Not supported |
| Have agents log in and see only their leads | Not supported |
| Export to CSV | Sheet → File → Download |

*To change this:* the honest options are (a) a CRM with a Google Sheets connector
— cheapest by a distance, and recommended; (b) an Apps Script–hosted web app UI,
which Google will authenticate for you and which stays inside the existing
architecture; or (c) a real application with a database and accounts, which is a
different project.

**⛔ No server-side CRM authentication.** This deserves stating without hedging,
because it is the single most common way a project like this is compromised:

> Any API key placed in this site's code is published to every visitor.

Not obscured. Not minified beyond recognition. Published. A `VITE_HUBSPOT_KEY`,
a `VITE_SALESFORCE_TOKEN`, a `VITE_SHEETS_API_KEY` — each of these hands every
visitor the ability to write to, and often read from, the system it unlocks.
There is no configuration, no build flag and no obfuscation that changes this.
CRM integration must run from the Apps Script side (where a key can be held in
Properties Service) or from the CRM's own Sheets connector (where the credential
never leaves the CRM). See [CRM-FIELD-MAPPING.md](CRM-FIELD-MAPPING.md) §6.

---

## 7. Content management (Ch. 71–73)

**✅ The content layer is built and works.** Blog posts are markdown with YAML
frontmatter in `src/content/blog/*.md`. `src/lib/cms.js` parses both — a
deliberately small, closed grammar rather than a markdown library, because the
renderer accepts exactly six block shapes. Vite inlines the files at build time,
so there is no fetch and nothing for the prerenderer to wait on.

**✅ The editing UI now exists.** `public/admin/index.html` loads Sveltia CMS
(Decap-compatible), configured by `public/admin/config.yml` with three
collections: blog posts, FAQs and a single site-settings file. Authentication
goes through the OAuth relay in `api/`, so the GitHub client secret stays
server-side. Detailed usage is in [CMS-GUIDE.md](CMS-GUIDE.md).

**✅ The CMS cannot edit the facts.** There is deliberately no collection
pointing at `src/lib/site.js` or `src/lib/facts.js`. Changing a published fact
stays a code change, reviewed in a pull request. That is the right boundary and
it is worth defending.

**🔴 The OAuth relay may not be deployed.** `api/` is not packaged into
`.vercel/output/functions/` by `make-vercel-output.mjs`, and the production
pipeline deploys `--prebuilt`. On the evidence in the repository, `/api/auth`
would 404 on a CI-deployed site and **CMS login would not work at all**.
*Verify:* `curl -s -o /dev/null -w '%{http_code}' https://<domain>/api/auth`.
See [DEPLOYMENT.md](DEPLOYMENT.md) §1.

**🔴 Three placeholders in `public/admin/config.yml` must be replaced** before
login can succeed: `repo: OWNER/REPO` and
`base_url: https://REPLACE-WITH-PRODUCTION-DOMAIN`. Both are marked
`▼ OWNER ACTION` in the file.

**🟡 The CMS loads from a CDN.** `public/admin/index.html` pulls Sveltia from
`unpkg.com`. That is outside the site's own CSP `script-src`, so `/admin` depends
on the CSP either not applying to it or being widened. It also means the editor
stops working if unpkg does.

**🟡 Inline markup is flattened.** `**bold**`, `_italic_`, `` `code` `` and
`[links](…)` are reduced to their plain text, because `BlogBody.jsx` takes
strings and there is nowhere for inline markup to go. Editors should write prose,
not formatting. Stated in `cms.js`'s own header.

**🟡 Publishing is a build, not a save.** A CMS commit triggers a Vercel build,
which runs the prerenderer. Expect a couple of minutes between "publish" and
"live", not instant.

**🟡 New posts need a code change too.** Adding a `.md` file is not enough — the
slug must also be added to `BLOG_SLUGS` in `scripts/routes.mjs` or the post is
never prerendered and never appears in the sitemap. A CMS user cannot do that
from the CMS.

**🔴 Non-blog content is not editable without a developer.** Everything in
`src/lib/site.js` and `src/lib/facts.js` — navigation, amenities, residences,
FAQs, project facts — is code.

---

## 8. Analytics (Ch. 5)

**✅ GA4 is wired.** `src/lib/analytics.js` injects `gtag.js` when `VITE_GA_ID`
is set, and fires `page_view` on route change plus `generate_lead`,
`brochure_download`, `whatsapp_click`, `phone_call_click` and
`site_visit_request`. It refuses to run under headless Chrome, so the prerender
does not pollute the property. Without the ID, every call is a no-op.

**🟡 It is build-time configured.** `VITE_GA_ID` is inlined at build. Setting it
in Vercel without triggering a redeploy does nothing.

**🔴 No consent banner.** GA4 sets cookies. There is no cookie notice and no
consent gate. For an India/UAE audience this is a commercial and legal judgement
rather than a technical one (India's DPDP Act is in force and its rules bear on
this) — but it is a decision that has not been made in code, and someone should
make it deliberately.

**⛔ No server-side analytics or conversion API.** Ad-blockers will hide a real
fraction of this audience. Server-side tagging and the Meta/Google conversion
APIs both need a server.

---

## 9. Performance

**🟡 First load is heavy.** Seven JS chunks, ~1.88 MB raw / ~520 kB gzipped, plus
~123 kB CSS. The chunking in `vite.config.js` is correct and buys cache
granularity and parallel parsing — but it does **not** reduce first-load bytes,
because `src/App.jsx` imports all 30 pages eagerly, which makes every chunk a
static import of the entry.
*To fix:* `React.lazy()` on the routes in `App.jsx`. The largest single win
available in the codebase. `chunkSizeWarningLimit` is deliberately left at Vite's
default so the build keeps complaining until it is done.

**🟡 Leaflet is loaded on every page** (149 kB / 43 kB gzipped, plus 15 kB CSS)
for a map used by exactly one component, `sections/LivingMap.jsx`. It already has
its own chunk, which is the precondition for loading it lazily. It is not loaded
lazily.

**🟡 lucide-react is the largest chunk** at 632 kB raw / 156 kB gzipped across 44
importing files.

**🟡 Images are hand-generated.** `scripts/images.mjs` must be run manually and
its output committed; Vercel has no image encoders. Forget it and new photography
ships as unoptimised JPEG.

**🟡 Some imagery is placeholder stock.** `src/lib/images.js` marks the interior
and amenity shots as indicative Pexels stock pending official renders. The
exterior, arrival and lobby renders are the official M3M ones.

**✅ Fonts are self-hosted** via `@fontsource-variable`, so there is no
render-blocking request to a third-party font host.

---

## 10. Environments and testing

**⛔ There is no staging database, because there is no database.** More
importantly, and more awkwardly: **`src/lib/leads.js` hard-codes a single live
endpoint.** A Vercel preview deployment, a local `npm run dev` session and
production all post to the same Apps Script web app and therefore into the same
Google Sheet and the same sales inbox. A developer testing the form generates a
real lead and a real email.
*To fix:* read the endpoint from an environment variable (it is a URL, not a
secret, so `VITE_LEAD_ENDPOINT` is legitimate here) and deploy a second Apps
Script against a scratch spreadsheet with notifications off. A small change with
a large quality-of-life payoff. Not done. Workarounds in
[SETUP.md](SETUP.md) §4.

**✅ Preview deployments exist.** Every pull request gets a full build,
prerender and deploy, with the URL commented on the PR
(`.github/workflows/deploy.yml`). That is a real staging *site*. It just shares
the production *lead endpoint*, per the point above.

**⛔ There is no `VERCEL_ENV`-style runtime environment switch.** A static build
is baked; any environment difference must be a build-time variable and a separate
build.

**🔴 There is no test suite.** No test runner, no unit tests, no component
tests. Several things here are genuinely worth testing — `validate.js`'s phone
parsing, `cms.js`'s frontmatter grammar, `spam.js`'s screening decisions — and
none of them are.

**✅ There are, however, real CI gates**, in `.github/workflows/`:
`verify-prerender.mjs` checks the built output, `verify-no-fabrication.mjs`
enforces the facts rule against `dist/`, and the deploy workflow runs a
post-deployment smoke test against the **live URL** — six paths must return 200,
an unknown path must return 404, and three sampled pages must each have exactly
one canonical tag. That is a narrow suite, but it guards the two failure modes
that actually matter on this project: a page that silently fails to prerender,
and a fabricated figure reaching production.

**🟡 The prerenderer is itself a smoke test.** It fails the build if any route
renders under 6 kB or emits anything other than exactly one canonical tag —
which catches a component that throws on mount, the failure mode most likely to
reach production unnoticed.

**🟡 The QA approval gate is declared but not active.** The production job
declares `environment: production`; that only becomes a gate once a human
configures required reviewers on that environment in repository settings. Until
then merges deploy straight through. The workflow says so itself and cannot
enforce it alone.

---

## 11. Reliability and operations (Ch. 87)

**🔴 The maintenance page is not wired.** `src/pages/MaintenancePage.jsx` is
written and complete, but nothing imports it. Its own header gives the two lines
to add to `App.jsx`.

**⛔ …and when wired, it cannot return HTTP 503.** Vercel serves it as 200. It
carries `noindex`, which is the only signal available, and leaving it up for more
than a short window risks de-indexing. It is a switch the owner throws, not a
health check — it cannot detect an outage by itself, and turning it on or off
requires a redeploy because the flag is read at build time.

**🔴 No uptime monitoring, no error reporting.** `src/components/ui/ErrorBoundary.jsx`
exists but is **not wired into `App.jsx` or `main.jsx`** — so a render error in a
page component currently takes the whole site to a blank screen with no recovery
UI and no report. Wiring it is a two-line change and should be done. Even wired,
it logs to the console only; there is no Sentry equivalent.

**⛔ No server logs.** Vercel's static file access logs exist on paid plans;
there is nothing application-level to log because nothing of ours runs. The
`_Log` tab in the Google Sheet is the only application log in the system, and it
covers the lead endpoint alone.

**✅ 404s are handled correctly, and it took deliberate work.** The build-output
config in `make-vercel-output.mjs` serves the SPA shell for unknown paths but
with an explicit `status: 404`, so a missing page is a real 404 rather than a
soft-404 at 200. `vercel.json`'s fallback rewrite is likewise scoped to
extensionless paths only, so a missing image returns an honest 404 instead of
HTML. The deploy workflow asserts this against the live URL.

**🔴 …but `src/pages/NotFound.jsx` is not routed.** `App.jsx` renders
`Placeholder title="Page"` for `*`. So the status code is right and the page a
visitor sees is a stub. One line in `App.jsx`.

**✅ Rollback is genuinely instant.** Vercel keeps every deployment and promoting
an old one is a pointer change. Note that it does not roll back the Apps Script
deployment, which is versioned separately inside Google.

---

## 12. Accessibility, i18n and legal

**🟡 English and Arabic are supported** (`src/lib/i18n.jsx`,
`src/lib/translations.js`) with RTL handling, but only the UI chrome and form
strings are translated. Page prose, blog posts and `src/lib/site.js` content are
English only. There is no `hreflang` and no separate Arabic URL, so the Arabic
version is invisible to search.

**🟡 The site leans heavily on scroll animation.** `prefers-reduced-motion` is
honoured during prerender (that is how the static HTML captures visible content),
but a systematic audit of reduced-motion behaviour in the live app has not been
done. Neither has a screen-reader pass, a keyboard-navigation pass or a colour-
contrast audit. No WCAG claim should be made on this site's behalf.

**🔴 No cookie consent mechanism**, as noted in §8.

**🟡 Privacy policy and disclaimer pages exist** and should be read by whoever is
legally operating the site before launch. They describe a data flow — form to
Google Sheet — that the code does implement, which is more than many such pages
manage, but they are not legal advice and were not written by a lawyer.

---

## 13. Placeholders that must be replaced before launch

Not limitations so much as unfinished configuration, gathered here so they are
not missed. The full checklist is in [DEPLOYMENT.md](DEPLOYMENT.md) §6.

| Where | What | Current value |
| --- | --- | --- |
| `src/lib/site.js` | `PROJECT.phone` | `+91 00000 00000` |
| `src/lib/site.js` | `PROJECT.whatsapp` | `910000000000` |
| `src/lib/site.js` | `PROJECT.email` | `sales@m3m-brabus.com` — confirm it exists |
| `src/components/ui/Seo.jsx` | `SITE_URL` | `https://m3m-brabus.com`, marked `// TODO: set the live domain` |
| `server/apps-script/Code.gs` | `CONFIG.NOTIFY_TO` | `wcrdevelopmentteam@gmail.com` — a developer address, not a sales desk |
| `public/admin/config.yml` | `backend.repo` | `OWNER/REPO` — marked `▼ OWNER ACTION`; CMS login fails until set |
| `public/admin/config.yml` | `backend.base_url` | `https://REPLACE-WITH-PRODUCTION-DOMAIN` — same |
| `src/lib/images.js` | interior/amenity photography | indicative Pexels stock |

---

## 14. If you change one thing

In rough order of value for effort:

1. **Carry `vercel.json`'s headers and the `api/` functions into
   `.vercel/output/`.** Without it the production site has no security headers
   and no working CMS login, while both are fully written in the repository.
   This is the highest-value item on the page because the work is already done
   and simply is not reaching the deployment. **Verify first** — one `curl -I`
   settles it.
2. **Replace the phone and WhatsApp placeholders** in `src/lib/site.js`, and the
   two `OWNER ACTION` placeholders in `public/admin/config.yml`. Every `tel:`,
   every `wa.me` link and the entire CMS login are currently pointed at nothing.
3. **Wire `ErrorBoundary` into `App.jsx`.** Two lines. Currently one thrown
   render takes the whole site to a blank page.
4. **Resolve `LeadForm.jsx`.** Wire it or delete it, before someone drops a
   finished-looking form that sends nothing onto a live page.
5. **Move the lead endpoint to an environment variable** and stand up a test
   Apps Script deployment, so nobody has to be careful in dev again.
6. **Route `NotFound.jsx`** in place of `Placeholder` for `*`. One line.
7. **Turn on required reviewers** for the `production` GitHub environment, so
   the declared QA gate becomes a real one.
8. **`React.lazy()` the routes in `App.jsx`.** The largest performance win
   available.
9. **Fix the three dropped attribution fields** in `Code.gs`'s
   `PAYLOAD_ALIASES`. Three lines, and the campaign reporting gets noticeably
   better.

Items 2–7 are each well under an hour. None of them requires changing the
architecture. Everything marked ⛔ above does.
