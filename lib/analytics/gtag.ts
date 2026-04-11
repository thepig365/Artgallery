/**
 * GA4 via gtag.js — no-op when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset.
 */

type GaParams = Record<string, string | number | boolean | undefined>;

export function gaEvent(eventName: string, params?: GaParams): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  w.gtag("event", eventName, params ?? {});
}
