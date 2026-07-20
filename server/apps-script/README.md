# Lead endpoint — Google Apps Script

`Code.gs` is the entire server side of this project. Everything else is a static
SPA on Vercel: no Node runtime, no database, no sessions. This one file is
therefore the only place where validation, deduplication, rate limiting and
notification can actually be *enforced* rather than merely requested.

It is a drop-in replacement for the script currently behind
`src/lib/leads.js` → `ENDPOINT`. It keeps the existing sheet exactly as it is —
the `Fullname | Phone | Email | Configuration | Timestamp` columns are read by
name, never rebuilt — and appends the extra columns it needs to the right.

---

## 1. What it does

| | |
|---|---|
| **Validation** | Server-side port of `src/lib/validate.js`: name shape (any script, so Arabic names pass), Indian `+91` 10-digit starting 6–9, UAE `+971` 9-digit starting 5, RFC-shaped email. The client's copy is advisory — it can be bypassed with devtools. This one cannot. |
| **Deduplication** | Same phone inside 30 days updates the existing row: bumps `Submissions`, refreshes `Last Seen`, fills in blanks, appends the new `Source`. No second row. |
| **Spam controls** | Honeypot, replay/fingerprint window, per-phone burst cap, global ceiling, body-size and key-count limits, link-spam rejection, formula-injection neutralisation. |
| **Notification** | One e-mail per new lead / brochure request / site-visit request, with the lead details, source page, campaign info, timestamp and a link straight to the sheet row. |
| **Error logging** | A hidden `_Log` tab. If the logging itself fails, you get an e-mail. |
| **Health check** | `GET /exec` returns `{"success":true,"status":"ok","version":"…"}` and nothing else. |
| **Auto-provisioning** | Missing tabs and headers are created on first run. Setup is one paste. |

Verified before shipping: the script was executed against a stubbed Apps Script
runtime (fake `SpreadsheetApp`, `CacheService`, `LockService`, `MailApp`,
`Utilities`, `ContentService`) with 84 assertions covering every path above —
legacy-header mapping, dedupe inside and outside the window, each validation
rule, honeypot, all three rate limits, malformed payloads, and the failure path
that must return JSON rather than an Apps Script HTML error page. All passed.
That is a simulation, not a deployment — you still need to run `setup()` and
`testLead()` in the real project (step 5).

---

## 2. Deployment, step by step

### Step 1 — open the script

**If the script is already bound to the sheet** (the usual case here): open the
Google Sheet ▸ **Extensions ▸ Apps Script**.

**If it is standalone**: open <https://script.google.com>, open the existing
project, and set `CONFIG.SPREADSHEET_ID` in step 3 to the long id from the
sheet's URL (`docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`).

Confirm the runtime is V8: ⚙ **Project Settings** ▸ the "Enable Chrome V8
runtime" checkbox must be **on**. This file uses Unicode property escapes
(`\p{L}`) and will not parse on the retired Rhino runtime.

### Step 2 — back up what is there now

Before pasting, copy the current `Code.gs` contents into a scratch file on your
machine. Apps Script keeps deployment versions, but only for code that was
*deployed* — unsaved editor state is not recoverable.

### Step 3 — paste and configure

Replace the entire contents of `Code.gs` with this file. Then edit the `CONFIG`
block at the top. The three that matter:

```js
NOTIFY_TO:   'sales@yourdomain.com',   // who gets every lead. Comma-separated for several.
ADMIN_EMAIL: 'you@yourdomain.com',     // who gets error and flood alerts
SPREADSHEET_ID: '',                    // '' when bound to the sheet; the long id when standalone
```

Everything else has a working default and is commented in place. The ones you
are most likely to touch later:

- `DEDUPE_WINDOW_HOURS` (720 = 30 days; `0` disables dedupe entirely)
- `RATE_PHONE_MAX` / `RATE_GLOBAL_MAX` — raise these before a campaign push
- `NOTIFY_ON_DUPLICATE` — set `false` if repeat enquiries are noise to you
- `REQUIRE_EMAIL` — must stay `false` unless you also make email required in
  `src/lib/validate.js`, or the site will show a valid green form and then a
  server rejection

