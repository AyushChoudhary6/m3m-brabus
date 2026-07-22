// In-memory rate limiter — protects login from brute-force.
// One Vercel instance per region, so per-IP+email gives ~5 attempts per 5 min per region.
// Good enough for stopping casual attacks. For nation-state, use Redis or a paid bouncer.

interface Bucket { count: number; resetAt: number; }
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 5 * 60 * 1000;   // 5 minutes
const MAX_HITS = 5;                 // 5 attempts per window per key

// Optional per-call overrides so other endpoints (e.g. HR AI resume extraction)
// can reuse the same limiter with a more lenient budget. Defaults keep login's
// original 5-per-5-min behaviour unchanged.
export function isRateLimited(key: string, maxHits = MAX_HITS, windowMs = WINDOW_MS): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfterSec: 0 };
  }
  b.count++;
  if (b.count > maxHits) {
    return { limited: true, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { limited: false, retryAfterSec: 0 };
}

// Reset on successful login so legitimate users aren't locked out
export function clearRateLimit(key: string) {
  buckets.delete(key);
}

// Periodic cleanup to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets.entries()) {
    if (b.resetAt < now) buckets.delete(k);
  }
}, 60_000).unref?.();
