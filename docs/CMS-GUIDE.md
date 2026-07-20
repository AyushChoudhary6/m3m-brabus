# Content editor — guide

The M3M Brabus site has a content editor at **`/admin`**. It is a git-based
CMS: there is no database and no server holding your work. What you write is
committed to the project's GitHub repository as a plain text file, reviewed
like any other change, and published by the normal deploy.

This guide covers what you can change, how to log in, how a change reaches the
live site, what still needs a developer, and — at the end, plainly — what this
system deliberately does *not* provide.

---

## 1. What an editor can change

| Collection | What it controls | Live today? |
| --- | --- | --- |
| **Blog posts** | Every article at `/blogs/…` — title, meta description, category, dates, reading time, hero image, card summary, draft status and the whole body | **Yes** |
| **FAQs** | Questions and answers for `/faqs` | **No — see §6** |
| **Site settings** | Sales phone number, WhatsApp number, email address, and the two "not published" status lines for RERA and possession | **No — see §6** |

## 2. What an editor cannot change, on purpose

There is no collection for **`src/lib/site.js`** or **`src/lib/facts.js`**, and
there will not be one.

Those two files hold the line this project is built on. The official M3M
listing publishes only the location, the 4 and 5 BHK configurations, the
approximate 5,000–7,000 sq.ft range and a named amenity list. It publishes **no
price, no RERA registration number, no possession date, no land area, no tower
or floor count, no carpet area and no penthouse.** The site therefore publishes
none of those either — it says "on request" and captures an enquiry instead.

Putting a text box in front of those fields would make it a single careless
afternoon's work to publish a price nobody can stand behind, or a RERA number
that does not exist. In India that is not a typo; it is a misleading
advertisement for an unregistered project. So changing a published fact is a
code change: a developer edits the file, someone reviews the pull request, and
the reasoning is recorded. That friction is the feature.

The same reasoning applies inside the blog. Write advice and explanation. Do
not write a price, an appreciation percentage, a rental yield, a possession
date, a RERA number or a statistic you cannot point to a source for.

The **site settings** collection is the one exception, and it is narrow by
design: a phone number, a WhatsApp number, an email address, and two sentences
whose entire content is that a figure has *not* been published. Those five
carry no factual risk. The editor also refuses to save a RERA or possession
line containing a digit — a registration number is digits, and this project
does not have one to publish.

> Note that this digit check runs in the editor, in your browser. It stops the
> ordinary mistake. It is not a security control: anyone with direct write
> access to the repository can bypass it by editing the file in git. Pull
> request review is the real control.

## 3. Logging in

1. Go to `https://<the live domain>/admin`.
2. Click **Sign in with GitHub**. A small window opens.
3. Sign in to GitHub and approve the application the first time.
4. The window closes and the editor loads.

You need a GitHub account, and that account needs **write access to the site's
repository**. Ask the site owner to add you (see §8). If you have write access
and the login still fails, the deployment's OAuth settings are wrong — that is
a developer problem, not yours.

Sign-in is GitHub's. If your GitHub account has two-factor authentication, the
editor inherits it. There is no separate password for this site, and no way to
create one.

## 4. The draft → published flow

Every change moves through three states, shown as columns on the **Workflow**
screen:

**Drafts → In review → Ready**

1. **Drafts** — you are still writing. Click *Save* as often as you like.
   Nothing is on the live site.
2. **In review** — you have finished and someone should read it. Drag the card
   to this column. Behind the scenes each entry is a branch and a pull request
   in GitHub, so a reviewer can see exactly what changed, line by line.
3. **Ready** — approved. Press **Publish**. The change is merged into the
   `main` branch.

There is a second, independent switch on every blog post: the **Draft** toggle
in the entry itself. The two do different jobs:

- The **workflow column** decides whether the change has been merged at all.
- The **Draft toggle** decides whether a merged post is *visible*. A post with
  Draft on is excluded from the production build entirely — it is not on the
  blog index, it has no page, and it is not in the sitemap.

