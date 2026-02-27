# Gallery Style Migration Report

**Date:** 2026-02-26  
**Scope:** Convert gallery.bayviewhub.me into a Bayview subsite matching bayviewhub.me visual system (UI only).

---

## 1. Typography Summary

| Element | Before | After |
|---------|--------|-------|
| Font stack | Geist Sans (local), Arial fallback | Inter (`--font-sans`), Cormorant Garamond (`--font-serif`) |
| Body | `font-family: Arial, Helvetica` | `font-family: var(--font-sans)` |
| Headings | (inherited) | `font-serif` (Cormorant Garamond) |
| Setup | `app/layout.tsx` local fonts | `next/font/google` Inter + Cormorant_Garamond (400/500/600) |

**Files changed:** `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`

---

## 2. Token Table (Light / Dark)

### Light (zone-gallery)

| Token | Value |
|-------|-------|
| --bg | #FAFAF8 |
| --surface | #FFFFFF |
| --surface-alt | #F5F5F3 |
| --fg | #111827 |
| --muted | #374151 |
| --subtle | #4B5563 |
| --border | #E5E7EB |
| --accent | #5EB1BF |
| --accent-hover | #3D8A96 |
| --accent-soft | #A8D5DD |

### Dark (zone-noir) — hardened tokens

| Token | Value |
|-------|-------|
| --bg | #0E1111 |
| --surface | #121616 |
| --surface-alt | #1A1F1F |
| --fg | #F9FAFB |
| --muted | #D1D5DB |
| --subtle | #9CA3AF |
| --border | #1F2A2A |
| --accent | #7FBFC8 |
| --accent-hover | #5DA8B3 |
| --accent-soft | #284446 |

---

## 3. Components Updated

### Card / GalleryCard
- Title: `text-fg`
- Body: `text-muted`
- Labels: `text-subtle`
- Border: `border-border`, hover `border-accent`
- Background: `bg-surface`, `bg-surface-alt`
- Removed heavy shadows; badge uses `border-border`

### Button
- default: `border-border text-fg hover:bg-fg hover:text-bg`
- accent: `bg-accent text-white hover:bg-accent-hover`
- ghost: `text-muted hover:text-fg hover:border-border`
- Focus: `focus-visible:outline-accent`

### Header (SiteHeader)
- Bayview logo: `/images/bayview-estate-logo.jpg`
- Logo size: `h-16 md:h-20` (gallery), `h-12 md:h-14` (noir)
- Text: "Bayview Hub" + "Art Gallery" with inline `style={{ color }}` for contrast
- Background: `bg-surface/95 backdrop-blur-sm` (gallery), `bg-surface` (noir)

### Footer (SiteFooter)
- Headings: `text-fg font-serif`
- Links: `text-muted hover:text-fg`
- Secondary links: `text-subtle hover:text-muted`
- Border: `border-border`
- Removed opacity-based text (`text-muted/70` → `text-muted`)

---

## 4. Logo Path

- **Path:** `public/images/bayview-estate-logo.jpg`
- **Source:** Downloaded from https://bayviewhub.me/images/bayview-estate-logo.jpg
- **Usage:** `SiteHeader.tsx` via Next.js `Image` component

---

## 5. Build PASS Proof

```
✓ Compiled successfully
✓ Generating static pages (48/48)
```

All routes build successfully. No runtime errors observed.

---

## 6. Key Routes for Spot-Check

| Route | Zone | Notes |
|-------|------|-------|
| / | gallery | Homepage, hero, cards |
| /masterpieces | gallery | Grid, filters, cards |
| /masterpieces/[id] | gallery | Detail, metadata |
| /study | gallery | Study index |
| /study/picasso | gallery | Study detail |
| /protocol | noir | Protocol content |
| /takedown | gallery | Form, cards |
| /portal | gallery | Portal landing |

---

## 7. Files Changed

| File | Changes |
|------|---------|
| `app/layout.tsx` | Inter + Cormorant fonts, `font-sans` on body |
| `app/globals.css` | CSS tokens (:root, .zone-gallery, .zone-noir), body font |
| `tailwind.config.ts` | fontFamily, colors (bg, fg, muted, subtle, border, surface, accent, gallery, noir), darkMode: 'class' |
| `components/layout/SiteHeader.tsx` | Bayview logo, inline color styles, semantic tokens |
| `components/layout/SiteFooter.tsx` | Semantic tokens (text-fg, text-muted, text-subtle, border-border) |
| `components/layout/ZoneProvider.tsx` | Added /study to GALLERY_ROUTES |
| `components/ui/Button.tsx` | Variant styles using semantic tokens |
| `components/gallery/GalleryCard.tsx` | Semantic tokens, border-accent hover |
| `components/gallery/FeaturedSection.tsx` | text-subtle for captions |
| `components/gallery/GalleryGrid.tsx` | text-subtle for empty state |
| `app/page.tsx` | text-subtle for placeholder |
| `public/images/bayview-estate-logo.jpg` | New asset (Bayview logo) |

---

## 8. Before / After Notes

**Before:**
- Geist local fonts, Arial fallback
- Hardcoded zone colors (#fafaf8, #050505)
- gallery-* / noir-* Tailwind classes (now mapped to zone tokens)
- No Bayview branding in header

**After:**
- Inter + Cormorant Garamond (Bayview typography)
- Semantic CSS variables per zone
- Bayview logo + "Bayview Hub / Art Gallery" in header
- Consistent teal accent (#5EB1BF light, #7FBFC8 dark)
- Hardened dark theme (#0E1111 bg) for noir zone
