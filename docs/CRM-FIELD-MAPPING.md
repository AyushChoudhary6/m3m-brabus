# CRM field mapping

What the site actually captures, where each value comes from, where it lands in
the Google Sheet, and — separately and explicitly — what the specification asks
for that is **not captured today**.

Verified against `src/lib/leads.js`, `src/lib/attribution.js`,
`src/lib/validate.js`, `src/lib/spam.js` and `server/apps-script/Code.gs` on
20 July 2026. Where the code and the spec disagree, the code wins; this document
describes the system, not the intention.

---

## 1. The path a value takes

```
form input  ──▶  validate.js  ──▶  leads.js buildPayload()
                                          │
                    attribution.js ───────┤   (campaign + device)
                    spam.js ──────────────┘   (quality signals)
                                          │
                                   POST text/plain
                                          ▼
                            Code.gs normalise_()
                              PAYLOAD_ALIASES → lead object
                                          │
                            Code.gs ensureHeaders_()
                              HEADER_ALIASES → column map
                                          ▼
                                 Google Sheet, "Leads" tab
                                          │
                                          ▼
                                 notification email
```

A payload key only reaches the sheet if `Code.gs` has both a
`PAYLOAD_ALIASES` entry mapping it to an internal field *and* a `COLUMNS` entry
giving that field a header. Keys with neither are received, ignored and
discarded. That is by design — it lets the client send speculative data
harmlessly — but it means "the site sends it" and "the sheet stores it" are two
different claims. Both are stated separately below.

---

## 2. Captured today, and stored in the sheet

| Sheet column | Internal field | Source | Notes |
| --- | --- | --- | --- |
| `Timestamp` | `timestamp` | client `submittedAt`, else server clock | Written as a real Date in `Asia/Kolkata`. Client time is used only when within 24 h of the server's, so a queued offline lead keeps its true time but a wrong device clock cannot poison ordering. |
| `Fullname` | `name` | form | Required. Letters, spaces, `.'-` only; digits stripped as you type. Max 60 chars. |
| `Phone` | `phone` | form | Required. Canonicalised to E.164 (`+91…` / `+971…`) by the server. Validated for India (10 digits, 6–9) and UAE (9 digits, 5). |
| `Email` | `email` | form | **Optional** — `REQUIRE_EMAIL: false`, matching the client. Lower-cased, max 254. |
| `Configuration` | `config` | form `<select>` | "4 BHK Residence" / "5 BHK Residence", from `RESIDENCES` in `src/lib/site.js`. Blank when the visitor did not choose. |
| `Intent` | `intent` | derived server-side from `source` | `Brochure request` / `Site visit request` / `Enquiry`. |
| `Source` | `source` | set by each form component | See §3. On a repeat submission new sources are appended with ` \| `, so the column shows the journey. |
| `Page` | `page` | `window.location.pathname` | Path only — no query string, no origin. |
| `Message` | `message` | Contact page textarea; site-visit modal writes `Preferred visit date: YYYY-MM-DD` here | Max 600 chars. |
| `Country` | `country` | derived from the phone number | `IN` or `AE`, or blank. |
| `UTM Source` | `utm_source` | `attribution.js` last-touch, falling back to first-touch | |
| `UTM Medium` | `utm_medium` | as above | |
| `UTM Campaign` | `utm_campaign` | as above | |
| `Submissions` | `count` | server | Starts at 1; incremented when the same phone returns inside 30 days. |
| `Last Seen` | `lastSeen` | server | Refreshed on each repeat. |
| `Lead ID` | `id` | server | `MB-260720-4F2A` — short, sortable, quotable to a buyer on the phone. |

### Columns that exist but stay empty

Three columns are provisioned by `Code.gs` and are **never populated by the
current client**. Do not build a CRM view that depends on them.

| Sheet column | Why it is empty |
| --- | --- |
| `UTM Term` | `attribution.js` captures `utm_term`, but only under the prefixed keys `first_term` / `last_term`. It sends no bare `utm_term`, and `PAYLOAD_ALIASES` only looks for `utm_term` / `utmTerm` / `utm-term`. |
| `UTM Content` | Identical cause. |
| `Referrer` | `attribution.js` sends `first_referrer` and `last_referrer`; `PAYLOAD_ALIASES` looks for bare `referrer` / `referer` / `document_referrer`. The value is captured, transmitted and then dropped. |

**Fix (one line each, in `Code.gs`):** extend `PAYLOAD_ALIASES` to
`utm_term: ['utm_term','utmTerm','utm-term','last_term','first_term']` and the
same shape for `utm_content` and `referrer`. No client change is needed. This is
a documented gap, not a plan — nothing in the repository implements it yet.

