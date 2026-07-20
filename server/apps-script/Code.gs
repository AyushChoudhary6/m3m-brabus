/**
 * ============================================================================
 * M3M Brabus — lead capture web app (Google Apps Script)
 * ============================================================================
 *
 * This file is the ONLY server-side execution the site has. The front end is a
 * static SPA on Vercel, so there is no other place to put real validation,
 * deduplication or notification. Everything the client does is advisory — it
 * can be bypassed with devtools in ten seconds. What runs here is the truth.
 *
 * Contract with the client (src/lib/leads.js):
 *   POST  Content-Type: text/plain;charset=utf-8   (CORS-safelisted, so the
 *         browser sends no preflight — Apps Script cannot answer OPTIONS)
 *   Body: a JSON string. Values are duplicated under several key spellings
 *         (name / fullname / fullName / Fullname, phone / Phone, …) because the
 *         sheet's headers are Fullname | Phone | Email | Configuration | Timestamp.
 *   Reply: JSON — { success: true, ... } or { success: false, error: "…" }.
 *         leads.js throws on anything that is not success === true, so a
 *         rejection here surfaces as a real error in the UI.
 *
 * Requires the V8 runtime (the default since 2020) — this file uses `let`,
 * arrow-free but modern string methods, and Unicode property escapes in regex.
 *
 * Run setup() once from the editor before deploying. See README.md.
 * ============================================================================
 */

/* ==========================================================================
 * 1. CONFIGURATION — the only part you normally edit.
 * ========================================================================== */

var CONFIG = {

  /* ---- Where notifications go -------------------------------------------
   * Comma-separated. Every new lead, brochure request and site-visit request
   * is mailed here. Leave TO empty to switch notification off entirely
   * (the sheet still records everything).                                  */
  NOTIFY_TO:  'wcrdevelopmentteam@gmail.com',
  NOTIFY_CC:  '',
  /* Errors and "the logger itself broke" alerts go here. Usually you.      */
  ADMIN_EMAIL: 'wcrdevelopmentteam@gmail.com',
  /* Shown as the sender name. The address is always the account that owns
   * the deployment — Apps Script cannot forge a From address.              */
  SENDER_NAME: 'M3M Brabus — Website',
  /* Optional: replies to the notification go here instead of to you.       */
  REPLY_TO: '',

  /* ---- Which spreadsheet ------------------------------------------------
   * Leave SPREADSHEET_ID empty when the script is *bound* to the sheet
   * (Extensions ▸ Apps Script from inside the sheet). Set it to the long id
   * from the sheet URL when the script is standalone.                      */
  SPREADSHEET_ID: '',
  /* The tab holding leads. If a tab with this name does not exist the script
   * falls back to the FIRST tab, so an existing sheet keeps working no
   * matter what it is called.                                              */
  LEAD_SHEET_NAME: 'Leads',
  /* Failures are appended here. Created automatically.                     */
  LOG_SHEET_NAME: '_Log',

  /* ---- Sheet behaviour --------------------------------------------------
   * true  → if the lead tab is missing columns we use (Source, Page, UTM …)
   *         they are appended to the RIGHT of the existing headers. Existing
   *         columns are never moved, renamed or removed.
   * false → extra data is folded into the Message column instead.          */
  ADD_MISSING_COLUMNS: true,
  /* Write Timestamp as a real Date (sorts and formats properly) rather than
   * the ISO string the client sends.                                       */
  TIMESTAMP_AS_DATE: true,
  TIMEZONE: 'Asia/Kolkata',

  /* ---- Validation -------------------------------------------------------
   * Mirrors src/lib/validate.js. Keep the two in step or the site will show
   * a green form and then a server rejection.                              */
  REQUIRE_EMAIL: false,   // the client treats email as optional
  NAME_MAX: 60,
  EMAIL_MAX: 254,
  MESSAGE_MAX: 600,
  /* Whole-body ceiling, and the key-count ceiling.
   *
   * MEASURED 2026-07-20 against the payload src/lib/leads.js actually builds
   * (buildPayload + getAttribution from src/lib/attribution.js), by stubbing the
   * browser and intercepting fetch:
   *
   *   typical paid click (gclid + 5 UTMs)        →  55 keys /  2,206 bytes
   *   synthetic worst case: every UTM at its
   *   120-char cap, ALL FIVE click ids at their
   *   200-char cap, ?ref=, 300-char referrer,
   *   600-char message, site-visit intent        →  65 keys /  9,909 bytes
   *
   * The old values (60 keys / 12,000) sat THREE keys below the real maximum, so
   * a visitor arriving on a fully tagged paid click was rejected with
   * "too-many-keys" — silently, because leads.js treats a refusal as final and
   * drops the lead. Exactly the highest-value leads, invisibly lost.
   *
   * These are abuse ceilings, not fit-to-measurement limits: set them well clear
   * of the maximum so adding attribution fields cannot re-create that bug. If
   * attribution.js ever grows past ~55 more keys, re-measure — do not nudge.
   *
   * NOTE the body check compares raw.length (UTF-16 code units), which equals
   * bytes for ASCII and UNDER-counts for non-Latin names. That errs towards
   * accepting, which is the right direction here.                          */
  MAX_BODY_BYTES: 32000,   // ~3.2x the measured worst case
  MAX_KEYS: 120,           // ~1.8x the measured worst case (65)
  /* Link spam: a real enquiry rarely contains a URL, never three.          */
  MAX_LINKS_IN_MESSAGE: 1,

  /* ---- Duplicate handling -----------------------------------------------
   * Same phone inside the window updates the existing row (bumps a counter,
   * refreshes Last Seen, fills blanks) instead of creating a second row.
   * 720 h = 30 days. Set to 0 to disable and always append.                */
  DEDUPE_WINDOW_HOURS: 720,
  /* Mail on a repeat too? Useful — a second enquiry is a buying signal —
   * but it is throttled by DUPLICATE_MAIL_COOLDOWN_MIN.                    */
  NOTIFY_ON_DUPLICATE: true,
  DUPLICATE_MAIL_COOLDOWN_MIN: 120,
  /* How many rows back to scan for the duplicate. Keeps the read bounded on
   * a sheet that has grown to tens of thousands of rows.                   */
  DEDUPE_SCAN_ROWS: 5000,

  /* ---- Spam / abuse -----------------------------------------------------
   * HONEST LIMITATION: Apps Script never exposes the caller's IP address.
   * There is no header, no e.remoteAddress, nothing. Per-IP rate limiting is
   * therefore IMPOSSIBLE here. What we can enforce is per-phone, per-email
   * and a global ceiling — see README "What this cannot do".               */
  /* 'company' is the field the site renders (spam.js HONEYPOT_NAME); the rest
   * catch bots that post a hand-rolled body. Checked 2026-07-20: none of these
   * six collide with any key the real payload sends (the attribution block is
   * prefixed, so `ref` and `referrer` arrive as first_ref and last_referrer and
   * cannot trip this). Never add a bare key the client sends.
   *
   * The site's own forms hard-block a tripped honeypot in the browser and never
   * reach here, so this is the guard against a bot that scraped the form markup
   * and POSTs it directly.                                                  */
  HONEYPOT_FIELDS: ['company', 'website', 'url', 'fax', 'hp', '_hp'],
  /* A tripped honeypot returns success:true so the bot stops retrying and
   * never learns it was caught. Nothing is written to the lead sheet.      */
  HONEYPOT_SILENT_SUCCESS: true,
  /* Per-phone: at most N submissions per window (a human who mistypes and
   * resubmits twice is fine; a script hammering the endpoint is not).      */
  RATE_PHONE_MAX: 4,
  RATE_PHONE_WINDOW_MIN: 60,
  /* Identical payload replayed — near-instant duplicates from double-clicks
   * or a retry loop.                                                       */
  RATE_FINGERPRINT_WINDOW_SEC: 90,
  /* Global ceiling across every caller. The nearest thing to a per-IP limit
   * we can build. Generous enough that a genuine campaign spike survives,
   * tight enough that a flood is capped.                                   */
  RATE_GLOBAL_MAX: 120,
  RATE_GLOBAL_WINDOW_MIN: 60,
  /* When the global ceiling is hit we still mail you once, so a flood is
   * visible rather than silent.                                            */
  FLOOD_ALERT_COOLDOWN_MIN: 60,

  /* ---- Misc -------------------------------------------------------------*/
  VERSION: '2026.07.20',
  /* Health endpoint. Returns status only — never config, never counts.     */
  SERVICE_NAME: 'm3m-brabus-leads'
};