So the usual sequence for a new article is: write it with Draft on, publish it
through the workflow so it is safely in the repository, then switch Draft off
when it should go live.

## 5. How a change reaches the live site

```
You press Publish in /admin
        ↓
The change is merged into `main` on GitHub
        ↓
CI builds the site (and, on the GitHub Actions path, pre-renders
every route to static HTML through headless Chrome)
        ↓
The new build is deployed to Vercel and replaces the old one
        ↓
Live — usually a couple of minutes
```

Nothing is live the instant you press Save. The site is static files on a CDN;
a change only exists once the site has been rebuilt. If your edit is not
showing after five minutes, the build probably failed — send the owner a note
rather than pressing Publish again.

### One thing to know about new blog posts

A **new** article needs a developer before it is fully live.

Existing posts are fine — edit away. But the list of pages to pre-render and
put in the sitemap lives in `scripts/routes.mjs`, which the CMS deliberately
cannot write to. A new post will appear on `/blogs` and will work when clicked,
but until a developer adds its slug there it will not have a pre-rendered HTML
page and will not be in `sitemap.xml` — which means search engines are unlikely
to find it. Tell the developer the slug when you publish a new piece.

*(Developer note: this is a five-line fix — replace the hard-coded `BLOG_SLUGS`
array in `scripts/routes.mjs` with a `readdir` of `src/content/blog/*.md`,
filtering out files whose frontmatter has `draft: true`.)*

### The slug is a URL. Do not rename it.

A post's filename is its web address. `branded-residences-explained.md` is
`…/blogs/branded-residences-explained`. Renaming an entry after publication
breaks a live link, drops whatever search ranking it had accumulated, and
produces a 404 for anyone who bookmarked or shared it. Change the title freely;
leave the slug alone.

## 6. What is wired but not yet switched on

Two collections exist in the editor and write real files, but the pages that
display the same information have not yet been pointed at them:

- **FAQs** — `/faqs` still renders a list written directly in
  `src/pages/FaqsPage.jsx`. Entries created in the CMS are saved to
  `src/content/faqs/` and loaded by `FAQS` in `src/lib/cms.js`, but nothing
  renders them yet. The existing questions have also not been migrated.
- **Site settings** — contact details still come from `PROJECT` in
  `src/lib/site.js`. The CMS writes `src/content/settings/contact.md`, loaded
  as `CMS_SETTINGS` in `src/lib/cms.js`, and nothing reads it yet.

Until a developer switches those two consumers over, **editing them changes a
file and changes nothing on the site.** This is stated here rather than left to
be discovered.

## 7. What still requires a developer

- Any published fact: price, RERA, possession, land area, towers, floors,
  carpet area, unit types.
- Adding a new blog **category** — the filter row on `/blogs` reads a fixed
  list in `src/lib/blog.js`.
- Registering a new blog post for pre-rendering and the sitemap (§5).
- Any page that is not the blog: `/overview`, `/price`, `/amenities`,
  `/location`, `/floor-plan` and the rest are React components.
- Navigation, footer links, page layout, typography, colours.
- The enquiry form and where leads go.
- Wiring up FAQs and site settings (§6).
- Anything about how the site is deployed.

## 8. Owner setup — one-time

These steps must be done by whoever owns the GitHub repository and the Vercel
project. Nothing in `/admin` works until they are.

**a. Create a GitHub OAuth App**
GitHub → *Settings* → *Developer settings* → *OAuth Apps* → *New OAuth App*.

- Application name: `M3M Brabus CMS`
- Homepage URL: `https://<the live domain>`
- Authorization callback URL: `https://<the live domain>/api/callback`

Generate a client secret and keep the page open for the next step. This must be
an **OAuth App**, not a GitHub App — the CMS's backend expects the OAuth flow.