> `CacheService` caps any entry at 6 hours. Setting a window longer than
> `360` minutes silently gets truncated to 6 hours — the counter simply resets
> sooner than you intended.

Optionally set the manifest so the timezone and scopes are explicit. ⚙ Project
Settings ▸ tick "Show `appsscript.json`", then:

```json
{
  "timeZone": "Asia/Kolkata",
  "runtimeVersion": "V8",
  "exceptionLogging": "STACKDRIVER",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}
```

Use `.../auth/spreadsheets` instead of `spreadsheets.currentonly` if the script
is standalone rather than bound.

### Step 4 — run `setup()` once, from the editor

Pick `setup` in the function dropdown ▸ **Run**.

This is not optional and the order matters: running it here makes *you* the one
who grants the OAuth scopes, in a normal consent dialogue. If you skip it, the
first person to grant those scopes is a website visitor hitting `doPost` — who
sees an error instead of a thank-you.

Google will show "Google hasn't verified this app". That is expected for a
private script: **Advanced ▸ Go to <project name> (unsafe) ▸ Allow**. It is your
own code in your own account; the warning is about third-party publishing.

`setup()` provisions the tabs and headers, prints a summary to the execution
log, and e-mails the same summary to `ADMIN_EMAIL`. If that e-mail arrives, the
sheet, the mail scope and the recipient are all confirmed working.

### Step 5 — test before deploying

Still in the editor, run `testLead()` — it posts a payload byte-identical in
shape to the one `src/lib/leads.js` sends. Expect a row in the sheet, a
notification e-mail, and `{"success":true,…}` in the log. **Delete the test
row afterwards.**

Then run `testValidation()`. It should print four rejections. If any of them
comes back `success:true`, the validation is not doing its job — stop and check
you pasted the whole file.

If you re-run `testLead()` immediately it will be refused as a replay
(`"We already have this enquiry"`). That is the rate limiter working. Run
`resetRateLimitsFor()` — edit the number at the top of it first — or wait 90
seconds.

### Step 6 — deploy as a web app

**Deploy ▸ New deployment ▸** gear icon ▸ **Web app**.

| Field | Value | Why |
|---|---|---|
| Description | `v1 — lead endpoint` | Shows in the version list; make it meaningful, you will be rolling back by it one day |
| **Execute as** | **Me (your@account)** | See below |
| **Who has access** | **Anyone** | See below |

**Execute as: Me** — the script must run with *your* authority, because it is
your sheet it writes to and your mailbox it sends from. The alternative,
"User accessing the web app", makes the script run as the caller: every visitor
would need a Google account, be signed in, and personally authorise access to
your spreadsheet. Anonymous website traffic cannot do any of that, and the
request fails before `doPost` is ever reached.

**Who has access: Anyone** — note this is "Anyone", *not* "Anyone with Google
account". The latter forces a Google sign-in and breaks the form for everyone
else. "Anyone" means the `/exec` URL is genuinely public: anybody who reads your
site's JavaScript can find it and POST to it. That is unavoidable for a static
site and is exactly why the validation and rate limiting in this file exist.
There is no shared secret you can add — anything the browser can send, an
attacker can read out of the bundle.

Copy the **Web app URL** ending in `/exec`.

### Step 7 — point the site at it

Only needed if the URL changed (see the version trap below). In
`src/lib/leads.js`:

```js
const ENDPOINT = "https://script.google.com/macros/s/…/exec";
```

Then rebuild and redeploy the site. The URL is baked into the bundle at build
time, so a Vercel deploy is required — editing it in the Apps Script UI changes
nothing on the live site.

---

## 3. The version trap — read this before you edit anything later

This is the single most common way a working Apps Script form is broken, and it
fails *silently*: the site keeps posting to an endpoint that is still running
last month's code.

- **Deploy ▸ New deployment** mints a **brand-new `/exec` URL**. The old
  deployment stays live, still serving the old code, and `src/lib/leads.js`
  still points at it. Your edits appear to do nothing.
- **Deploy ▸ Manage deployments ▸** (pencil ✏️) **▸ Version: New version ▸
  Deploy** publishes your edits to the **same `/exec` URL**. Nothing on the site
  needs to change.

