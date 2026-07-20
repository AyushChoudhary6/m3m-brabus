# Deployment

Target: **Vercel**. The site is static, with two serverless functions
(`api/auth.js`, `api/callback.js`) that exist solely as the CMS's GitHub OAuth
relay. Nothing else of ours runs on a server.

Verified against the repository on 20 July 2026. Several parts of this pipeline
were built concurrently; where a claim is untested end to end it says so.

---

## 1. The constraint that shapes everything

The production build is `npm run build:static`, and the second half of that
command drives a **real headless Chrome** over all 30 routes. Vercel's build
image does not ship one.

The project's answer is: **build on GitHub Actions, deploy the finished artefact
to Vercel.** That is implemented in `.github/workflows/deploy.yml` and it is the
supported path. Do not replace it with Vercel's own Git integration without
reading §2.

### What the workflow actually does

```
pull_request      → preview deployment, URL commented on the PR
push to main      → production deployment
```

1. `npm ci`, then `browser-actions/setup-chrome@v1` for a real Chrome.
2. `vercel pull` fetches the project's environment variables, then copies
   `.vercel/.env.<target>.local` to `.env.local` — without that copy, a `VITE_*`
   variable configured in the Vercel dashboard would be silently absent from the
   bundle, because Vite performs the build, not Vercel. The build would still
   succeed, just with analytics switched off.
3. `npm run build:static` with `CHROME_PATH` and `SITE_URL` set.
4. `verify-prerender.mjs` and `verify-no-fabrication.mjs` gate the output. The
   second is the facts rule enforced in CI.
5. `make-vercel-output.mjs` packages `dist/` as a Vercel Build Output API v3
   directory with an explicit route rewrite per prerendered page, plus a
   catch-all that serves the shell with a genuine **HTTP 404** rather than a
   soft-404 at 200.
6. `vercel deploy --prebuilt`, which performs no build of its own.
7. Post-deployment smoke test against the **live URL**: six paths must return
   200, an unknown path must return 404, and `/`, `/price` and `/rera` must each
   have exactly one canonical tag.

