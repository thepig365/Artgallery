/**
 * Site-wide configuration constants.
 * Single source of truth for contact and display values.
 */

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "gallery@bayviewhub.me";
