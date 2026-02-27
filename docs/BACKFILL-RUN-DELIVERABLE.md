# imageUrl Backfill Run — Deliverable

## 1) DATABASE_URL

Using production/staging env (`.env` with same `DATABASE_URL` as prod).

## 2) Script Output

### Dry-run
```
--- DRY RUN (no changes) ---

--- Summary ---
Submissions (APPROVED): 6
Artworks with null imageUrl: 1
Updated: 0
(dry-run: no changes written)
```

### Apply
```
--- Summary ---
Submissions (APPROVED): 6
Artworks with null imageUrl: 1
Updated: 0
```

**Reason:** The 1 artwork with null imageUrl (Hatbalah) has no matching submission with `evidenceFiles[].path`. Hatbalah's submission has 0 evidence paths (upload failed). The other 5 artworks already had imageUrl set from approval.

## 3) Counts

| Metric | Count |
|--------|-------|
| Submissions (APPROVED) | 6 |
| Artworks with null imageUrl | 1 (Hatbalah) |
| Updated by backfill | 0 |
| Artworks with imageUrl | 5 |

## 4) /archive Verification

- **5 artworks** show images: 6 CRADLE, BY THE SEA OF GALILEE, Seeking in the wilderness 07, Sunset, Sanctuary of Green
- **1 artwork** (Hatbalah) shows placeholder: no evidence path in submission

**Screenshot:** Visit https://gallery.bayviewhub.me/archive — 5 cards should show images.

## 5) curl -I to imageUrl

```
$ curl -sI "https://gallery.bayviewhub.me/api/storage/intake/d2924ecd-6801-4ba7-bb21-09f2cc55aa17/2026/02/1772163755719-5aaq9k/6_CRADLE.jpg"
```

**Response:**
```
HTTP/2 302 
location: https://xarwzmsaoqgbjsrmswxz.supabase.co/storage/v1/object/sign/artist-submissions-evidence/...
```

The proxy returns **302** (redirect to Supabase signed URL). Browsers follow redirects; `<img src="...">` loads the image. The 302 is expected — the proxy does not serve the image directly.

## 6) Hatbalah

Hatbalah has no imageUrl because its submission had no successful evidence uploads. To fix: Admin → Visibility Control → paste image URL or storage path for Hatbalah → Set Image.