**b. Set the environment variables in Vercel**
Project → *Settings* → *Environment Variables*:

| Name | Value | Required |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` | from step (a) | yes |
| `GITHUB_CLIENT_SECRET` | from step (a) — never commit this | yes |
| `GITHUB_OAUTH_SCOPE` | `repo` for a private repo, `public_repo` for a public one | no (defaults to `repo`) |
| `ALLOWED_CMS_ORIGINS` | extra origins allowed to receive a token, e.g. `http://localhost:5173` for local editing | no |
| `OAUTH_REDIRECT_URI` | only if the callback host differs from the deployment host | no |

Redeploy after setting them. Serverless functions read environment variables at
runtime, so a variable added after a build still needs a redeploy to take
effect on that deployment.

**c. Fill in `public/admin/config.yml`**
Three placeholders must be replaced before the editor can load:

- `backend.repo` → `owner/repository`
- `backend.base_url` → `https://<the live domain>`
- `site_url` → `https://<the live domain>`

**d. Make the deployment actually serve the editor — the CMS does not work
until this is done**

The repository currently contains **two** deployment paths, and they read
different configuration. Find out which one is live before changing anything.

| Path | What configures it | Does it deploy `api/`? |
| --- | --- | --- |
| Vercel Git integration (`buildCommand` in `vercel.json`) | `vercel.json` | Yes — `api/*.js` is auto-detected |
| `.github/workflows/deploy.yml` → `vercel deploy --prebuilt` | `.vercel/output/config.json`, written by `.github/workflows/scripts/make-vercel-output.mjs` | **No** |

**If the GitHub Actions path is live, the login cannot work as things stand.**
`make-vercel-output.mjs` writes only `static/` and `config.json` into the Build
Output directory. There is no `functions/` directory, so `api/auth.js` and
`api/callback.js` are never built or deployed and `/api/auth` returns 404.
`vercel.json` is not read at all in prebuilt mode, so its headers and
`cleanUrls` do not apply either — which means `/admin` also needs an explicit
route. A developer must either:

- extend `make-vercel-output.mjs` to emit
  `.vercel/output/functions/api/auth.func/` and `…/callback.func/` — each
  containing the handler, `_shared.js`, a `package.json` with
  `{"type":"module"}`, and a `.vc-config.json` of
  `{"runtime":"nodejs22.x","handler":"auth.js","launcherType":"Nodejs","shouldAddHelpers":true}`
  — plus a `{ "src": "^/admin/?$", "dest": "/admin/index.html" }` route before
  the `filesystem` handler; **or**
- deploy through Vercel's own build for these paths instead of `--prebuilt`.

**If the Git-integration path is live**, the functions deploy automatically,
but the site-wide security headers in `vercel.json` block the editor outright:
`/admin` shows a blank page and the login never completes. Three changes are
needed, all in the `headers` array:

1. **Exclude `/api/*` from the blanket `/(.*)` header rule.** The two OAuth
   functions set their own `Content-Security-Policy` (a per-request nonce) and
   their own `Cross-Origin-Opener-Policy: unsafe-none`. Both are load-bearing.
   In particular, the site-wide `same-origin-allow-popups` applied to the
   callback response makes the browser sever `window.opener` on the way back
   from github.com, and the login then hangs forever with nothing in the
   console. Change the source to something like
   `/((?!api/).*)` so configured headers never overwrite the functions'.

2. **Add a `/admin` header entry with a CSP that permits the editor.** The
   current `script-src 'self' …` blocks the CMS bundle, and `connect-src 'self'
   …` blocks the GitHub API the editor reads and writes the repository with.
   The editor needs, at minimum:

   ```
   script-src  'self' 'unsafe-inline' https://unpkg.com
   connect-src 'self' https://api.github.com https://unpkg.com
   img-src     'self' data: blob: https://*.githubusercontent.com
   font-src    'self' data: https://unpkg.com
   ```

   Scope this to `/admin` and `/admin/(.*)` only. It must not widen the policy
   on the public site, which is the part that faces visitors.

