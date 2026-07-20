# Local setup

From a clean clone to a working development server, and then to a production
build you can trust.

---

## 1. Prerequisites

| | Version | Notes |
| --- | --- | --- |
| Node.js | 20 LTS or newer | Developed on Node 26.5. Vite 8 requires ≥ 20.19 or ≥ 22.12. |
| npm | 10 or newer | Ships with Node. |
| Google Chrome | any recent stable | **Only needed for `build:static`.** Not needed for `npm run dev`. |
| git | any | |

Nothing else is required to run the site. The image tools in §6 are optional and
only matter if you are changing the photography.

---

## 2. Clone and install

```bash
git clone https://github.com/AyushChoudhary6/m3m-brabus.git
cd m3m-brabus
npm install
```

`npm install` pulls ~30 packages. Four of them — `three`,
`@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` — are
in `package.json` but have zero imports anywhere in `src/`, so they are
tree-shaken out of every build. They cost install time and nothing else. Leave
them alone unless you are deliberately tidying the manifest, and if you do
remove them, rebuild and diff the output before committing.

---

## 3. Environment variables

None are required for development.

```bash
cp .env.example .env
```

Read the header of `.env.example` before you put anything in `.env`. The short
version: **every `VITE_`-prefixed variable is inlined into the JavaScript bundle
and readable by every visitor.** No secret may ever carry that prefix.

For local work you will normally leave `.env` empty. Setting `VITE_GA_ID` in dev
would send your own clicking around into the production analytics property,
which is rarely what you want. The `GITHUB_*` variables are only needed if you
are working on the CMS login — see the note at the end of §7.

---

## 4. Run

```bash
npm run dev
```

Vite serves on `http://localhost:5173` with hot module replacement.

### One warning about the lead form in dev

`src/lib/leads.js` posts to a hard-coded live Google Apps Script endpoint. There
is no dev/prod switch. A form submission from `localhost` therefore:

- writes a real row to the production Google Sheet, and
- emails the real sales inbox configured in `server/apps-script/Code.gs`.

If you are working on form UI and need to submit repeatedly, do one of:

1. **Block the request.** In devtools → Network, right-click the
   `script.google.com` request → *Block request domain*. The form will surface
   its network-error path, and the lead will be written to the `localStorage`
   retry queue — clear `mb-lead-queue` afterwards so it does not flush later.
2. **Point at a test deployment.** Deploy a second copy of
   `server/apps-script/Code.gs` against a scratch spreadsheet with `NOTIFY_TO`
   emptied, and temporarily change `ENDPOINT` in `src/lib/leads.js`. Do not
   commit that change.
3. **Fill the honeypot.** Type anything into the hidden `company` field via
   devtools. `spam.js` blocks the submission client-side and nothing is sent.
   Useful for testing the rejection path, useless for testing the success path.

Option 2 is the right answer if you are doing more than a few minutes of form
work.

### localStorage keys the app uses

Clearing these resets the site's memory of you, which is often what you want
while testing:

| Key | Meaning |
| --- | --- |
| `mb-lang` | chosen language (`en` / `ar`) |
| `mb-lead` | "this visitor already enquired" — suppresses the timed invite |
| `mb-lead-queue` | leads that failed to send and are awaiting retry |
| `mb-lead-recent` | recent submissions, for duplicate + rate checks |
| `mb-attr-first` / `mb-attr-last` / `mb-attr-seen` | campaign attribution and visit count |

---

## 5. Production build

```bash
npm run build:static
npm run preview            # then open the printed URL
```

`build:static` runs `vite build`, then the prerenderer, then the sitemap
generator. It prints one line per route and finishes with `✓ prerender
complete`. If any route renders under 6 kB, or ends up with anything other than
exactly one `<link rel="canonical">`, the script exits non-zero — that is a
build failure, not a warning, and the output must not be deployed.

**Do not run plain `npm run build` and deploy the result.** See the README for
why; it is the most damaging mistake available in this repository.

### Chrome

The prerenderer shells out to a real Chrome binary. It defaults to the macOS
path:

```
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
```

On anything else, set `CHROME_PATH`:

```bash
# Debian / Ubuntu
CHROME_PATH=/usr/bin/google-chrome-stable npm run build:static

# Arch
CHROME_PATH=/usr/bin/chromium npm run build:static

# No system Chrome? Fetch one:
npx @puppeteer/browsers install chrome@stable
CHROME_PATH="$PWD/chrome/mac_arm-*/chrome-*/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing" \
  npm run build:static
```