---

## 3. `Source` values

Set by the calling component. This is the only way to tell which surface
produced a lead, so it is worth knowing the exact strings.

| String | Origin |
| --- | --- |
| `Modal · <subject>` | Enquiry modal opened by a named CTA |
| `Modal` | Enquiry modal opened with no subject |
| `Timed invite` | The modal that appears once, ~40 s after load |
| `Brochure · <subject>` | Brochure gate — submitting unlocks the PDF download |
| `Site visit · <subject>` | Site-visit modal |
| `Side panel` | Desktop right-docked panel (`SideEnquiry.jsx`) |
| `Welcome Home section` | Homepage section form |
| `Contact page` | `/contact` |

---

## 4. Sent by the client but stored nowhere

`buildPayload()` attaches all of the following to every submission. `Code.gs`
receives them, has no column for them, and drops them. They cost nothing to
send, and the moment a column is added they start filling — which is precisely
why they are already there.

**Attribution (`src/lib/attribution.js`)**

| Payload key | Meaning |
| --- | --- |
| `first_source`, `first_medium`, `first_campaign`, `first_term`, `first_content` | First-touch UTMs (`utm_` prefix stripped by `flatten()`), 90-day TTL |
| `first_gclid`, `first_fbclid`, `first_msclkid`, `first_ttclid`, `first_li_fat_id` | First-touch ad click IDs |
| `first_ref`, `first_referrer`, `first_landing`, `first_channel`, `first_at` | Partner/broker `?ref=`, external referrer, landing path+query, coarse channel, ISO timestamp |
| `last_*` | The same set for last touch, 30-day TTL |
| `gclid`, `fbclid` | Convenience mirrors (first touch preferred) |
| `channel` | `paid-search` / `paid-social` / `organic-search` / `social` / `referral` / `partner` / `direct`, or the raw `utm_medium` |
| `visits` | Session count for this browser (30-minute inactivity gap) |

Why first *and* last touch: a branded-residence enquiry is not an impulse.
Someone clicks a Google ad on Tuesday, reads the floor plans, leaves, and
enquires on Sunday from a direct visit. Recording only the campaign visible at
submission would file every one of those as "direct" and make the media spend
look worthless. First touch answers *what bought this lead*; last touch answers
*what closed it*.

**Environment (`environment()` in `attribution.js`)**

`device` (`mobile` / `tablet` / `desktop`), `screen`, `viewport`, `dpr`,
`language`, `timezone`, `capturedAt`.

**Quality signals (`src/lib/spam.js`)**

| Key | Meaning |
| --- | --- |
| `spamSignals` | Comma-joined tags: `link-in-text`, `repeated-chars`, `no-word-break`, `consonant-run`, `uniform-phone`, `name-equals-email`, `disposable-email`, `link-spam`, `too-fast` |
| `spamScore` | 0–90. Above ~40 deserves a human glance before a site visit is spent on it. |
| `fillMs` | Milliseconds from first interaction to submit. |

**Identity**

`leadId` — a client-side UUID, stable across retries of the same submission. It
is the dedupe key that would let the owner collapse a double-write caused by an
unreadable-but-successful response. `Code.gs` mints its own `Lead ID` server-side
and does **not** currently read `leadId`.

### Adding a column

`Code.gs` is written for this. Add an entry to `COLUMNS` (`{ key, header }`), an
entry to `PAYLOAD_ALIASES` mapping the incoming key(s) to that internal field,
and — if the sheet already has data — leave `ADD_MISSING_COLUMNS: true` so the
new header is appended to the *right* of the existing ones. Existing columns are
never moved or renamed, so the owner's filters and formulas survive.

---

## 5. Specification fields NOT captured

The specification's lead-record list includes two fields this site does not ask
for and therefore cannot supply. Neither is a bug; both are deliberate omissions
that should be understood before someone promises a CRM view that segments on
them.

| Spec field | Status | What it would take |
| --- | --- | --- |
| **Budget / price band** | **Not captured.** No form on the site has a budget field. | A `<select>` in the four wired forms, a `budget` key in `buildPayload()`, plus `COLUMNS` + `PAYLOAD_ALIASES` entries in `Code.gs`. Roughly an hour. **But consider first:** the project has no published price (see the facts rule), so any band offered would be the site inventing a price ladder for a residence M3M has not priced. It also adds a field to a form whose conversion is the entire commercial point. Recommend leaving it to the qualifying call. |
| **Preferred contact time** | **Not captured.** The site-visit modal has a *preferred visit date* — a different thing, and it is written into the free-text `Message` column, not a field of its own. | A time-window `<select>` (morning / afternoon / evening) is the cheap version; a timezone-aware picker is not, given genuine NRI traffic from the UAE. Same three-file change as above. The `timezone` value is already being sent and could seed a sensible default. |

