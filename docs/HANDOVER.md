# Handover

Everything the owner needs to hold, in order to run this site without the people
who built it.

The test of a completed handover is simple and worth stating: **if every
developer's access were revoked tomorrow, could the owner still deploy a change,
read the leads, and receive the enquiry emails?** Until every row below is
ticked, the answer is no.

---

## How to use this

Work down the table. For each row, confirm the account exists, confirm the owner
holds the top-level credential (not an invitation, not a shared login, not a
developer's personal account), and confirm at least one other person in the
business has recovery access. Then tick it.

**Ownership means the account is registered to a business email address the
company controls**, with billing on a company card and two-factor authentication
whose recovery codes are stored somewhere other than one person's phone. An
invited collaborator on a developer's personal account is not ownership; it is a
courtesy that ends the day that person leaves.

---

## 1. Accounts and access

| # | Account | Should be owned by | What to transfer | Notes | ☐ |
| --- | --- | --- | --- | --- | --- |
| 1 | **Domain registrar** (`m3m-brabus.com`) | The business, on a company card | Registrar login, DNS zone control, auto-renew ON, registrar transfer lock ON | The single most valuable asset here. If the domain lapses, everything else is decoration. Diarise the expiry independently of auto-renew. | ☐ |
| 2 | **GitHub** — `AyushChoudhary6/m3m-brabus` | The business (an org, not a personal account) | Transfer the repository into a company GitHub organisation; owner becomes org owner | Currently under a personal account. Repo transfer preserves history, issues and stars, and leaves a redirect. **The repository is public — see §3 before doing anything else.** | ☐ |
| 3 | **Vercel** | The business | Project transferred to a company Vercel team; owner as team owner; billing on a company card | Also capture: the exact Build Command, Output Directory, and every environment variable (see [DEPLOYMENT.md](DEPLOYMENT.md) §2–3). | ☐ |
| 4 | **Google account owning the Sheet and the Apps Script** | The business — ideally a Workspace account, not a personal Gmail | Sheet ownership transferred; Apps Script project ownership transferred; at least one other Editor | **This is where every lead lives.** A personal Gmail that someone loses access to takes the entire lead history with it. Workspace also raises the `MailApp` quota from 100 to 1,500 recipients/day. | ☐ |
| 5 | **Sales notification inbox** | The business | The address in `CONFIG.NOTIFY_TO` in `server/apps-script/Code.gs` | Currently `wcrdevelopmentteam@gmail.com` — a developer address. Must become a monitored sales inbox before launch. | ☐ |
| 6 | **Google Analytics 4** | The business | Property ownership (Admin → Account Access Management → owner role); the `G-XXXXXXXXXX` measurement ID | The ID goes into `VITE_GA_ID`. It is a public identifier, not a secret. | ☐ |
| 7 | **Google Search Console** | The business | Verified owner status on the domain property | Verify by **DNS TXT** — it survives redeploys and covers subdomains, unlike an HTML file in `public/`. | ☐ |
| 8 | **Google Business Profile** *(if one exists for the sales office)* | The business | Primary owner | Not part of this repository, but it is where a large share of local search traffic starts. | ☐ |
| 9 | **WhatsApp Business number** | The business | The SIM/number in `PROJECT.whatsapp` | Currently a placeholder. Every `wa.me` link on the site is built from it. A number tied to an individual's personal phone is a liability. | ☐ |
| 10 | **Sales phone number** | The business | The number in `PROJECT.phone` | Currently a placeholder. | ☐ |
| 11 | **Ad accounts** (Google Ads, Meta) *(if running)* | The business | Account ownership and billing | Attribution in this site reads `gclid` and `fbclid`; without owning the ad accounts the data has nowhere to be read against. | ☐ |
| 12 | **Brochure PDF source** | The business | The editable original of `public/brochure/M3M-Brabus-Brochure.pdf` | The repository holds the PDF, not the file it was exported from. | ☐ |
| 13 | **Photography and renders** | The business | Original full-resolution files, plus written confirmation of the licence for anything not shot for this project | `src/lib/images.js` marks the interior and amenity shots as indicative Pexels stock. Confirm what may be published and for how long. | ☐ |
| 14 | **GitHub OAuth App** (the CMS login) | The business — created under the same org as the repository, not a personal account | The App itself; its client ID and a freshly generated client secret | Registered at github.com → Settings → Developer settings → OAuth Apps. Callback URL must be `https://<live-domain>/api/callback`. If it lives under a developer's personal account, CMS logins stop working the day that account is closed. | ☐ |

---

## 2. Credentials and secrets

There are fewer of these than you might expect, because almost nothing here can
hold a secret. That is a feature, and it makes handover short.

| # | Item | Where it lives | Action | ☐ |
| --- | --- | --- | --- | --- |
| 15 | Apps Script **deployment URL** | Hard-coded as `ENDPOINT` in `src/lib/leads.js` | Record it. It is public by necessity — it is in the JavaScript bundle. **Never redeploy Apps Script as a *new* deployment:** that mints a new URL and silently breaks every form on the site. Use *Manage deployments → edit → new version*. | ☐ |
| 16 | `VITE_GA_ID` | Vercel environment variables | Record it. Public by design. | ☐ |
| 17 | `GITHUB_CLIENT_SECRET` | Vercel environment variables (no `VITE_` prefix) | **A genuine secret**, and the only one in the deployment. It grants repository-write tokens. Rotate it in GitHub when anyone with Vercel access leaves. | ☐ |
| 18 | `GITHUB_CLIENT_ID`, `GITHUB_OAUTH_SCOPE`, `ALLOWED_CMS_ORIGINS`, `OAUTH_REDIRECT_URI` | Vercel environment variables | Record the values. Confirm `ALLOWED_CMS_ORIGINS` is **empty** in production — every entry widens who can be handed a repository-write token. | ☐ |
| 19 | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | GitHub Actions repository secrets | `VERCEL_TOKEN` is a genuine secret with deploy rights. Rotate it when any developer leaves. Without all three, nothing can deploy. | ☐ |
| 20 | 2FA recovery codes for rows 1–14 | A password manager the business controls | Not a personal phone. Not a text file on a laptop. | ☐ |
| 21 | Confirm no secret carries a `VITE_` prefix | `.env`, Vercel dashboard | Every `VITE_` variable is compiled into the public bundle. Read the header of `.env.example`. If a real key was ever set with that prefix, **assume it is compromised and rotate it.** | ☐ |

---

## 3. Before anything else: the repository is public

`https://github.com/AyushChoudhary6/m3m-brabus` is a public repository. Decide
deliberately whether it should stay that way.

What is public in it today, and whether that is acceptable:

| Item | Assessment |
| --- | --- |
| The Apps Script endpoint URL | Unavoidable — it is in the shipped bundle too. Its protection is the server-side rate limiting, not obscurity. |
| `wcrdevelopmentteam@gmail.com` in `Code.gs` | A working email address published to scrapers. Change it to the sales inbox and consider whether it belongs in the repository at all. |
| The whole source of the site | Normal for a marketing site. No credentials, no customer data. |
| Lead data | **Not** in the repository. It is in the Google Sheet. |

If the repository is made private, `GITHUB_OAUTH_SCOPE` must be `repo` rather
than `public_repo`, or CMS editors will be unable to save. If it stays public,
prefer `public_repo` — it is the narrower grant, and an editor's token should not
carry more authority than the job needs.

---

## 4. Operational knowledge to hand over

These are the things that are not written on any dashboard and that a new
developer will otherwise learn the expensive way.

| # | Fact | ☐ |
| --- | --- | --- |
| 22 | **`npm run build` is not the production build.** `npm run build:static` is. Deploying the former silently destroys every piece of SEO work in the repository, with a green build log and no warning. This is the single most important operational fact about this project. | ☐ |
| 23 | **The build runs in GitHub Actions, not on Vercel**, because the prerender step needs a Chrome binary that Vercel's build image lacks. Vercel receives a finished artefact via `vercel deploy --prebuilt`. **Never enable Vercel's Git integration for production alongside it** — Vercel would build with `vercel.json`'s `buildCommand` (`npm run build`, no prerender) and promote an SEO-less site over the good one, silently. See [DEPLOYMENT.md](DEPLOYMENT.md) §2. | ☐ |
| 24 | Adding a page requires **three** edits: the component, the `<Route>` in `App.jsx`, and the path in `scripts/routes.mjs`. Miss the third and the page is never prerendered or listed in the sitemap, and nothing tells you. | ☐ |
| 25 | After changing anything in `public/renders/`, run `node scripts/images.mjs` and **commit its output**. Vercel has no image encoders. | ☐ |
| 26 | **The facts rule.** No price, RERA number, possession date, land area, tower or floor count, carpet area or penthouse may appear anywhere on the site. `src/lib/facts.js` is the single source of truth and marks unpublished figures as `null`. There is a CI guard (`verify-no-fabrication.mjs`), but whoever briefs future copy must be told this explicitly. | ☐ |
| 27 | **The CMS deliberately cannot edit `site.js` or `facts.js`.** Changing a published fact is a code change in a pull request, on purpose. Do not "helpfully" add a CMS collection for them. | ☐ |
| 28 | Dev, preview and production **all post to the same live lead endpoint**. Testing the form creates a real lead and a real email. See [SETUP.md](SETUP.md) §4. | ☐ |
| 29 | Rolling the site back on Vercel does **not** roll back the Apps Script deployment. They are versioned separately. | ☐ |
| 30 | The `_Log` tab in the Google Sheet is the only application log in the system. Check it when a lead is reported missing. | ☐ |
| 31 | A sheet row is a **buyer**, not a submission. Repeat enquiries from the same phone inside 30 days update the existing row and increment `Submissions`. Do not count rows and call it lead volume. | ☐ |
| 32 | Publishing from the CMS is a **build**, not a save. Expect a couple of minutes between "publish" and "live". | ☐ |

---

## 5. Documents to hand over with the accounts

| # | Document | Purpose | ☐ |
| --- | --- | --- | --- |
| 33 | [README.md](../README.md) | What this is and how to run it | ☐ |
| 34 | [docs/SETUP.md](SETUP.md) | A new developer, from clean clone to build | ☐ |
| 35 | [docs/ARCHITECTURE.md](ARCHITECTURE.md) | Why it is built this way | ☐ |
| 36 | [docs/DEPLOYMENT.md](DEPLOYMENT.md) | Shipping, DNS, rollback, pre-launch checklist | ☐ |
| 37 | [docs/CMS-GUIDE.md](CMS-GUIDE.md) | How an editor changes content | ☐ |
| 38 | [docs/CRM-FIELD-MAPPING.md](CRM-FIELD-MAPPING.md) | Every captured field and its sheet column | ☐ |
| 39 | [docs/KNOWN-LIMITATIONS.md](KNOWN-LIMITATIONS.md) | **What has actually been bought.** Do not sign off the handover without reading it. | ☐ |
| 40 | This document | The access checklist | ☐ |

---

## 6. Outstanding work at handover

Stated here so it cannot be discovered later and treated as a surprise. Detail
and effort estimates are in [KNOWN-LIMITATIONS.md](KNOWN-LIMITATIONS.md) §14.

**Verify these two first — they are the difference between a site that works and
a site that appears to.**

| # | Item | ☐ |
| --- | --- | --- |
| 41 | `curl -sI https://<domain>/ \| grep -i content-security-policy` returns the policy. A prebuilt deployment is configured by `.vercel/output/config.json`, not `vercel.json`, and the generator does not currently carry the headers across — so the site may be serving none of the security policy that is written in the repository. | ☐ |
| 42 | `curl -s -o /dev/null -w '%{http_code}' https://<domain>/api/auth` is not 404. The same generator does not package `api/` into the build output, which would leave CMS login non-functional. | ☐ |

**Then the rest.**

| # | Item | ☐ |
| --- | --- | --- |
| 43 | `public/admin/config.yml` still contains `OWNER/REPO` and `REPLACE-WITH-PRODUCTION-DOMAIN`. CMS login cannot work until both are set. | ☐ |
| 44 | Placeholder phone number, WhatsApp number, `SITE_URL` in `Seo.jsx`, and the Apps Script notification address — the table in [KNOWN-LIMITATIONS.md](KNOWN-LIMITATIONS.md) §13. | ☐ |
| 45 | `ErrorBoundary.jsx` exists but is not wired into `App.jsx`. One render error currently blanks the whole site. | ☐ |
| 46 | `components/sections/LeadForm.jsx` renders a form, shows a thank-you and **sends nothing**. Imported by nothing today, so it is harmless — but it looks finished. Wire it or remove it. | ☐ |
| 47 | `MaintenancePage.jsx` is not wired; `NotFound.jsx` is not routed (`App.jsx` renders `Placeholder` for `*`). | ☐ |
| 48 | Required reviewers are **not** configured on the `production` GitHub environment, so the declared QA approval gate does not actually gate anything. | ☐ |
| 49 | No cookie-consent mechanism, while GA4 sets cookies. A decision the business must make, not a developer. | ☐ |
| 50 | No unit or component tests. CI covers the prerendered output, the facts rule and a live smoke test — nothing else. | ☐ |
| 51 | `UTM Term`, `UTM Content` and `Referrer` columns in the sheet will always be empty until `PAYLOAD_ALIASES` in `Code.gs` is extended. | ☐ |
| 52 | `src/lib/whatsapp.js` reads campaign data from its own local reader rather than `attribution.js`, so most WhatsApp taps carry no campaign line. | ☐ |

---

## 7. Sign-off

| | |
| --- | --- |
| Handed over by | |
| Received by | |
| Date | |
| Rows 1–52 confirmed | ☐ |
| Confirmed: the receiving party has read `docs/KNOWN-LIMITATIONS.md` | ☐ |
| Confirmed: a deploy has been performed by the receiving party, without help | ☐ |
| Confirmed: a real enquiry has been submitted on production and arrived in the Sheet and the inbox | ☐ |

The last two rows are the real test. Everything else is paperwork.