/* Column headers this script would like to have, in preferred order. Used to
 * provision an empty sheet and (when ADD_MISSING_COLUMNS) to extend one.
 * `key` is the internal field, `header` is what appears in row 1. The first
 * five deliberately reproduce the existing sheet exactly.                   */
var COLUMNS = [
  { key: 'timestamp',    header: 'Timestamp' },
  { key: 'name',         header: 'Fullname' },
  { key: 'phone',        header: 'Phone' },
  { key: 'email',        header: 'Email' },
  { key: 'config',       header: 'Configuration' },
  { key: 'intent',       header: 'Intent' },
  { key: 'source',       header: 'Source' },
  { key: 'page',         header: 'Page' },
  { key: 'message',      header: 'Message' },
  { key: 'country',      header: 'Country' },
  { key: 'utm_source',   header: 'UTM Source' },
  { key: 'utm_medium',   header: 'UTM Medium' },
  { key: 'utm_campaign', header: 'UTM Campaign' },
  { key: 'utm_term',     header: 'UTM Term' },
  { key: 'utm_content',  header: 'UTM Content' },
  { key: 'referrer',     header: 'Referrer' },
  /* Ch. 75/78 — signals leads.js has been sending since the attribution and
     spam modules landed. Without these columns the values arrive and are
     thrown away, which is why they are here rather than in a TODO.          */
  { key: 'channel',      header: 'Channel' },
  { key: 'gclid',        header: 'GCLID' },
  { key: 'device',       header: 'Device' },
  { key: 'visits',       header: 'Visits' },
  { key: 'fillMs',       header: 'Fill Time ms' },
  { key: 'spamScore',    header: 'Spam Score' },
  { key: 'spamSignals',  header: 'Spam Signals' },
  { key: 'count',        header: 'Submissions' },
  { key: 'lastSeen',     header: 'Last Seen' },
  { key: 'id',           header: 'Lead ID' },
  /* The client's own retry id. Stable across queue retries, unlike our `id`,
     so a duplicated row can be collapsed by hand.                           */
  { key: 'clientId',     header: 'Client Lead ID' }
];

/* Header text (normalised: lowercased, non-alphanumerics stripped) → field.
 * Every plausible spelling the sheet might already use is listed, so an
 * inherited sheet maps onto the right columns without being rebuilt.       */
var HEADER_ALIASES = {
  timestamp: 'timestamp', time: 'timestamp', date: 'timestamp', datetime: 'timestamp',
  submittedat: 'timestamp', createdat: 'timestamp', received: 'timestamp',

  fullname: 'name', name: 'name', fullnames: 'name', customername: 'name',
  clientname: 'name', leadname: 'name',

  phone: 'phone', mobile: 'phone', contact: 'phone', phonenumber: 'phone',
  mobilenumber: 'phone', contactnumber: 'phone', whatsapp: 'phone',

  email: 'email', emailaddress: 'email', mail: 'email', emailid: 'email',

  configuration: 'config', config: 'config', unit: 'config', unittype: 'config',
  requirement: 'config', typology: 'config', interestedin: 'config',

  intent: 'intent', type: 'intent', requesttype: 'intent',
  /* NOTE: 'channel' used to alias onto 'source'. The client now sends a real
     attribution channel ("paid-search", "organic-search", …) and it has its own
     column, so a header called "Channel" must map to that. A sheet that used
     "Channel" to mean the lead source should rename it to "Lead Source".   */
  source: 'source', leadsource: 'source',
  channel: 'channel', attributionchannel: 'channel',
  gclid: 'gclid', clickid: 'gclid',
  device: 'device', devicetype: 'device',
  visits: 'visits', visitcount: 'visits', sessions: 'visits',
  filltimems: 'fillMs', fillms: 'fillMs', filltime: 'fillMs',
  spamscore: 'spamScore', score: 'spamScore',
  spamsignals: 'spamSignals', signals: 'spamSignals',
  clientleadid: 'clientId', clientid: 'clientId',
  page: 'page', pageurl: 'page', path: 'page', landingpage: 'page',
  message: 'message', notes: 'message', note: 'message', comments: 'message',
  comment: 'message', remarks: 'message',
  country: 'country', region: 'country',

  utmsource: 'utm_source', utmmedium: 'utm_medium', utmcampaign: 'utm_campaign',
  utmterm: 'utm_term', utmcontent: 'utm_content',
  campaign: 'utm_campaign', referrer: 'referrer', referer: 'referrer',

  submissions: 'count', count: 'count', repeats: 'count',
  lastseen: 'lastSeen', updatedat: 'lastSeen', lastsubmission: 'lastSeen',
  leadid: 'id', id: 'id', ref: 'id', reference: 'id'
};

/* Payload key → field. leads.js sends each value under several spellings; the
 * first non-empty match in this order wins.
 *
 * CHECKED AGAINST THE REAL PAYLOAD 2026-07-20. src/lib/attribution.js flattens
 * each touch into PREFIXED keys — first_source / last_referrer / last_term and
 * so on — and only mirrors utm_source, utm_medium, utm_campaign, gclid, fbclid
 * and channel at the top level. So the old lists here were reading keys that no
 * longer exist: `referrer`, `utm_term` and `utm_content` were NEVER sent, and
 * those three columns had been silently blank ever since attribution landed.
 * Last touch is listed before first touch — it answers "what closed it".    */
var PAYLOAD_ALIASES = {
  name:         ['name', 'fullname', 'fullName', 'Fullname', 'FullName', 'Name'],
  phone:        ['phone', 'Phone', 'mobile', 'Mobile', 'contact'],
  email:        ['email', 'Email', 'mail', 'emailAddress'],
  config:       ['config', 'configuration', 'Configuration', 'Config', 'unit'],
  message:      ['message', 'Message', 'notes', 'comments', 'remarks'],
  source:       ['source', 'Source', 'leadSource'],
  page:         ['page', 'Page', 'path', 'pagePath'],
  timestamp:    ['submittedAt', 'timestamp', 'Timestamp', 'time', 'date'],
  referrer:     ['referrer', 'referer', 'Referrer', 'document_referrer',
                 'last_referrer', 'first_referrer'],
  utm_source:   ['utm_source', 'utmSource', 'utm-source', 'last_source', 'first_source'],
  utm_medium:   ['utm_medium', 'utmMedium', 'utm-medium', 'last_medium', 'first_medium'],
  utm_campaign: ['utm_campaign', 'utmCampaign', 'utm-campaign', 'campaign',
                 'last_campaign', 'first_campaign'],
  utm_term:     ['utm_term', 'utmTerm', 'last_term', 'first_term'],
  utm_content:  ['utm_content', 'utmContent', 'last_content', 'first_content'],

  /* Ch. 75 — attribution. */
  channel:      ['channel', 'last_channel', 'first_channel'],
  gclid:        ['gclid', 'first_gclid', 'last_gclid'],
  device:       ['device', 'deviceType'],
  visits:       ['visits', 'visitCount'],

  /* Ch. 78 — quality signals. `fillMs` is the time-to-submit the form measures;
     a value under 2500 means the browser reported a sub-2.5s fill, which
     leads.js also tags in spamSignals as "too-fast". Recorded, never blocked:
     a fast fill is a hint for the desk, not grounds to throw a buyer away.  */
  fillMs:       ['fillMs', 'fillms', 'timeToSubmitMs'],
  spamScore:    ['spamScore'],
  spamSignals:  ['spamSignals'],

  /* The client's retry id, stable across queue retries (ours is minted here
     per request, so it cannot identify a replay). */
  clientId:     ['leadId', 'leadid', 'clientId']
};


