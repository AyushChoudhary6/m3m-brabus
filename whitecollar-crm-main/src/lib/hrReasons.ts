// Structured rejection/decline reasons (audit #111) + compensation currencies
// (audit #137). Isomorphic — used by the client picker and (for validation) the API.

export const REJECTION_REASONS: { key: string; label: string }[] = [
  { key: "LOW_COMMUNICATION", label: "Weak communication" },
  { key: "INSUFFICIENT_EXPERIENCE", label: "Insufficient / irrelevant experience" },
  { key: "FAILED_ASSESSMENT", label: "Failed interview / assessment" },
  { key: "CULTURE_FIT", label: "Culture-fit concern" },
  { key: "HIGH_SALARY_EXPECTATION", label: "Salary expectation too high" },
  { key: "LOCATION_MISMATCH", label: "Location mismatch" },
  { key: "OFFER_DECLINED_COMPENSATION", label: "Offer declined — compensation" },
  { key: "OFFER_DECLINED_OTHER_OFFER", label: "Offer declined — took another offer" },
  { key: "NOT_INTERESTED", label: "Candidate not interested" },
  { key: "NOT_REACHABLE", label: "Could not be reached" },
  { key: "OTHER", label: "Other" },
];
const REJECTION_KEYS = new Set(REJECTION_REASONS.map((r) => r.key));
export function isRejectionReason(v: unknown): v is string {
  return typeof v === "string" && REJECTION_KEYS.has(v);
}
export function rejectionLabel(key: string | null | undefined): string | null {
  if (!key) return null;
  return REJECTION_REASONS.find((r) => r.key === key)?.label ?? key;
}

export const CURRENCIES = ["INR", "AED"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const CURRENCY_SYMBOL: Record<string, string> = { INR: "₹", AED: "AED " };
export function isCurrency(v: unknown): v is Currency {
  return typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);
}