**So: use "New deployment" exactly once, ever. Every change after that is a new
*version* of that same deployment.**

Saving the editor (⌘S) does *not* update the web app. The `/exec` URL always
serves the last deployed version, never the editor's current state. The one
exception is the `/dev` URL, which always runs the latest saved code but is
only accessible to accounts with edit access — useful for your own testing,
useless for the public site.

### Rolling back

**Manage deployments ▸** ✏️ **▸ Version ▸** pick an earlier version **▸ Deploy**.
Same URL, previous code, live in seconds. This is why the Description field in
step 6 is worth filling in properly.

---

## 4. Testing the live endpoint

Health check — paste the `/exec` URL straight into a browser:

```json
{"success":true,"service":"m3m-brabus-leads","status":"ok","version":"…","time":"…"}
```

A real submission, from a terminal:

```bash
curl -sL -X POST "https://script.google.com/macros/s/…/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"name":"Test Buyer","phone":"+919876543210","email":"test@example.com","config":"5 BHK","source":"curl smoke test","page":"/contact"}'
```

`-L` is essential: Apps Script answers with a 302 to
`script.googleusercontent.com`, and without it you get an empty body and think
the endpoint is broken. This is the same redirect `leads.js` handles with
`redirect: "follow"`.

Expected: `{"success":true,"id":"MB-…","row":N,"duplicate":false,"ms":…}`.

Rejection check — should come back `success:false`:

```bash
curl -sL -X POST "…/exec" -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"name":"Test Buyer","phone":"+911234567890"}'
```

Then submit the real form on the live site and confirm all three: the row
appears, the e-mail arrives, and the modal shows the thank-you rather than
"Something went wrong". **Delete the test rows.**

If something is wrong, look in this order:

1. the `_Log` tab in the spreadsheet (it is hidden — right-click any tab ▸
   "Show all sheets"),
2. Apps Script ▸ **Executions**, which shows every `doPost` invocation with its
   duration and any uncaught error,
3. the browser Network tab — a `401`/`403` on `/exec` means the deployment
   access is not "Anyone".

---

## 5. Quotas

Per Google account, per day, resetting on a rolling 24-hour basis. Check
<https://developers.google.com/apps-script/guides/services/quotas> for the
current table — these move occasionally.

| Limit | Consumer `@gmail.com` | Google Workspace |
|---|---|---|
| **`MailApp` recipients / day** | **100** | **1,500** |
| Script runtime per execution | 6 min | 6 min |
| Simultaneous executions | 30 | 30 |
| `CacheService` entry lifetime | 6 hours max | 6 hours max |
| `CacheService` value size | 100 KB | 100 KB |
| `PropertiesService` total | 500 KB | 500 KB |

**The mail quota is the one that will bite you.** On a free gmail.com account
you get 100 notification recipients per day — and every address in `NOTIFY_TO`
plus `NOTIFY_CC` counts separately, so three recipients per lead means roughly
33 leads a day before the quota is gone. A launch weekend, a portal syndication
or a spam wave will exhaust it.

The script is built so this cannot lose you a lead: `notify_()` checks
`MailApp.getRemainingDailyQuota()` first and, when it is zero, writes a warning
to `_Log` and returns. **The row is already in the sheet by then** — the write
happens before the mail, and a mail failure is caught and logged rather than
propagated. You lose the notification, never the lead.

If you regularly exceed it: run this on a Workspace account, cut `NOTIFY_CC`
down, or set `NOTIFY_ON_DUPLICATE: false`.

There is no documented daily cap on web-app *requests*, but sustained traffic
runs into the 30-simultaneous-execution ceiling; the script lock in
`recordLead_()` serialises the sheet write and waits up to 20 seconds rather
than failing.

---

## 6. What this cannot do

Stated plainly, because the alternative is you believing you have protections
you do not have.

**No per-IP rate limiting.** Apps Script does not expose the caller's IP
address — not on the `e` event object, not through any header, not through any
service. Per-IP limiting is impossible here, and any document claiming
otherwise is wrong. What the script actually enforces is: a per-phone burst cap,
an identical-payload replay window, and a global ceiling across all callers.
An attacker rotating phone numbers gets past the first two and is stopped only
by the global ceiling — which throttles genuine visitors at the same time, so
the script e-mails you when it trips.