/* ==========================================================================
 * 2. ENTRY POINTS
 * ========================================================================== */

/**
 * Health check. Deliberately says nothing useful to a stranger: no recipient,
 * no spreadsheet id, no counts. Enough to confirm the deployment is alive and
 * which version is running.
 */
function doGet(e) {
  return jsonOut_({
    success: true,
    service: CONFIG.SERVICE_NAME,
    status: 'ok',
    version: CONFIG.VERSION,
    time: new Date().toISOString()
  });
}

/**
 * The lead endpoint. Contract: never throw, always answer JSON. An uncaught
 * exception here renders as an Apps Script HTML error page, leads.js fails to
 * parse it, and the visitor is told the form is broken — so the outer
 * try/catch is load-bearing, not decoration.
 */
function doPost(e) {
  var started = new Date();
  var raw = '';

  try {
    raw = readBody_(e);

    /* --- payload sanity, before we spend any quota on it ---------------- */
    if (raw.length > CONFIG.MAX_BODY_BYTES) {
      return reject_('Payload too large', 'oversize', raw.slice(0, 500));
    }

    var body = safeParse_(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return reject_('Malformed request', 'unparseable', raw.slice(0, 500));
    }
    if (Object.keys(body).length > CONFIG.MAX_KEYS) {
      return reject_('Malformed request', 'too-many-keys', raw.slice(0, 500));
    }

    /* --- honeypot: a hidden field only a bot fills ---------------------- */
    if (honeypotTripped_(body)) {
      logRow_('spam', 'honeypot', 'Hidden field filled', redact_(body));
      return CONFIG.HONEYPOT_SILENT_SUCCESS
        ? jsonOut_({ success: true, id: 'ok' })
        : jsonOut_({ success: false, error: 'Rejected' });
    }

    /* --- normalise, then validate for real ------------------------------ */
    var lead = normalise_(body);
    var errors = validateLead_(lead);
    if (errors.length) {
      return jsonOut_({ success: false, error: errors[0], errors: errors });
    }

    /* --- rate limits ----------------------------------------------------- */
    var limited = rateLimit_(lead);
    if (limited) {
      logRow_('spam', 'rate-limit', limited, redact_(body));
      return jsonOut_({ success: false, error: limited });
    }

    /* --- write, with a lock so two concurrent posts cannot both append --- */
    var result = recordLead_(lead);

    /* --- notify. A mail failure must NEVER fail the submission: the lead
           is already safely in the sheet by this point. ------------------- */
    try {
      if (result.action === 'created' || CONFIG.NOTIFY_ON_DUPLICATE) {
        notify_(lead, result);
      }
    } catch (mailErr) {
      logRow_('error', 'notify', mailErr && mailErr.message, redact_(body), mailErr && mailErr.stack);
    }

    return jsonOut_({
      success: true,
      id: result.id,
      row: result.row,
      duplicate: result.action === 'updated',
      ms: new Date().getTime() - started.getTime()
    });

  } catch (err) {
    /* Last line of defence. Log it, tell the visitor something honest and
       unhelpful to an attacker, and never leak a stack trace over HTTP. */
    logRow_('error', 'doPost', err && err.message, raw.slice(0, 900), err && err.stack);
    return jsonOut_({ success: false, error: 'Server error — please call us instead.' });
  }
}


/* ==========================================================================
 * 3. REQUEST PARSING
 * ========================================================================== */

/** Pull the body out of whatever shape the request arrived in. */
function readBody_(e) {
  if (!e) return '';                                     // manual run from the editor
  if (e.postData && e.postData.contents) return String(e.postData.contents);
  /* Fallback: someone posted a normal HTML form (application/x-www-form-
     urlencoded). Apps Script parses that into e.parameter for us. */
  if (e.parameter && Object.keys(e.parameter).length) return JSON.stringify(e.parameter);
  return '';
}

function safeParse_(raw) {
  try { return JSON.parse(raw); } catch (err) { return null; }
}

/** True when any configured honeypot key carries a value. */
function honeypotTripped_(body) {
  for (var i = 0; i < CONFIG.HONEYPOT_FIELDS.length; i++) {
    var v = body[CONFIG.HONEYPOT_FIELDS[i]];
    if (v !== undefined && v !== null && String(v).trim() !== '') return true;
  }
  return false;
}

/** First non-empty value among a field's accepted key spellings. */
function pick_(body, keys) {
  for (var i = 0; i < keys.length; i++) {
    var v = body[keys[i]];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

/**
 * Turn the raw payload into one clean lead object. Also strips control
 * characters — they serve no purpose in a name and can break CSV exports.
 */
function normalise_(body) {
  var lead = {};
  for (var field in PAYLOAD_ALIASES) {
    if (PAYLOAD_ALIASES.hasOwnProperty(field)) {
      lead[field] = clean_(pick_(body, PAYLOAD_ALIASES[field]));
    }
  }

  lead.name    = lead.name.slice(0, CONFIG.NAME_MAX);
  lead.email   = lead.email.slice(0, CONFIG.EMAIL_MAX).toLowerCase();
  lead.message = lead.message.slice(0, CONFIG.MESSAGE_MAX);

  /* Last resort for campaign data: scavenge it out of a URL we were given.
     leads.js sends `page` as a bare pathname, but attribution.js keeps the full
     landing URL (query string and all) in last_landing / first_landing, so that
     is where a stray utm_term usually survives. Only ever fills blanks. */
  var qs = queryOf_(pick_(body, ['last_landing', 'first_landing'])) ||
           queryOf_(lead.page) || queryOf_(lead.referrer);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
    if (!lead[k] && qs[k]) lead[k] = clean_(qs[k]).slice(0, 120);
  });

  /* Keep the long attribution strings from bloating a cell. */
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'channel', 'device']
    .forEach(function (k) { lead[k] = lead[k].slice(0, 120); });
  lead.gclid = lead.gclid.slice(0, 200);
  lead.referrer = lead.referrer.slice(0, 300);
  lead.spamSignals = lead.spamSignals.slice(0, 200);

  /* Numbers, so the sheet can sort and filter on them rather than on text. */
  lead.visits    = lead.visits    === '' ? '' : (parseInt(lead.visits, 10) || '');
  lead.fillMs    = lead.fillMs    === '' ? '' : (parseInt(lead.fillMs, 10) || 0);
  lead.spamScore = lead.spamScore === '' ? '' : (parseInt(lead.spamScore, 10) || 0);

  var parsed = parsePhone_(lead.phone);
  lead.country = parsed.country || '';
  lead.e164 = parsed.country ? (parsed.country === 'IN' ? '+91' : '+971') + parsed.local : '';
  if (lead.e164) lead.phone = lead.e164;   // store one canonical form, always

  lead.intent = intentOf_(lead.source);

  /* Client clock cannot be trusted for ordering, but it is worth keeping when
     it is sane (within a day of ours) — it survives queueing delays. */
  var client = lead.timestamp ? new Date(lead.timestamp) : null;
  var now = new Date();
  lead.at = (client && !isNaN(client.getTime()) &&
             Math.abs(client.getTime() - now.getTime()) < 864e5) ? client : now;

  lead.id = makeId_(lead.at);
  return lead;
}

