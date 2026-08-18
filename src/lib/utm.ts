// ------------------------------------------------------------------
// UTM tracking — captures campaign parameters on first visit, stores
// them for 30 days, and exposes them for contact submissions.
// ------------------------------------------------------------------
import { getPreference, setPreference } from "./cookies";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
] as const;

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

const UTM_STORE = "hkh_utm";
const UTM_TTL_DAYS = 30;

/** Read UTM params from the current URL and persist them. Returns stored params. */
export function captureUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const captured: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim().slice(0, 200);
    if (value) captured[key] = value;
  }
  if (Object.keys(captured).length > 0) {
    setPreference(UTM_STORE, JSON.stringify(captured), UTM_TTL_DAYS);
  }
  return getUtm();
}

/** Stored UTM params (empty object if none captured yet). */
export function getUtm(): UtmParams {
  const raw = getPreference(UTM_STORE);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    const clean: UtmParams = {};
    for (const key of UTM_KEYS) {
      const value = parsed[key];
      if (typeof value === "string" && value.trim()) clean[key] = value.slice(0, 200);
    }
    return clean;
  } catch {
    return {};
  }
}