**No CAPTCHA.** Adding one (reCAPTCHA, Turnstile) is genuinely possible — the
token would be verified here with `UrlFetchApp` against Google's or
Cloudflare's API, which is real server-side verification. It is not implemented
in this file. If bot volume becomes a problem, that is the correct next step.

**No shared secret / API key.** Any key the browser can send is visible in the
bundle to anyone who opens devtools. It would stop nothing and give false
comfort.

**Atomicity is best-effort.** `CacheService` counters are read-modify-write and
not atomic, so two requests landing in the same millisecond can both see the
same count. Deliberate: the failure mode is under-counting an abuser, never
locking out a legitimate first-time visitor. Likewise, if the script lock cannot
be acquired within 20 seconds the lead is written anyway — a duplicate row is a
far smaller problem than a lost buyer.

**Two client-side gaps, both closed on 2026-07-20.** Recorded here because the
history explains the current shape of the code:

1. **The honeypot used to be decorative.** All four forms (`Enquiry.jsx`,
   `SideEnquiry.jsx`, `Contact.jsx`, `WelcomeHome.jsx`) rendered
   `<input type="text" name="company" …>` as an *uncontrolled* field, so its
   value never entered form state and never reached `submitLead()`. Both the
   client check in `spam.js` and `honeypotTripped_()` here were implemented,
   tested — and never given anything to check. The field is now controlled and
   travels in the form object, so `screenLead()` hard-blocks a tripped honeypot
   in the browser. That means the site's own forms never reach the check here:
   `honeypotTripped_()` is now the guard against a bot that scraped the markup
   and POSTs the endpoint directly, which is the only caller it can catch.

   Note the browser stops a tripped submission *before* the payload is built, so
   `company` is not a key on the wire — and deliberately so. None of the six
   `HONEYPOT_FIELDS` may ever collide with a key `leads.js` sends;
   `testPayloadLimits()` asserts that.

2. **UTM/campaign data used to be dropped.** `leads.js` now merges
   `getAttribution()` (see `src/lib/attribution.js`) into every payload: first
   touch and last touch, flattened as `first_*` / `last_*`, plus top-level
   mirrors for `utm_source`, `utm_medium`, `utm_campaign`, `gclid`, `fbclid`,
   `channel`, and a device/environment block. Attribution survives the visitor
   browsing away from the landing page, and survives across visits (90-day first
   touch, 30-day last touch).

   `PAYLOAD_ALIASES` had not kept up: it read `referrer`, `utm_term` and
   `utm_content`, none of which are sent under those bare names, so those three
   columns had been silently blank ever since. They now read the prefixed keys,
   last touch first. `Channel`, `GCLID`, `Device`, `Visits`, `Fill Time ms`,
   `Spam Score`, `Spam Signals` and `Client Lead ID` columns were added for the
   rest of what the client was already sending and the sheet was discarding.

**Body limits are measured, not guessed.** `MAX_KEYS` and `MAX_BODY_BYTES` are
sized against the payload `leads.js` actually builds. Measured 2026-07-20: a
typical paid click is 55 keys / 2.3 kB and the synthetic worst case (every UTM
at its cap, all five click ids, `?ref=`, a 600-char message) is 65 keys /
~10 kB. The previous `MAX_KEYS: 60` sat *three keys below* that worst case, so a
fully tagged paid click was rejected as "Malformed request" — and rejected
finally, since `leads.js` does not retry a refusal. The most expensive leads on
the site were disappearing without a trace. Run `testPayloadLimits()` from the
editor after any change to `leads.js` or `attribution.js`; it throws rather than
warns, and it also fails if the limits creep back under 1.3x headroom.

**Privacy.** The sheet holds names, phone numbers and e-mail addresses of real
prospects. Share it with named people only, never "anyone with the link". The
`_Log` tab masks all but the last four digits of a phone number; the lead tab
does not, and should not.

---

## 7. Reference

### Request

```
POST https://script.google.com/macros/s/…/exec
Content-Type: text/plain;charset=utf-8
```

