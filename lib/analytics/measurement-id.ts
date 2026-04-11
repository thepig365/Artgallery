/**
 * Gallery GA4 Measurement ID (production property).
 * Legacy stream G-PWH7QF6W80 is remapped so stale Vercel env still resolves to the new ID.
 */
const LEGACY_GA_MEASUREMENT_ID = "G-PWH7QF6W80";
const CURRENT_GA_MEASUREMENT_ID = "G-YFHGJHLX36";

const raw = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const GA_MEASUREMENT_ID =
  !raw || raw === LEGACY_GA_MEASUREMENT_ID
    ? CURRENT_GA_MEASUREMENT_ID
    : raw;
