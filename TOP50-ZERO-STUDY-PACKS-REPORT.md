# Top 50 Zero-Count Artists — Harvest & Study Packs Report

## Summary

- **Before harvest**: 40 artists with 0 ingested works (out of 50 total)
- **After fast-mode harvest**: 7 artists remain at 0 (study packs created)
- **Total masterpieces in DB**: 437 (met: 241, aic: 196)
- **Build**: PASS (48 pages, 13 study guide pages)

---

## Fast Mode Limits Applied

| Parameter | Value |
|---|---|
| MET_MAX_TOTAL | 500 (skip Met if search exceeds this) |
| MET_MAX_SCAN | 200 (only scan first 200 objectIDs) |
| MET_PER_OBJECT_DELAY | 300ms |
| MET_RETRY_MAX | 5 (exponential backoff on 429/503/403) |
| Met search query | `artistOrCulture=true&hasImages=true&isPublicDomain=true` |

---

## Artists Successfully Ingested (33 from 40)

| Artist | Met Saved | AIC Saved | Total |
|---|---|---|---|
| Cézanne | 3 | 0 | 3 |
| Manet | 3 | 3 | 6 |
| El Greco | 3 | 3 | 6 |
| Velázquez | 6 | 0 | 6 |
| Raphael | 6 | 0 | 6 |
| Botticelli | 3 | 3 | 6 |
| Titian | 6 | 0 | 6 |
| Rubens | 3 | 3 | 6 |
| Constable | 6 | 0 | 6 |
| Courbet | 3 | 3 | 6 |
| Pissarro | 3 | 3 | 6 |
| Sisley | 3 | 3 | 6 |
| Cassatt | 0 | 6 | 6 |
| Toulouse-Lautrec | 3 | 3 | 6 |
| Whistler | 3 | 3 | 6 |
| Homer | 3 | 3 | 6 |
| Sargent | 0 | 6 | 6 |
| Klimt | 3 | 3 | 6 |
| Kandinsky | 0 | 6 | 6 |
| Mondrian | 0 | 6 | 6 |
| Canaletto | 6 | 0 | 6 |
| Dürer | 0 | 6 | 6 |
| Holbein | 6 | 0 | 6 |
| Bruegel | 6 | 0 | 6 |
| Gainsborough | 6 | 0 | 6 |
| Delacroix | 3 | 3 | 6 |
| Corot | 0 | 6 | 6 |
| Hiroshige | 0 | 6 | 6 |
| Bonnard | 0 | 2 | 2 |
| Vuillard | 0 | 6 | 6 |
| Rousseau | 2 | 4 | 6 |
| Seurat | 3 | 3 | 6 |
| Signac | 0 | 6 | 6 |

---

## Remaining Zero-Count Artists (7) — Study Packs Created

| Artist | Slug | Reason |
|---|---|---|
| Edvard Munch | `/study/munch` | Met: 23 candidates scanned, none matched (no public domain paintings). AIC: no source configured. |
| Paul Klee | `/study/klee` | Met: 105 candidates scanned, 403 errors + no matches. AIC: no matches. |
| Giovanni Battista Tiepolo | `/study/tiepolo` | Met: 1061 candidates (exceeded MAX_TOTAL=500, skipped). Met-only source. |
| Georgia O'Keeffe | `/study/okeefe-study` | Met: 30 scanned, no public domain. AIC: no matches. Copyright-era artist. |
| Edward Hopper | `/study/hopper-study` | Met: 26 scanned, no public domain. AIC: no matches. Copyright-era artist. |
| Marc Chagall | `/study/chagall-study` | Met: 28 scanned, no public domain. AIC: no matches. Copyright-era artist. |
| Joan Miró | `/study/miro-study` | Met: 38 scanned, no public domain. AIC: no matches. Copyright-era artist. |

---

## Files Changed

| File | Change |
|---|---|
| `scripts/harvest_curated_masterpieces.ts` | Fast mode: MET_MAX_TOTAL, MET_MAX_SCAN, artistOrCulture search, structured report |
| `scripts/harvest_zeros.ts` | New: auto-discovers zero-count artists and batches harvest |
| `lib/data/study-packs-top50.ts` | New: 7 study pack data entries with blurbs, B/P/M/S tips, official links |
| `app/study/page.tsx` | Added "Top 50 Artists — Study Packs" section |
| `app/study/[slug]/page.tsx` | Extended to resolve both Modern Masters and Study Packs datasets |
| `app/masterpieces/page.tsx` | Added "Study Packs for Artists Not Yet Ingested" section |
| `package.json` | Added `harvest:zeros` npm script |

---

## Verification

- `npm run build`: **PASS** (48 pages)
- All study pack routes return **200**:
  - `/study/munch`, `/study/klee`, `/study/tiepolo`
  - `/study/okeefe-study`, `/study/hopper-study`
  - `/study/chagall-study`, `/study/miro-study`
- `/masterpieces` contains "Study Packs for Artists Not Yet Ingested" section
- `/study` contains "Top 50 Artists — Study Packs" section
- SEO metadata + JSON-LD present on all study pack pages
- External links use `rel="nofollow noopener noreferrer"`
- License allowlist unchanged: CC0 / PDM / PublicDomain only