`text/plain` is deliberate and must not be "corrected" to `application/json`.
It is a CORS-safelisted content type, so the browser makes a simple request and
skips the `OPTIONS` preflight — which Apps Script cannot answer, meaning the
form would fail outright.

Body: a JSON object. Recognised keys, first match wins:

| Field | Accepted keys |
|---|---|
| name | `name`, `fullname`, `fullName`, `Fullname`, `FullName`, `Name` |
| phone | `phone`, `Phone`, `mobile`, `Mobile`, `contact` |
| email | `email`, `Email`, `mail`, `emailAddress` |
| config | `config`, `configuration`, `Configuration`, `Config`, `unit` |
| message | `message`, `Message`, `notes`, `comments`, `remarks` |
| source | `source`, `Source`, `leadSource` |
| page | `page`, `Page`, `path`, `pagePath` |
| timestamp | `submittedAt`, `timestamp`, `Timestamp`, `time`, `date` |
| utm_source | `utm_source`, `utmSource`, `utm-source`, `last_source`, `first_source` |
| utm_medium | `utm_medium`, `utmMedium`, `utm-medium`, `last_medium`, `first_medium` |
| utm_campaign | `utm_campaign`, `utmCampaign`, `utm-campaign`, `campaign`, `last_campaign`, `first_campaign` |
| utm_term | `utm_term`, `utmTerm`, `last_term`, `first_term` |
| utm_content | `utm_content`, `utmContent`, `last_content`, `first_content` |
| referrer | `referrer`, `referer`, `Referrer`, `document_referrer`, `last_referrer`, `first_referrer` |
| channel | `channel`, `last_channel`, `first_channel` |
| gclid | `gclid`, `first_gclid`, `last_gclid` |
| device | `device`, `deviceType` |
| visits | `visits`, `visitCount` |
| fillMs | `fillMs`, `fillms`, `timeToSubmitMs` — time-to-submit, recorded, never blocking |
| spamScore | `spamScore` |
| spamSignals | `spamSignals` |
| clientId | `leadId`, `leadid`, `clientId` — the client's retry id, stable across replays |
| honeypot | `company`, `website`, `url`, `fax`, `hp`, `_hp` — any non-empty value rejects |

Missing `utm_*` values are scavenged, as a last resort, from the query string of
`last_landing` / `first_landing`, then `page`, then `referrer`.

Unrecognised keys are ignored. `leads.js` sends each value under several
spellings; that redundancy is harmless and is preserved on purpose.

### Response

```json
{ "success": true,  "id": "MB-260720-4F2A", "row": 42, "duplicate": false, "ms": 380 }
{ "success": false, "error": "Enter a valid 10-digit Indian mobile number." }
```

`leads.js` throws on anything that is not `success === true`, and the modal
shows `err.send`. Error strings are written to be safe to display to a visitor —
they never contain a stack trace, a sheet id or a recipient address.

`Intent` is derived from `source`: a source containing "brochure" becomes a
Brochure request, one containing "site visit" becomes a Site visit request,
anything else is an Enquiry. That derivation is what drives the e-mail subject,
so keep the `source` strings in `Enquiry.jsx` as they are.

### Sheet columns

Existing columns are matched by header name — including common variants
(`Mobile`, `Contact Number`, `Full Name`, `Notes`, `Form Responses` style
headers) — and are never moved or renamed. Anything missing is appended to the
right when `ADD_MISSING_COLUMNS` is `true`:

`Timestamp · Fullname · Phone · Email · Configuration · Intent · Source · Page ·
Message · Country · UTM Source · UTM Medium · UTM Campaign · UTM Term ·
UTM Content · Referrer · Submissions · Last Seen · Lead ID`

Phone numbers are stored canonicalised to `+91…` / `+971…` so dedupe,
click-to-call and any future CRM import all agree on one format.

### Editor functions

| Function | Use |
|---|---|
| `setup()` | Run once after pasting. Provisions tabs, triggers OAuth consent, e-mails a summary. |
| `testLead()` | End-to-end smoke test. Writes a real row — delete it. |
| `testValidation()` | Should print four rejections. |
| `resetRateLimitsFor()` | Clears the counters for one number while testing. Edit the number inside it first. |

None of these are reachable over HTTP. Only `doGet` and `doPost` are.
