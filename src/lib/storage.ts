/**
 * Safe browser storage. Private windows, blocked cookies or a full quota make localStorage throw; every read and
 * write goes through here, so a failure only means the choice lasts for this visit.
 */

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: kept for this visit only */
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* nothing stored */
  }
}

/** Parsed JSON, or `fallback()` when the key is missing, unreadable or fails `parse`. */
export function readJson<T>(key: string, fallback: () => T, parse: (raw: unknown) => T | null): T {
  const raw = readString(key);
  if (raw === null) return fallback();
  try {
    return parse(JSON.parse(raw)) ?? fallback();
  } catch {
    return fallback();
  }
}

export function writeJson(key: string, value: unknown): void {
  writeString(key, JSON.stringify(value));
}