Chrome is run with `--headless=new`, `--no-sandbox`,
`--force-prefers-reduced-motion` (so scroll animations skip their "start hidden"
states and the captured HTML holds visible content) and an 8-second virtual time
budget per route.

Verifying prerender actually worked:

```bash
npm run build:static
ls dist/price/index.html            # should exist
grep -c '<link rel="canonical"' dist/price/index.html   # should print 1
wc -c dist/price/index.html         # should be tens of kB, not ~2000
```

---

## 6. Image pipeline (optional)

Only needed if you add, replace or re-crop anything in `public/renders/`.

`scripts/images.mjs` produces responsive AVIF and WebP derivatives into
`public/renders/gen/` and writes the manifest `src/lib/renders.generated.js`.
Both the derivatives and the manifest are **committed** — Vercel has no image
encoders and will never regenerate them.

### Tools

```bash
# macOS
brew install webp        # provides cwebp  → WebP
brew install libavif     # provides avifenc → AVIF

# Debian / Ubuntu
sudo apt install webp libavif-bin
```

An `ffmpeg` built with `libsvtav1` or `libaom-av1` is used as an AVIF fallback if
`avifenc` is absent. A missing encoder is reported and skipped, never fatal — a
half-generated set still works, because `Media.jsx` only advertises variants the
manifest says exist.

### Running it

```bash
node scripts/images.mjs
```

It is idempotent: an output newer than its source is left alone. It prints a
per-file size table and, at the end, the reminder to commit
`public/renders/gen/`.

Note that `public/renders/gen/*-w*.webp` and `*-w*.avif` are listed in
`.gitignore`, but the files this script actually produces are named
`<stem>-<width>.webp` (no `w` prefix) and so are **not** ignored. If you find
derivatives failing to appear in `git status`, that pattern is the first thing to
check.

---

## 7. Other things worth knowing

**Adding a page.** Three edits, all required:

1. `src/pages/YourPage.jsx` — use `src/pages/PricePage.jsx` as the canonical
   example of a finished page, including its `<Seo>` block and JSON-LD.
2. `src/App.jsx` — add the `<Route>`.
3. `scripts/routes.mjs` — add the path, priority and changefreq.

Miss step 3 and the page works in the browser but is never prerendered and never
appears in the sitemap. Nothing will tell you.

**Adding a blog post.** Add a `.md` file with YAML frontmatter to
`src/content/blog/`, then add its slug to `BLOG_SLUGS` in `scripts/routes.mjs`.
The frontmatter fields are documented in the header of `src/lib/blog.js`.

**The hero video.** `public/BrabusIslandVilla_H264_WEB.mp4` is git-ignored — it
exceeded GitHub's 100 MB limit. The compressed 7 MB `public/hero-brabus.mp4` is
committed and is what `Hero.jsx` plays. If you clone fresh and a video appears
missing, that is why.

**Linting.** `npm run lint` runs oxlint with `react/rules-of-hooks` as an error.
There is no formatter config and no pre-commit hook; match the surrounding style
by hand.

**Tests.** There is no test runner and no unit tests. What CI does check
(`.github/workflows/`) is the built output: that every route prerendered, that no
page carries two canonicals, that no fabricated figure reached `dist/`, and that
the deployed URL answers correctly. Verify a change by building and looking at
the result — and say so plainly rather than implying coverage that does not
exist.

**The CMS at `/admin`.** `npm run dev` serves the editor, but its login calls
`/api/auth`, which Vite does not serve — those are Vercel serverless functions.
To exercise the login locally, run `npx vercel dev` instead (it serves both the
app and `api/`), add `http://localhost:3000` to `ALLOWED_CMS_ORIGINS`, and set
`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` in `.env`. Note that a CMS save
commits to the real repository — there is no local-only mode. See
[CMS-GUIDE.md](CMS-GUIDE.md).

**Design tokens.** Defined in `src/index.css`: `text-ink`, `text-ink-soft`,
`text-ink-faint`, `text-brass`, `bg-canvas`, `bg-cream`, `bg-paper`,
`border-line`, `.container-lux`, `.kicker`, `.mono`, `font-display`,
`font-serif`, `ease-lux`. Tailwind v4 is configured through that file — there is
no `tailwind.config.js` to look for.
