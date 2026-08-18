// ------------------------------------------------------------------
// Tiny preference helpers: localStorage with a Secure/SameSite cookie
// mirror, so preferences survive and are sent on secure origins only.
// ------------------------------------------------------------------

export function setPreference(name: string, value: string, maxAgeDays = 365) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(name, value);
  } catch {
    /* storage unavailable — fall through to cookie */
  }
  try {
    const isSecureContext =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${
      maxAgeDays * 86400
    }; Path=/; SameSite=Lax${isSecureContext ? "; Secure" : ""}`;
  } catch {
    /* cookies unavailable — ignore */
  }
}

export function getPreference(name: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(name);
    if (stored !== null) return stored;
  } catch {
    /* ignore */
  }
  try {
    const match = document.cookie.match(
      new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}