Two further gaps worth recording in the same breath:

| Gap | Status |
| --- | --- |
| **Consent / marketing opt-in** | Not captured as a field. `Enquiry.jsx` and `LeadForm.jsx` show the line "By submitting you agree to be contacted about M3M Brabus", which is notice, not a recorded consent flag. If the sales operation needs auditable consent, it must be a checkbox with its own column. |
| **`components/sections/LeadForm.jsx` sends nothing** | Its submit handler sets a success state and carries `// TODO: wire to CRM / email endpoint / WhatsApp API`. It never calls `submitLead`. Verified as dead code — nothing in `src/` imports it, so no leads are being lost today. Wire it or delete it before someone puts a finished-looking form that discards buyers onto a live page. |

---

## 6. The sheet, and getting out of it

The Google Sheet is the system of record. There is no database and no admin UI —
see [KNOWN-LIMITATIONS.md](KNOWN-LIMITATIONS.md).

**Tabs**

| Tab | Contents |
| --- | --- |
| `Leads` | One row per buyer, in the column order above. Falls back to the first tab if a tab of this name does not exist. |
| `_Log` | Validation failures, spam rejections, rate-limit hits and internal errors. Created automatically. Check it when a lead is reported missing. |

**Deduplication.** Same phone inside 30 days (`DEDUPE_WINDOW_HOURS: 720`,
scanning back 5,000 rows) updates the existing row rather than appending: it
increments `Submissions`, refreshes `Last Seen`, fills any blank
email/config/message/UTM cells, and appends the new `Source`. So a row is a
*buyer*, not a *submission* — worth knowing before anyone counts rows and calls
it lead volume.

**Formula-injection guard.** Every written cell passes through `safeCell_()`,
which prefixes an apostrophe to any string starting `=`, `+`, `-` or `@`. This is
not hypothetical: `+919876543210` starts with `+` and would otherwise be
evaluated as a formula. Dates, numbers and booleans pass through untouched so
`Timestamp` sorts correctly and `Submissions` stays numeric.

**Notification email.** Every new lead (and, throttled to one per two hours, a
repeat) is mailed to `CONFIG.NOTIFY_TO`. The subject carries intent, name,
configuration and country; the body carries every field above plus a deep link to
the sheet row, a `tel:` button and a `mailto:` reply-to set to the buyer's own
address. `MailApp` quota is 100 recipients/day on a personal Gmail account and
1,500/day on Workspace — a quota exhaustion is logged to `_Log` and the lead is
still saved.

### Onward to a real CRM

Three routes, in increasing order of effort:

1. **The CRM's own Google Sheets connector** (Zoho, HubSpot, Pipedrive and
   Salesforce all have one, as does Zapier/Make). No code. The credential lives
   in the CRM, never in this repository. **This is the recommended route.**
2. **Push from Apps Script.** Add a `UrlFetchApp` call to `recordLead_`'s success
   path and keep the CRM API key in Apps Script Properties Service. Server-side,
   so the key is genuinely secret.
3. **Push from the browser.** **Do not.** Any API key in a static bundle is
   published to every visitor, who can then write whatever they like into the
   CRM. There is no version of this that is safe. See `.env.example`.

---

## 7. Quick reference — the whole payload

Everything one submission puts on the wire, in one list. Bold keys reach the
sheet today.

```
leadId
**name** fullname fullName Fullname
**phone** Phone
**email** Email
**config** configuration Configuration
**message**
**source**
**page**
submittedAt timestamp Timestamp      → **Timestamp**
first_source first_medium first_campaign first_term first_content
first_gclid first_fbclid first_msclkid first_ttclid first_li_fat_id
first_ref first_referrer first_landing first_channel first_at
last_source last_medium last_campaign last_term last_content
last_gclid last_fbclid last_msclkid last_ttclid last_li_fat_id
last_ref last_referrer last_landing last_channel last_at
**utm_source** **utm_medium** **utm_campaign**
gclid fbclid channel visits
device screen viewport dpr language timezone capturedAt
spamSignals spamScore fillMs
```

Server-derived and added on write: `Intent`, `Country`, `Submissions`,
`Last Seen`, `Lead ID`.
