/**
 * Deduplication helper using event signatures and short-lived execution locks.
 */

const recentEvents = new Map<string, number>();
const DEDUP_WINDOW_MS = 500; // 500ms deduplication window

export function shouldEmitEvent(eventSignature: string): boolean {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  const lastEmitted = recentEvents.get(eventSignature);

  // Clean old entries (> 10s)
  if (recentEvents.size > 100) {
    recentEvents.forEach((timestamp, key) => {
      if (now - timestamp > 10000) {
        recentEvents.delete(key);
      }
    });
  }

  if (lastEmitted && now - lastEmitted < DEDUP_WINDOW_MS) {
    return false;
  }

  recentEvents.set(eventSignature, now);
  return true;
}