**Required repository secrets** (Settings → Secrets and variables → Actions):
`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

**Two things the workflow cannot enforce by itself:**

- The production job declares `environment: production`, which only becomes a QA
  approval gate once a human configures required reviewers on that environment
  in repository settings. Until then it deploys straight through on merge.
- If Vercel Deployment Protection is enabled, preview URLs answer 401 to the
  unauthenticated smoke test and the step fails. Either disable protection for
  previews or add a protection-bypass token.

### Two known gaps in the prebuilt path

Both follow from the same fact: **a `--prebuilt` deployment is configured by
`.vercel/output/config.json`, not by `vercel.json`.** The generator
(`make-vercel-output.mjs`) currently emits only `routes`.

| Gap | Consequence | Status |
| --- | --- | --- |
| The `headers` block in `vercel.json` — CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, cache policy — is not carried into `.vercel/output/config.json`. | A CI-deployed production site serves **no security headers**, though a carefully written policy exists in the repository. | Verify against the live deployment before believing either way. Fixing it means teaching `make-vercel-output.mjs` to emit the same headers, or moving them into `config.json`. |
| `api/` is not packaged into `.vercel/output/functions/`. | `/api/auth` and `/api/callback` would 404 on a CI-deployed site, so **CMS login would not work**. | Same file, same fix. `vercel build` can generate the functions, or the directory can be assembled explicitly. |

Neither is a design flaw; both are the seam between two pieces built in
parallel. Test `/api/auth` and `curl -I` the production domain immediately after
the first real deploy and you will know within a minute.

---

## 2. `vercel.json`, and the trap inside it

`vercel.json` exists and is thorough — a real Content-Security-Policy derived
from what the app actually loads, HSTS, `Referrer-Policy`, `Permissions-Policy`,
and a cache ladder that makes `/assets/*` immutable for a year while HTML
revalidates every request. The reasoning for every line is written up in
`.vercelignore`, because `vercel.json` is schema-validated and permits no
comments.

**But note its build command:**

```json
"buildCommand": "npm run build"
```

That is `vite build` **without** the prerender step. It is set that way
deliberately, because Vercel cannot run the prerenderer — and it is harmless as
long as deployment goes through GitHub Actions with `--prebuilt`, which ignores
it.

It becomes actively dangerous the moment somebody enables Vercel's Git
integration "just to get preview deployments". Vercel would then build on push
using that command, produce a site with no prerendered pages, and promote it over
the CI deployment. Nothing would warn you. The build log would be green. The
homepage would look perfect. Thirty crawlable pages would quietly become one
empty shell.

**So: either GitHub Actions deploys, or Vercel does. Never both.** If you must
switch to Vercel-side builds, change `buildCommand` to install a Chromium and set
`CHROME_PATH` first:

```
npx --yes @puppeteer/browsers install chrome@stable --path /tmp/chrome \
  && CHROME_PATH=$(find /tmp/chrome -name 'chrome' -type f | head -1) npm run build:static
```

Honest assessment of that alternative: it works, it downloads ~150 MB per build,
and it breaks the day Puppeteer changes its directory layout.

### Vercel project settings

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Build Command | not used on the `--prebuilt` path |
| Output Directory | `dist` |
| Install Command | `npm ci` |
| Node.js Version | 20.x or newer |
| Git integration | **disabled for production**, if CI is deploying |

---

## 3. Environment variables

Three places hold configuration, and it matters which is which.

**Vercel → Project → Settings → Environment Variables.** `vercel pull` fetches
these into the CI build, so they reach both the bundle and the serverless
functions.

| Variable | Used by | Value | Secret? |
| --- | --- | --- | --- |
| `VITE_GA_ID` | the browser bundle | `G-XXXXXXXXXX` | No — public by design |
| `GITHUB_CLIENT_ID` | `api/*` | OAuth App client ID | No |
| `GITHUB_CLIENT_SECRET` | `api/*` | OAuth App client secret | **Yes — a real secret** |
| `GITHUB_OAUTH_SCOPE` | `api/*` | `repo`, or `public_repo` for a public repo | No |
| `ALLOWED_CMS_ORIGINS` | `api/*` | extra origins allowed to receive a token; keep empty in production | No |
| `OAUTH_REDIRECT_URI` | `api/*` | only when the deployment host differs from the registered callback host | No |

**GitHub → Settings → Secrets and variables → Actions.**

| Name | Kind | Purpose |
| --- | --- | --- |
| `VERCEL_TOKEN` | secret | deploy rights |
| `VERCEL_ORG_ID` | secret | from `vercel link` |
| `VERCEL_PROJECT_ID` | secret | from `vercel link` |
| `SITE_URL` | variable | origin written into `sitemap.xml` |

**Set inside the workflow**, not by hand: `CHROME_PATH` (from
`setup-chrome`), `PRERENDER_PORT` (default `4179`).

**Every `VITE_`-prefixed variable is inlined into the public JavaScript bundle.**
Vercel's "Sensitive" toggle protects the value in Vercel's own UI and does
nothing about the fact that the built file contains it in plain text. The
`GITHUB_*` variables above are safe **only** because they have no `VITE_` prefix
and are read by `api/_shared.js` in a serverless function, where `process.env` is
genuinely private. Prefixing `GITHUB_CLIENT_SECRET` with `VITE_` would publish
repository write access to every visitor. Read the header of `.env.example`.

Note that `SITE_URL` only affects `sitemap.xml`. The canonical and Open Graph
URLs baked into the pages come from the `SITE_URL` constant in
`src/components/ui/Seo.jsx`, which is hard-coded. If the live domain is ever
anything other than `https://m3m-brabus.com`, that constant must be edited and
the site rebuilt.

---

## 4. Domain, DNS and SSL

1. Vercel → Project → Settings → Domains → add `m3m-brabus.com` and
   `www.m3m-brabus.com`.
2. At the registrar:
   - apex `m3m-brabus.com` → `A` record to the address Vercel shows
     (currently `76.76.21.21`; take the value from the dashboard, not from
     here — it changes);
   - `www` → `CNAME` to `cname.vercel-dns.com`.
   - Or, if the registrar supports it, delegate the whole zone to Vercel's
     nameservers and let it manage both.
3. Choose one canonical host and redirect the other. `Seo.jsx` emits canonicals
   without `www`, so **make the apex canonical and 301 `www` → apex** in Vercel's
   domain settings. Getting this backwards splits ranking signals between two
   hostnames.
4. SSL is issued automatically by Vercel (Let's Encrypt) once DNS resolves,
   usually within minutes, and renews itself. Nothing to configure and nothing to
   diarise.
5. Verify the site in Google Search Console. Prefer the **DNS TXT** method — it
   covers every subdomain and survives redeploys, whereas an HTML verification
   file in `public/` can be forgotten during a rebuild.

---

## 5. Rollback

Vercel keeps every deployment. To roll back:

**Dashboard:** Project → Deployments → find the last known-good build → ⋯ →
*Promote to Production*. It is effectively instant, because it is a pointer
change against already-built immutable assets.

**CLI:**

```bash
vercel ls                      # list deployments
vercel promote <deployment-url>
```

Two things a rollback does **not** undo:

- **Leads already captured.** They are in the Google Sheet and stay there.
- **The Apps Script deployment.** `server/apps-script/Code.gs` is versioned
  separately, inside Google. Rolling the website back does not roll the lead
  endpoint back. If you change both together, roll both back together —
  Apps Script → Deploy → Manage deployments → select an earlier version.

If a rollback is triggered by the site being broken rather than merely wrong,
consider `src/pages/MaintenancePage.jsx`. Read its header comment first: it is
written but **not wired**, it is switched at build time (so it needs a redeploy
in each direction), and it cannot return HTTP 503 — Vercel will serve it as 200.
Leaving it up for more than a short window risks de-indexing.

---

## 6. Pre-launch checklist

Work through it in order. Anything unticked is a live issue, not a nicety.

### Content and facts

- [ ] `src/lib/site.js` — `PROJECT.phone` is a real number
      (currently `+91 00000 00000`).
- [ ] `src/lib/site.js` — `PROJECT.whatsapp` is a real number
      (currently `910000000000`). Every `wa.me` link on the site is built from
      this.
- [ ] `src/lib/site.js` — `PROJECT.email` resolves to a monitored inbox.
- [ ] No price, RERA number, possession date, land area, tower/floor count,
      carpet area or penthouse appears anywhere in copy. Re-verify
      `src/lib/facts.js` against the official M3M listing.
- [ ] `public/brochure/M3M-Brabus-Brochure.pdf` is the current brochure and its
      contents also obey the facts rule.
- [ ] Privacy policy and disclaimer pages read correctly for the entity actually
      operating the site.

### Build

- [ ] `npm run build:static` completes with `✓ prerender complete` and no route
      warnings.
- [ ] `dist/` contains 30 `index.html` files (one per route in
      `scripts/routes.mjs`), each tens of kB, not ~2 kB.
- [ ] `grep -c '<link rel="canonical"' dist/<route>/index.html` returns `1` for
      several sampled routes.
- [ ] `dist/sitemap.xml` exists and lists the live domain, not
      `https://m3m-brabus.com` if that is not the live domain.
- [ ] `dist/robots.txt` points `Sitemap:` at the live domain.

### SEO

- [ ] `SITE_URL` in `src/components/ui/Seo.jsx` matches the live origin
      (it carries a `// TODO: set the live domain` comment — clear it).
- [ ] Canonical host chosen and the other 301'd.
- [ ] Search Console verified; sitemap submitted.
- [ ] Every page's `<title>` and description are distinct — view-source a
      handful of prerendered files rather than trusting the components.

### Lead pipeline — test this end to end, on production, before announcing

- [ ] `server/apps-script/Code.gs` is deployed as a Web App with **Execute as:
      Me** and **Who has access: Anyone**.
- [ ] `setup()` has been run once from the Apps Script editor (it provisions the
      tabs and headers and triggers the OAuth consent screen).
- [ ] The `ENDPOINT` constant in `src/lib/leads.js` points at the current
      deployment URL. Redeploying Apps Script as a *new* deployment mints a new
      URL and silently breaks the form; use *Manage deployments → edit → new
      version* to keep the URL stable.
- [ ] `CONFIG.NOTIFY_TO` in `Code.gs` is the real sales inbox — it currently
      reads `wcrdevelopmentteam@gmail.com`.
- [ ] Submit a real enquiry from the live site. Confirm: a row appears in the
      `Leads` tab, the notification email arrives, and the UI shows the
      thank-you state.
- [ ] Repeat from a phone, and with `?utm_source=test&utm_medium=cpc` on the
      landing URL, and confirm the attribution columns populate.
- [ ] Check the `_Log` tab is empty of errors afterwards.
- [ ] Decide what to do about `components/sections/LeadForm.jsx`. It renders a
      complete form and a thank-you message but **never sends anything** — its
      submit handler carries a `// TODO: wire to CRM` comment. It is currently
      imported by nothing, so no leads are being lost; confirm that is still
      true (`grep -rn LeadForm src`) and then wire it or remove it.

### Deployment pipeline — verify against the live URL, not the build

- [ ] The GitHub Actions run for the production commit is green, including the
      post-deployment checks.
- [ ] Vercel's own Git integration is **disabled for production**, so nothing
      can deploy an unprerendered build over the CI one. See §2.
- [ ] `curl -sI https://<domain>/ | grep -i content-security-policy` returns the
      policy. If it returns nothing, the `vercel.json` headers are not reaching
      the prebuilt deployment — see §1.
- [ ] `curl -s -o /dev/null -w '%{http_code}' https://<domain>/api/auth` does not
      return 404. If it does, the OAuth functions were not packaged and CMS
      login will not work — see §1.
- [ ] `curl -s https://<domain>/price | head -c 400` shows real markup, not an
      empty `<div id="root">`.
- [ ] An unknown path returns HTTP 404, not 200.

### Analytics

- [ ] `VITE_GA_ID` set in Vercel and the build redeployed (it is inlined at
      build time — setting it without a rebuild does nothing).
- [ ] `page_view` fires on route changes and `generate_lead` fires on a real
      submission. Check GA4 Realtime.

### Performance and correctness

- [ ] Lighthouse on `/` and on one inner page from a mobile profile.
- [ ] The first-load JS is ~520 kB gzipped across 7 chunks. That is heavy. It is
      a known, documented limitation — see
      [KNOWN-LIMITATIONS.md](KNOWN-LIMITATIONS.md) — not a surprise to discover
      on launch day.
- [ ] `node scripts/images.mjs` has been run and `public/renders/gen/` is
      committed.
- [ ] Test on a real iPhone and a real mid-range Android, not just a devtools
      emulator. The site leans hard on scroll animation.

### Handover

- [ ] Every row in [HANDOVER.md](HANDOVER.md) is ticked.