3. **Leave the rewrite alone.** `/((?!.*\.).*)` → `/index.html` is safe here:
   Vercel checks the filesystem and the functions before applying rewrites, so
   `/admin` resolves to `dist/admin/index.html` and `/api/auth` resolves to the
   function. Verify both after the first deploy rather than assuming it.

If self-hosting the CMS bundle is preferred to relaxing `script-src` for
unpkg.com — a reasonable trade — download the Sveltia bundle into
`public/admin/`, point the `<script>` tag at the local copy, and drop
`https://unpkg.com` from both directives.

**e. Pin the CMS version**
`public/admin/index.html` currently loads `@sveltia/cms@^0`, which tracks every
0.x release. Once you have confirmed a version works, pin it exactly.

**f. Grant editor access**
Add each editor as a collaborator on the GitHub repository with **Write**
permission (repository → *Settings* → *Collaborators*). Write is the minimum
that allows the editorial workflow to push branches. Removing someone's
repository access removes their CMS access immediately and completely.

## 9. What this does not give you — stated plainly

This is a git-based CMS on a static site. Several things people expect from a
"proper" admin panel are genuinely not here, and no amount of configuration
will add them without a backend:

- **No role matrix.** Permissions are exactly GitHub's repository permissions —
  Read, Write, Maintain, Admin. There is no "can edit blog but not FAQs", no
  per-collection permission, no approver role distinct from an editor role.
  Anyone with Write access can edit every collection. The only meaningful
  restriction available is GitHub's branch protection on `main`, which forces
  every change through a reviewed pull request.
- **No 2FA of its own.** Authentication is GitHub's, entirely. If you want
  two-factor on the CMS, enable it on the GitHub account, or require 2FA across
  the GitHub organisation. This site cannot enforce it and cannot check it.
- **No session timeout, no forced logout, no active-session list.** The token
  issued at login is held in the browser. There is no server keeping session
  state, so there is nothing to expire it early and no way to revoke one
  session from here. To cut off access, revoke the OAuth App authorisation in
  GitHub (*Settings* → *Applications*) or remove the person's repository
  access — both take effect immediately.
- **No leads dashboard.** Enquiries submitted on the site are appended to the
  Google Sheet behind the Apps Script endpoint in `src/lib/leads.js`. They are
  not in this CMS, they never pass through it, and there is no plan to bring
  them in — a static site has nowhere to store them and no way to protect them
  if it did. Read leads in the Sheet.
- **No audit log of its own.** There is something better: the repository's git
  history. Every change carries an author, a timestamp, a diff and a pull
  request.
- **No scheduled publishing.** There is nothing running on a clock to flip a
  post live at a chosen hour. Publish it when you want it live.
- **No media management beyond upload.** Images uploaded through the editor
  land in `public/renders/uploads/` and are committed to the repository like
  any other file. Large files bloat the repository permanently; compress before
  uploading.

## 10. Writing a blog post — the format

The body editor offers headings, paragraphs, bullet lists, numbered lists and
quotations, and nothing else. That is not a limitation of the editor; it is the
complete set of things the site's article renderer knows how to draw. **Bold,
italics, links and inline code are flattened to plain text**, which is why the
buttons are not offered.

For the highlighted "Please note" box used for caveats, insert a quotation
whose first line is exactly:

```
[!NOTE]
```

and put the caveat on the lines below it, inside the same quotation. Anything
else you type is treated as an ordinary paragraph — a mistake costs you a
paragraph's formatting, never the page.

Finally, the fields that are not the body still matter more than they look:

- **Meta description** is the sentence Google prints under the result. 140–160
  characters. Write it for a person, not a crawler.
- **Card summary** is what a reader sees on `/blogs` before deciding to click.
- **Reading time** is an honest estimate. Inflating it does nothing good.
