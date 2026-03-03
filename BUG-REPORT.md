# Bug Report — Site Scan

## Critical

### 1. Login redirect param mismatch — portal/submit
**File:** `app/portal/submit/page.tsx` (line 8)  
**Issue:** Redirects to `redirect("/login?next=/portal/submit")` but login page only reads `searchParams.get("redirect")`, never `next`.  
**Effect:** User lands on login from /portal/submit, logs in, and is sent to default /portal instead of /portal/submit.  
**Fix:** Change `next=` to `redirect=`.

### 2. Missing ALLOWED_REDIRECTS — /submit, /claim
**File:** `app/login/page.tsx`  
**Issue:** `ALLOWED_REDIRECTS` lacks `/submit` and `/claim`.  
- ArtistSubmitClient links to `/login?redirect=/submit` — after login, safeRedirect rejects and sends to /portal.  
- Claim page links to `/login?redirect=/claim/{artworkId}` — same rejection.  
**Fix:** Add `/submit` and `/claim` to ALLOWED_REDIRECTS.

---

## Medium

### 3. Claim page — artworkId can be string[] in Next.js 15
**File:** `app/claim/[artworkId]/page.tsx`  
**Issue:** `useParams<{ artworkId: string }>()` returns `artworkId` as `string | string[]` when there are catch-all segments. For a single param it's usually string, but type and runtime should handle array.  
**Effect:** If artworkId is ever an array, `fetch(\`...?artworkId=${artworkId}\`)` becomes `artworkId=1,2,3` (joined) and validation may fail.  
**Fix:** Normalize: `const id = Array.isArray(artworkId) ? artworkId[0] : artworkId;`

### 4. Claim page — no 404 for invalid artworkId
**File:** `app/claim/[artworkId]/page.tsx`  
**Issue:** Page renders for any UUID-like path (e.g. `/claim/00000000-0000-0000-0000-000000000000`). No check if artwork exists.  
**Effect:** User can submit claim for non-existent artwork; API may reject but UX is confusing.  
**Mitigation:** API validates artworkId; consider server-side check + notFound() for invalid IDs.

---

## Low

### 5. Assessor session page — still uses legacy API
**File:** `app/portal/assessor/session/[auditSessionId]/page.tsx` (line 63)  
**Issue:** Fetches `/api/portal/assessor/session/${auditSessionId}` — legacy AuditSession-based flow.  
**Note:** Assignment-based flow uses `/api/assessor/assignments/` and `/portal/assessor/review/[assignmentId]`. Both exist; ensure legacy route is still needed or deprecate.

### 6. Potential null in assessor review — assignment.blindMode
**File:** `app/portal/assessor/review/[assignmentId]/page.tsx`  
**Issue:** AssignmentData interface has `blindMode` optional; code uses `assignment.blindMode ?? true`. If API omits it for old assignments, that's fine. No bug if backward compatible.

---

## Summary
- **Critical:** 2 (login redirect, ALLOWED_REDIRECTS)
- **Medium:** 2 (claim artworkId type, no artwork existence check)
- **Low:** 1 (legacy session API still in use)