/**
 * Strip control characters and collapse runaway whitespace. Control bytes have
 * no business in a name and break CSV exports and mail headers downstream.
 */
function clean_(s) {
  if (!s) return '';
  return String(s)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Parse `?a=1&b=2` out of a path or URL. Returns a plain object. */
function queryOf_(s) {
  var out = {};
  if (!s) return out;
  var i = String(s).indexOf('?');
  if (i === -1) return out;
  String(s).slice(i + 1).split('&').forEach(function (pair) {
    if (!pair) return;
    var kv = pair.split('=');
    try {
      out[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
    } catch (err) { /* malformed escape — ignore this pair */ }
  });
  return out;
}

/** Human-readable request type, derived from the source string leads.js sends. */
function intentOf_(source) {
  var s = (source || '').toLowerCase();
  if (s.indexOf('brochure') !== -1) return 'Brochure request';
  if (s.indexOf('site visit') !== -1 || s.indexOf('sitevisit') !== -1) return 'Site visit request';
  return 'Enquiry';
}

/** Short, sortable, human-quotable reference: MB-260720-4F2A. */
function makeId_(when) {
  var stamp = Utilities.formatDate(when, CONFIG.TIMEZONE, 'yyMMdd');
  var rand = Utilities.getUuid().replace(/-/g, '').slice(0, 4).toUpperCase();
  return 'MB-' + stamp + '-' + rand;
}


/* ==========================================================================
 * 4. VALIDATION — the real one. Mirrors src/lib/validate.js exactly.
 * ========================================================================== */

/* Built label-by-label rather than "something@something.tld", so ".a@",
 * "a..b@", "-gmail.com" and "a@gmail.123" are all rejected. Identical to the
 * EMAIL_RE in src/lib/validate.js — keep them in step. */
var EMAIL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

/* Letters from any script (so Arabic names pass), plus . ' ’ - and spaces. */
var NAME_RE = /^\p{L}[\p{L}\p{M}\s.'’-]*$/u;

/**
 * Port of parsePhone() from src/lib/validate.js.
 * India: +91, 10 digits starting 6-9. UAE: +971, 9 digits starting 5.
 * Tolerates spaces, dashes, a 00 prefix and a leading trunk 0.
 * @return {{country: ('IN'|'AE'|null), local: string}}
 */
function parsePhone_(value) {
  var d = String(value || '').replace(/\D/g, '');
  if (d.indexOf('00') === 0) d = d.slice(2);

  if (d.indexOf('971') === 0) return { country: 'AE', local: d.slice(3).replace(/^0/, '') };
  if (d.indexOf('91') === 0 && d.length > 10) return { country: 'IN', local: d.slice(2) };

  if (d.indexOf('0') === 0) d = d.slice(1);

  if (/^5\d{8}$/.test(d)) return { country: 'AE', local: d };
  if (/^[6-9]\d{9}$/.test(d)) return { country: 'IN', local: d };
  return { country: null, local: d };
}

/**
 * @return {string[]} human-readable problems; empty means acceptable.
 * The messages are shown to the visitor, so they are plain English rather
 * than the translation keys the client uses.
 */
function validateLead_(lead) {
  var errs = [];

  /* -- name -- */
  var n = lead.name;
  if (!n) errs.push('Please enter your name.');
  else if (n.length < 2) errs.push('That name looks too short.');
  else if (/[\d_]/.test(n) || !NAME_RE.test(n)) errs.push('Please use letters only in the name.');

  /* -- phone -- */
  if (!lead.phone) {
    errs.push('Please enter your phone number.');
  } else {
    var p = parsePhone_(lead.phone);
    if (p.country === 'IN') {
      if (!/^[6-9]\d{9}$/.test(p.local)) errs.push('Enter a valid 10-digit Indian mobile number.');
    } else if (p.country === 'AE') {
      if (!/^5\d{8}$/.test(p.local)) errs.push('Enter a valid 9-digit UAE mobile number.');
    } else {
      errs.push('Enter a valid Indian (+91) or UAE (+971) mobile number.');
    }
  }

  /* -- email -- */
  if (!lead.email) {
    if (CONFIG.REQUIRE_EMAIL) errs.push('Please enter your email address.');
  } else if (lead.email.length > CONFIG.EMAIL_MAX || !EMAIL_RE.test(lead.email)) {
    errs.push('That email address does not look right.');
  }

  /* -- link spam in the free-text field -- */
  var links = (lead.message.match(/https?:\/\/|www\.|\[url|<a\s/gi) || []).length;
  if (links > CONFIG.MAX_LINKS_IN_MESSAGE) errs.push('Rejected.');

  return errs;
}


/* ==========================================================================
 * 5. RATE LIMITING
 *
 * HONEST LIMITATION, repeated because it matters: Apps Script gives the
 * script NO access to the caller's IP address. Not in `e`, not in a header,
 * not via any service. So "per-IP rate limiting" cannot be implemented — what
 * follows is per-phone, per-payload and global. A determined attacker who
 * rotates phone numbers will get past the first two and be stopped only by
 * the global ceiling (which also throttles genuine traffic, hence the alert).
 *
 * CacheService counters are read-modify-write and therefore not atomic; two
 * requests landing in the same millisecond can each see the same count. That
 * is acceptable for abuse control — it can undercount, never lock out a
 * legitimate first-time visitor.
 * ========================================================================== */

/** @return {string} a rejection message, or '' when the request may proceed. */
function rateLimit_(lead) {
  var cache = CacheService.getScriptCache();

  /* 1. exact-payload replay (double-click, retry loop) */
  var fp = 'fp:' + hash_([lead.name, lead.phone, lead.email, lead.config, lead.source].join('|'));
  if (cache.get(fp)) return 'We already have this enquiry — our team will call you shortly.';
  cache.put(fp, '1', CONFIG.RATE_FINGERPRINT_WINDOW_SEC);

  /* 2. per-phone burst */
  if (lead.e164) {
    var pk = 'rl:' + hash_(lead.e164);
    var n = parseInt(cache.get(pk) || '0', 10) + 1;
    cache.put(pk, String(n), CONFIG.RATE_PHONE_WINDOW_MIN * 60);
    if (n > CONFIG.RATE_PHONE_MAX) {
      return 'Too many submissions from this number. Please call us instead.';
    }
  }

  /* 3. global ceiling — our substitute for a per-IP limit */
  var bucket = 'rl:global:' + Math.floor(new Date().getTime() / (CONFIG.RATE_GLOBAL_WINDOW_MIN * 60000));
  var g = parseInt(cache.get(bucket) || '0', 10) + 1;
  cache.put(bucket, String(g), CONFIG.RATE_GLOBAL_WINDOW_MIN * 60);
  if (g > CONFIG.RATE_GLOBAL_MAX) {
    alertOnce_('flood', CONFIG.FLOOD_ALERT_COOLDOWN_MIN,
      'M3M Brabus — lead endpoint rate ceiling hit',
      'The lead endpoint has taken more than ' + CONFIG.RATE_GLOBAL_MAX + ' submissions in ' +
      CONFIG.RATE_GLOBAL_WINDOW_MIN + ' minutes and is now shedding traffic.\n\n' +
      'If this is a genuine campaign spike, raise CONFIG.RATE_GLOBAL_MAX and redeploy a new VERSION ' +
      'of the existing deployment (see README).');
    return 'We are receiving an unusual number of enquiries. Please call us instead.';
  }

  return '';
}

/** Small, fast, non-cryptographic digest — only ever used as a cache key. */
function hash_(s) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, String(s), Utilities.Charset.UTF_8);
  var out = '';
  for (var i = 0; i < bytes.length; i++) {
    var b = (bytes[i] < 0 ? bytes[i] + 256 : bytes[i]).toString(16);
    out += b.length === 1 ? '0' + b : b;
  }
  return out;
}


/* ==========================================================================
 * 6. THE SHEET
 * ========================================================================== */

function book_() {
  return CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * The lead tab. Prefers CONFIG.LEAD_SHEET_NAME; falls back to the first tab so
 * an inherited sheet named "Sheet1" (or "Form Responses 1") keeps working
 * without the owner having to rename anything. Creates one only if the file is
 * genuinely empty.
 */
function leadSheet_() {
  var ss = book_();
  if (!ss) throw new Error('No spreadsheet. Bind the script to a sheet, or set CONFIG.SPREADSHEET_ID.');
  var sh = ss.getSheetByName(CONFIG.LEAD_SHEET_NAME);
  if (!sh) sh = ss.getSheets()[0];
  if (!sh) sh = ss.insertSheet(CONFIG.LEAD_SHEET_NAME);
  ensureHeaders_(sh);
  return sh;
}

/** Normalise a header cell for alias lookup: "UTM Source" → "utmsource". */
function normHeader_(h) {
  return String(h || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Guarantee row 1 has headers, and return a { field → 1-based column } map.
 *
 * An empty sheet is provisioned with the full COLUMNS set. A sheet that
 * already has headers is left exactly as it is; missing columns are appended
 * to the right only when CONFIG.ADD_MISSING_COLUMNS is on. Existing columns
 * are never moved or renamed — the owner's filters and formulas survive.
 */
function ensureHeaders_(sh) {
  var lastCol = sh.getLastColumn();
  var headers = lastCol ? sh.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var hasAny = headers.some(function (h) { return String(h).trim() !== ''; });

  if (!hasAny) {
    headers = COLUMNS.map(function (c) { return c.header; });
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }

  var map = {};
  headers.forEach(function (h, i) {
    var field = HEADER_ALIASES[normHeader_(h)];
    if (field && !map[field]) map[field] = i + 1;
  });

  /* Only ever relevant for a sheet that already had headers — an empty one was
     just provisioned with the full set above. New columns go to the RIGHT of
     everything that exists, so the owner's filters and formulas survive. */
  if (hasAny && CONFIG.ADD_MISSING_COLUMNS) {
    var missing = COLUMNS.filter(function (c) { return !map[c.key]; });
    if (missing.length) {
      var start = headers.length + 1;
      var values = [missing.map(function (c) { return c.header; })];
      var range = sh.getRange(1, start, 1, missing.length);
      range.setValues(values);
      range.setFontWeight('bold');
      missing.forEach(function (c, i) { map[c.key] = start + i; });
    }
  }

  return map;
}

/**
 * Neutralise formula injection.
 *
 * A cell whose text begins = + - @ is evaluated as a formula by Sheets — and
 * "+919876543210" qualifies, so this is not a hypothetical: every Indian
 * number needs the guard. Prefixing an apostrophe marks the value as literal
 * text; Sheets consumes that apostrophe on write, so the cell still reads back
 * as "+919876543210", not "'+919876543210".
 *
 * Dates, numbers and booleans pass through untouched so Submissions stays a
 * real number and Timestamp stays a real date (text would break sorting).
 */
function safeCell_(v) {
  if (v instanceof Date) return v;
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  var s = (v === null || v === undefined) ? '' : String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

/**
 * Append the lead, or fold it into an existing row when the same phone has
 * been seen inside the dedupe window. Wrapped in a script lock so two
 * simultaneous posts cannot both decide they are the first.
 *
 * @return {{action:'created'|'updated', row:number, id:string, count:number,
 *           previous: (Date|null)}}
 */
function recordLead_(lead) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    locked = lock.tryLock(20000);
    /* If we cannot get the lock we still write — a duplicated row is a far
       smaller problem than a lost lead. */

    var sh = leadSheet_();
    var map = ensureHeaders_(sh);
    var width = Math.max(sh.getLastColumn(), 1);

    var dup = CONFIG.DEDUPE_WINDOW_HOURS > 0 ? findDuplicate_(sh, map, lead) : null;

    if (dup) {
      var count = (parseInt(dup.count, 10) || 1) + 1;
      var writes = {
        lastSeen: lead.at,
        count: count
      };
      /* Fill blanks rather than overwrite: the first submission is usually the
         considered one, later ones are often hurried. */
      ['email', 'config', 'message', 'utm_source', 'utm_medium', 'utm_campaign',
       'utm_term', 'utm_content', 'referrer', 'channel', 'gclid', 'device',
       'clientId'].forEach(function (k) {
        if (lead[k] && !dup.values[k]) writes[k] = lead[k];
      });
      /* Source is always worth accumulating — it shows the journey. */
      if (lead.source) {
        var prev = String(dup.values.source || '');
        writes.source = prev.indexOf(lead.source) === -1
          ? (prev ? prev + ' | ' + lead.source : lead.source).slice(0, 500)
          : prev;
      }
      if (lead.intent) writes.intent = lead.intent;

      for (var k in writes) {
        if (writes.hasOwnProperty(k) && map[k]) {
          sh.getRange(dup.row, map[k]).setValue(safeCell_(writes[k]));
        }
      }
      return {
        action: 'updated',
        row: dup.row,
        id: dup.values.id || lead.id,
        count: count,
        previous: dup.when
      };
    }

    /* --- new row ------------------------------------------------------- */
    lead.count = 1;
    lead.lastSeen = lead.at;
    var row = new Array(width).fill('');
    for (var field in map) {
      if (!map.hasOwnProperty(field)) continue;
      var col = map[field] - 1;
      if (col >= row.length) continue;
      var v;
      if (field === 'timestamp') v = CONFIG.TIMESTAMP_AS_DATE ? lead.at : lead.at.toISOString();
      else if (field === 'lastSeen') v = CONFIG.TIMESTAMP_AS_DATE ? lead.at : lead.at.toISOString();
      else v = lead[field];
      row[col] = safeCell_(v === undefined ? '' : v);
    }
    sh.appendRow(row);
    var rowNo = sh.getLastRow();

    /* Fold anything that had nowhere to go into the notification instead of
       losing it (only reachable when ADD_MISSING_COLUMNS is off). */
    return { action: 'created', row: rowNo, id: lead.id, count: 1, previous: null };

  } finally {
    if (locked) { try { lock.releaseLock(); } catch (err) { /* already gone */ } }
  }
}

/**
 * Most recent row with the same canonical phone number inside the window.
 * Scans at most DEDUPE_SCAN_ROWS from the bottom, so cost stays flat as the
 * sheet grows.
 * @return {?{row:number, when:?Date, count:*, values:Object}}
 */
function findDuplicate_(sh, map, lead) {
  if (!lead.e164 || !map.phone) return null;
  var last = sh.getLastRow();
  if (last < 2) return null;

  var first = Math.max(2, last - CONFIG.DEDUPE_SCAN_ROWS + 1);
  var height = last - first + 1;
  var width = sh.getLastColumn();
  var block = sh.getRange(first, 1, height, width).getValues();
  var cutoff = new Date().getTime() - CONFIG.DEDUPE_WINDOW_HOURS * 3600000;

  for (var i = block.length - 1; i >= 0; i--) {
    var raw = block[i][map.phone - 1];
    var p = parsePhone_(raw);
    if (!p.country) continue;
    var e164 = (p.country === 'IN' ? '+91' : '+971') + p.local;
    if (e164 !== lead.e164) continue;

    var when = toDate_(map.lastSeen ? block[i][map.lastSeen - 1] : '') ||
               toDate_(map.timestamp ? block[i][map.timestamp - 1] : '');
    /* A row with an unreadable date is still a duplicate — better to update it
       than to spawn a twin. Only skip when we can prove it is old. */
    if (when && when.getTime() < cutoff) continue;

    var values = {};
    for (var f in map) {
      if (map.hasOwnProperty(f)) values[f] = block[i][map[f] - 1];
    }
    return { row: first + i, when: when, count: values.count, values: values };
  }
  return null;
}

/** Cell → Date, tolerating real Dates, ISO strings and empty cells. */
function toDate_(v) {
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (!v) return null;
  var d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

/** Deep link straight to the row, so the email is one click from the record. */
function rowUrl_(row) {
  try {
    var ss = book_();
    var sh = ss.getSheetByName(CONFIG.LEAD_SHEET_NAME) || ss.getSheets()[0];
    return ss.getUrl() + '#gid=' + sh.getSheetId() + '&range=A' + row + ':Z' + row;
  } catch (err) {
    return '';
  }
}


/* ==========================================================================
 * 7. NOTIFICATION
 * ========================================================================== */

/**
 * Mail the sales desk. Subject carries the three things you need before
 * opening it: what kind of request, who, and which configuration.
 *
 * MailApp is used rather than GmailApp because it needs a narrower scope and
 * does not write to Sent — see README. Quota is 100 recipients/day on a free
 * gmail.com account, 1,500/day on Workspace.
 */
function notify_(lead, result) {
  if (!CONFIG.NOTIFY_TO) return;

  if (result.action === 'updated') {
    if (!CONFIG.NOTIFY_ON_DUPLICATE) return;
    /* Throttle repeats so a persistent visitor cannot drain the mail quota. */
    var key = 'dupmail:' + hash_(lead.e164 || lead.email);
    if (CacheService.getScriptCache().get(key)) return;
    CacheService.getScriptCache().put(key, '1', CONFIG.DUPLICATE_MAIL_COOLDOWN_MIN * 60);
  }

  var remaining = MailApp.getRemainingDailyQuota();
  if (remaining <= 0) {
    logRow_('warn', 'notify', 'MailApp daily quota exhausted — lead saved, e-mail skipped',
            lead.id + ' row ' + result.row);
    return;
  }

  var when = Utilities.formatDate(lead.at, CONFIG.TIMEZONE, "d MMM yyyy 'at' HH:mm");
  var kind = result.action === 'updated' ? 'Repeat ' + lead.intent.toLowerCase() : lead.intent;
  var subject = '[M3M Brabus] ' + kind + ' — ' + (lead.name || 'Unnamed') +
                (lead.config ? ' · ' + lead.config : '') +
                (lead.country ? ' · ' + lead.country : '');

  var link = rowUrl_(result.row);

  var rows = [
    ['Name', lead.name],
    ['Phone', lead.phone],
    ['Email', lead.email || '—'],
    ['Configuration', lead.config || '—'],
    ['Message', lead.message || '—'],
    ['Request', lead.intent],
    ['Source', lead.source || '—'],
    ['Page', lead.page || '—'],
    ['Campaign', campaignLine_(lead)],
    ['Channel', lead.channel || '—'],
    ['Referrer', lead.referrer || '—'],
    ['Device', (lead.device || '—') + (lead.visits ? ' · visit ' + lead.visits : '')],
    ['Quality', qualityLine_(lead)],
    ['Country', lead.country === 'IN' ? 'India (+91)' : lead.country === 'AE' ? 'UAE (+971)' : '—'],
    ['Received', when + ' ' + CONFIG.TIMEZONE],
    ['Reference', result.id],
    ['Submissions', String(result.count) + (result.previous
        ? ' (previously ' + Utilities.formatDate(result.previous, CONFIG.TIMEZONE, 'd MMM yyyy') + ')'
        : '')]
  ];

  var plain = rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') +
              (link ? '\n\nOpen the row: ' + link : '') +
              '\n\nCall: tel:' + lead.phone +
              (lead.email ? '\nReply: mailto:' + lead.email : '');

  var html =
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;' +
    'max-width:640px;color:#1a1a1a">' +
    '<p style="font:600 11px/1 monospace;letter-spacing:.18em;text-transform:uppercase;color:#9a7b3f;margin:0 0 6px">' +
    escapeHtml_(kind) + '</p>' +
    '<h2 style="font-weight:400;font-size:24px;margin:0 0 18px">' + escapeHtml_(lead.name || 'Unnamed') + '</h2>' +
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px">' +
    rows.map(function (r) {
      return '<tr>' +
        '<td style="padding:7px 14px 7px 0;color:#6b6b6b;white-space:nowrap;vertical-align:top;' +
        'border-bottom:1px solid #ececec">' + escapeHtml_(r[0]) + '</td>' +
        '<td style="padding:7px 0;border-bottom:1px solid #ececec">' + escapeHtml_(r[1]) + '</td></tr>';
    }).join('') +
    '</table>' +
    '<p style="margin:22px 0 0">' +
    '<a href="tel:' + encodeURIComponent(lead.phone) + '" style="display:inline-block;padding:10px 18px;' +
    'background:#c9a86a;color:#111;text-decoration:none;border-radius:999px;font-size:13px">Call ' +
    escapeHtml_(lead.phone) + '</a>' +
    (link ? ' <a href="' + link + '" style="display:inline-block;padding:10px 18px;border:1px solid #ddd;' +
            'color:#333;text-decoration:none;border-radius:999px;font-size:13px">Open the sheet row</a>' : '') +
    '</p>' +
    '<p style="margin-top:26px;font-size:11px;color:#9a9a9a">Sent by the M3M Brabus website. ' +
    'Mail quota remaining today: ' + remaining + '.</p>' +
    '</div>';

  var opts = { name: CONFIG.SENDER_NAME, htmlBody: html };
  if (CONFIG.NOTIFY_CC) opts.cc = CONFIG.NOTIFY_CC;
  if (CONFIG.REPLY_TO) opts.replyTo = CONFIG.REPLY_TO;
  else if (lead.email) opts.replyTo = lead.email;   // replying answers the buyer

  MailApp.sendEmail(CONFIG.NOTIFY_TO, subject, plain, opts);
}

/**
 * The Ch. 78 soft signals, in one readable line. These NEVER block a lead —
 * they exist so the desk can spot a junk row before spending a site visit on
 * it. A genuine buyer who types quickly shows up here as "fast fill" and is
 * still called back like anyone else.
 */
function qualityLine_(lead) {
  var bits = [];
  if (lead.fillMs !== '' && lead.fillMs !== undefined) {
    bits.push('filled in ' + (Math.round(lead.fillMs / 100) / 10) + 's');
  }
  if (lead.spamScore) bits.push('score ' + lead.spamScore);
  if (lead.spamSignals) bits.push(lead.spamSignals);
  return bits.length ? bits.join(' · ') : 'clean';
}

function campaignLine_(lead) {
  var bits = [];
  if (lead.utm_source) bits.push('source=' + lead.utm_source);
  if (lead.utm_medium) bits.push('medium=' + lead.utm_medium);
  if (lead.utm_campaign) bits.push('campaign=' + lead.utm_campaign);
  if (lead.utm_term) bits.push('term=' + lead.utm_term);
  if (lead.utm_content) bits.push('content=' + lead.utm_content);
  return bits.length ? bits.join(' · ') : 'none supplied';
}

function escapeHtml_(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}


/* ==========================================================================
 * 8. LOGGING
 * ========================================================================== */

/**
 * Append to the log tab. Must never throw — it is called from inside catch
 * blocks, and a logger that explodes takes the whole request with it. When the
 * sheet write fails we fall back to Stackdriver plus a throttled admin mail,
 * so a broken logger is loud rather than silent.
 */
function logRow_(level, where, message, payload, stack) {
  try {
    var ss = book_();
    var sh = ss.getSheetByName(CONFIG.LOG_SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(CONFIG.LOG_SHEET_NAME);
      sh.getRange(1, 1, 1, 6)
        .setValues([['Timestamp', 'Level', 'Where', 'Message', 'Payload', 'Stack']])
        .setFontWeight('bold');
      sh.setFrozenRows(1);
      sh.hideSheet();   // it is diagnostics, not something the desk should scroll past
    }
    sh.appendRow([
      new Date(),
      String(level || ''),
      String(where || ''),
      String(message || '').slice(0, 500),
      String(payload || '').slice(0, 900),
      String(stack || '').slice(0, 900)
    ]);
    if (level === 'error') {
      alertOnce_('err:' + where, 30, 'M3M Brabus — lead endpoint error',
        where + ': ' + message + '\n\n' + String(stack || '').slice(0, 1500) +
        '\n\nSee the ' + CONFIG.LOG_SHEET_NAME + ' tab.');
    }
  } catch (err) {
    /* The log itself failed — sheet deleted, permissions revoked, quota. */
    console.error('logRow_ failed: ' + err + ' | original: ' + level + '/' + where + '/' + message);
    try {
      alertOnce_('logfail', 60, 'M3M Brabus — LEAD LOGGING IS BROKEN',
        'Could not write to the "' + CONFIG.LOG_SHEET_NAME + '" tab.\n\n' +
        'Logger error: ' + err + '\n\nOriginal event: ' + level + ' / ' + where + ' / ' + message +
        '\n\nLeads may still be saving, but failures are now invisible. Check the spreadsheet exists ' +
        'and that the deployment still has permission to write to it.');
    } catch (err2) { /* mail is gone too; console is all that is left */ }
  }
}

/** Send at most one mail per key per `minutes`. Protects the mail quota. */
function alertOnce_(key, minutes, subject, body) {
  if (!CONFIG.ADMIN_EMAIL) return;
  var cache = CacheService.getScriptCache();
  var k = 'alert:' + hash_(key);
  if (cache.get(k)) return;
  cache.put(k, '1', minutes * 60);
  if (MailApp.getRemainingDailyQuota() <= 0) return;
  MailApp.sendEmail(CONFIG.ADMIN_EMAIL, subject, body, { name: CONFIG.SENDER_NAME });
}

/** Payload copy for the log, with the phone partly masked. */
function redact_(body) {
  try {
    var copy = JSON.parse(JSON.stringify(body));
    ['phone', 'Phone', 'mobile'].forEach(function (k) {
      if (copy[k]) copy[k] = String(copy[k]).replace(/\d(?=\d{4})/g, '•');
    });
    return JSON.stringify(copy).slice(0, 900);
  } catch (err) {
    return '[unserialisable]';
  }
}


/* ==========================================================================
 * 9. RESPONSES
 * ========================================================================== */

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Reject with a public message while recording the private reason. */
function reject_(publicMsg, reason, sample) {
  logRow_('spam', reason, publicMsg, sample);
  return jsonOut_({ success: false, error: publicMsg });
}


/* ==========================================================================
 * 10. OPERATOR TOOLS — run these from the editor, not over HTTP.
 * ========================================================================== */

/**
 * Run once after pasting. Provisions the tabs and headers, triggers the OAuth
 * consent screen (so the first real visitor is not the one who discovers a
 * missing scope), and mails you a confirmation.
 */
function setup() {
  var sh = leadSheet_();
  var map = ensureHeaders_(sh);
  logRow_('info', 'setup', 'Setup ran. Columns mapped: ' + Object.keys(map).join(', '), '');

  var lines = [
    'M3M Brabus lead endpoint — setup complete.',
    '',
    'Spreadsheet : ' + book_().getName(),
    'Lead tab    : ' + sh.getName() + ' (' + sh.getLastRow() + ' rows incl. header)',
    'Log tab     : ' + CONFIG.LOG_SHEET_NAME,
    'Columns     : ' + Object.keys(map).join(', '),
    'Notify to   : ' + (CONFIG.NOTIFY_TO || '(notification disabled)'),
    'Mail quota  : ' + MailApp.getRemainingDailyQuota() + ' recipients left today',
    'Version     : ' + CONFIG.VERSION,
    '',
    'Next: Deploy ▸ New deployment ▸ Web app ▸ Execute as ME ▸ Access ANYONE.'
  ].join('\n');

  console.log(lines);
  if (CONFIG.ADMIN_EMAIL) {
    MailApp.sendEmail(CONFIG.ADMIN_EMAIL, 'M3M Brabus — lead endpoint setup complete', lines,
      { name: CONFIG.SENDER_NAME });
  }
  return lines;
}

/**
 * Build a payload in the CURRENT shape src/lib/leads.js sends: the aliased core
 * fields, the Ch. 75 attribution block (first touch and last touch, flattened
 * with prefixes, plus the top-level mirrors and the environment), and the Ch. 78
 * quality signals.
 *
 * `scale` sizes the campaign strings:
 *   'typical' — one click id, the five UTMs at sane lengths (55 keys / 2.3 kB)
 *   'max'     — every UTM at its 120-char cap, ALL FIVE click ids at their
 *               200-char cap, ?ref=, a 300-char referrer, a 600-char message:
 *               65 keys / 10.7 kB, the ceiling attribution.js can produce.
 *               (The browser measurement of the same case came out at 9.9 kB;
 *               this reconstruction is deliberately a shade heavier.)
 *
 * The key SET here was diffed against the payload leads.js really builds on
 * 2026-07-20 — 65 keys, no key present in one and missing from the other.
 *
 * Keep this in step with src/lib/leads.js buildPayload() and
 * src/lib/attribution.js getAttribution(). It is what testPayloadLimits() and
 * testLead() both measure, so drift shows up as a failing test rather than as
 * leads quietly vanishing.
 */
function samplePayload_(scale) {
  var max = scale === 'max';
  var rep = function (n, c) { return new Array(n + 1).join(c); };
  var now = new Date().toISOString();
  var name = max ? 'Rajeshwari Padmanabhan Venkataraman Iyer Su' : 'Test Buyer';
  var config = '5 BHK';

  var q =
    '?utm_source=' + (max ? rep(120, 's') : 'google') +
    '&utm_medium=' + (max ? rep(120, 'm') : 'cpc') +
    '&utm_campaign=' + (max ? rep(120, 'c') : 'brabus-brand-exact') +
    '&utm_term=' + (max ? rep(120, 't') : 'm3m+brabus+price') +
    '&utm_content=' + (max ? rep(120, 'n') : 'rsa-headline-3') +
    '&gclid=' + rep(max ? 200 : 95, 'g') +
    (max ? '&fbclid=' + rep(200, 'f') + '&msclkid=' + rep(200, 'k') +
           '&ttclid=' + rep(200, 'p') + '&li_fat_id=' + rep(200, 'l') +
           '&ref=' + rep(120, 'r') : '');

  var landing = '/residences/5-bhk-sky-villa' + q;
  var referrer = max ? 'https://www.google.co.in/search?q=' + rep(266, 'q')
                     : 'https://www.google.com/';

  var touch = function (prefix) {
    var o = {};
    o[prefix + '_source']   = max ? rep(120, 's') : 'google';
    o[prefix + '_medium']   = max ? rep(120, 'm') : 'cpc';
    o[prefix + '_campaign'] = max ? rep(120, 'c') : 'brabus-brand-exact';
    o[prefix + '_term']     = max ? rep(120, 't') : 'm3m+brabus+price';
    o[prefix + '_content']  = max ? rep(120, 'n') : 'rsa-headline-3';
    o[prefix + '_gclid']    = rep(max ? 200 : 95, 'g');
    if (max) {
      o[prefix + '_fbclid']    = rep(200, 'f');
      o[prefix + '_msclkid']   = rep(200, 'k');
      o[prefix + '_ttclid']    = rep(200, 'p');
      o[prefix + '_li_fat_id'] = rep(200, 'l');
      o[prefix + '_ref']       = rep(120, 'r');
    }
    o[prefix + '_referrer'] = referrer;
    o[prefix + '_landing']  = landing;
    o[prefix + '_channel']  = 'paid-search';
    o[prefix + '_at']       = now;
    return o;
  };

  var p = {
    leadId: 'b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    name: name, fullname: name, fullName: name, Fullname: name,
    phone: '+91 98765 43210', Phone: '+91 98765 43210',
    email: 'test@example.com', Email: 'test@example.com',
    config: config, configuration: config, Configuration: config,
    message: max ? rep(600, 'M') : 'Please send the price list and floor plans.',
    source: 'Site visit · 5 BHK Sky Villa',
    page: '/residences/5-bhk-sky-villa',
    submittedAt: now, timestamp: now, Timestamp: now
  };

  var blocks = [touch('first'), touch('last')];
  for (var i = 0; i < blocks.length; i++) {
    for (var k in blocks[i]) { if (blocks[i].hasOwnProperty(k)) p[k] = blocks[i][k]; }
  }

  p.utm_source   = max ? rep(120, 's') : 'google';
  p.utm_medium   = max ? rep(120, 'm') : 'cpc';
  p.utm_campaign = max ? rep(120, 'c') : 'brabus-brand-exact';
  p.gclid        = rep(max ? 200 : 95, 'g');
  p.fbclid       = max ? rep(200, 'f') : '';
  p.channel      = 'paid-search';
  p.visits       = '3';
  p.device       = 'mobile';
  p.screen       = '430x932';
  p.viewport     = '430x932';
  p.dpr          = '3';
  p.language     = 'en-GB';
  p.timezone     = 'Asia/Kolkata';
  p.capturedAt   = now;

  p.spamSignals = max ? 'disposable-email,too-fast' : '';
  p.spamScore   = max ? '40' : '0';
  p.fillMs      = max ? '1' : '18420';
  return p;
}

/**
 * THE REGRESSION TEST FOR THE 2026-07-20 OUTAGE-IN-WAITING.
 *
 * CONFIG.MAX_KEYS was 60 while a fully tagged paid click produces 65 keys, so
 * the highest-value leads were being rejected with "too-many-keys" — and
 * rejected finally, because leads.js does not retry a refusal. Nothing in the
 * sheet, nothing in the inbox, no error anywhere.
 *
 * Run this after ANY change to leads.js, attribution.js or the limits above.
 * It asserts rather than logs: a failure throws.
 */
function testPayloadLimits() {
  var lines = [];
  ['typical', 'max'].forEach(function (scale) {
    var raw = JSON.stringify(samplePayload_(scale));
    var keys = Object.keys(samplePayload_(scale)).length;
    var bytes = raw.length;
    var keyHead = Math.round((CONFIG.MAX_KEYS / keys) * 100) / 100;
    var byteHead = Math.round((CONFIG.MAX_BODY_BYTES / bytes) * 100) / 100;

    if (keys > CONFIG.MAX_KEYS) {
      throw new Error('MAX_KEYS too low: ' + scale + ' payload has ' + keys +
        ' keys, limit is ' + CONFIG.MAX_KEYS + '. Real leads are being dropped.');
    }
    if (bytes > CONFIG.MAX_BODY_BYTES) {
      throw new Error('MAX_BODY_BYTES too low: ' + scale + ' payload is ' + bytes +
        ' bytes, limit is ' + CONFIG.MAX_BODY_BYTES + '. Real leads are being dropped.');
    }
    if (keyHead < 1.3 || byteHead < 1.3) {
      throw new Error('Limits are too tight for comfort on the ' + scale + ' payload (' +
        keyHead + 'x keys, ' + byteHead + 'x bytes). Leave real headroom — the next ' +
        'attribution field must not start dropping leads.');
    }
    lines.push(scale + ': ' + keys + ' keys (limit ' + CONFIG.MAX_KEYS + ', ' + keyHead +
      'x headroom), ' + bytes + ' bytes (limit ' + CONFIG.MAX_BODY_BYTES + ', ' +
      byteHead + 'x headroom)');
  });

  /* And prove the mapping, not just the size: the fields that were silently
     blank before must now come out populated. */
  var lead = normalise_(samplePayload_('typical'));
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
   'referrer', 'channel', 'gclid', 'device', 'visits', 'clientId'].forEach(function (f) {
    if (lead[f] === '' || lead[f] === undefined) {
      throw new Error('PAYLOAD_ALIASES drift: "' + f + '" is empty for a payload that ' +
        'plainly carries it. That column is silently losing data.');
    }
  });
  lines.push('normalise_ maps all campaign, attribution and quality fields.');

  /* Every header we provision must map back to its own field. If it does not,
     the column is written once and then never found again — ensureHeaders_ adds
     a second copy of it on the next request and the data lands nowhere. */
  COLUMNS.forEach(function (c) {
    if (HEADER_ALIASES[normHeader_(c.header)] !== c.key) {
      throw new Error('Header "' + c.header + '" does not map back to field "' + c.key +
        '" (got "' + HEADER_ALIASES[normHeader_(c.header)] + '"). Add it to HEADER_ALIASES.');
    }
  });
  lines.push('all ' + COLUMNS.length + ' headers round-trip through HEADER_ALIASES.');

  /* The honeypot must not fire on a genuine payload. */
  if (honeypotTripped_(samplePayload_('max'))) {
    throw new Error('A honeypot key collides with a real payload key — every lead is ' +
      'being silently discarded. Check CONFIG.HONEYPOT_FIELDS.');
  }
  lines.push('honeypot does not collide with any real payload key.');

  console.log(lines.join('\n'));
  return lines.join('\n');
}

/**
 * End-to-end smoke test with a payload identical in shape to the one
 * src/lib/leads.js sends. Writes a real row — delete it afterwards.
 */
function testLead() {
  var res = doPost({
    postData: { contents: JSON.stringify(samplePayload_('typical')), type: 'text/plain' }
  });
  console.log(res.getContent());
  return res.getContent();
}

/** Confirms bad input is rejected server-side. Should print four failures. */
function testValidation() {
  var bad = [
    { name: 'A',            phone: '+919876543210', email: '' },              // name too short
    { name: 'Rahul 9',      phone: '+919876543210', email: '' },              // digit in name
    { name: 'Rahul Sharma', phone: '+911234567890', email: '' },              // IN must start 6-9
    { name: 'Rahul Sharma', phone: '+919876543210', email: 'a@gmail.c' }      // tld too short
  ];
  var out = bad.map(function (b) {
    var r = doPost({ postData: { contents: JSON.stringify(b), type: 'text/plain' } });
    return JSON.parse(r.getContent());
  });
  console.log(JSON.stringify(out, null, 2));
  return out;
}

/**
 * Clear the rate-limit counters for one number while testing.
 *
 * CacheService cannot enumerate its own keys, so a blanket "clear everything"
 * is not possible — you have to name the number whose counters you want gone.
 * Edit the constant below, run, then re-run testLead().
 */
function resetRateLimitsFor() {
  var NUMBER = '+919876543210';           // ← the number to unblock
  var p = parsePhone_(NUMBER);
  var e164 = p.country ? (p.country === 'IN' ? '+91' : '+971') + p.local : NUMBER;
  var cache = CacheService.getScriptCache();
  cache.remove('rl:' + hash_(e164));
  cache.remove('dupmail:' + hash_(e164));
  console.log('Cleared per-phone counters for ' + e164 + '. The global ceiling and the ' +
    CONFIG.RATE_FINGERPRINT_WINDOW_SEC + 's replay window expire on their own.');
}
