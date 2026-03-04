# DB Risk Report

> **REQUIRED** before any database changes can be merged.
> Copy this file to `docs/DB-RISK-REPORT.md` and fill in all sections.

---

## Change Summary

**Date:** YYYY-MM-DD  
**Author:** [Your name]  
**PR/Branch:** [Link or branch name]

---

## 1. Why This Change Is Needed

Describe the exact error, affected routes, or business requirement.

```
[Paste error messages, affected endpoints, or requirement here]
```

---

## 2. Exact SQL/Migration Summary

### Files Changed
- [ ] `prisma/schema.prisma`
- [ ] `prisma/migrations/YYYYMMDD_description/`
- [ ] `scripts/migrations/*.sql`
- [ ] Other: ___________

### SQL Statements (sanitized, no secrets)
```sql
-- List exact SQL statements that will be executed
```

---

## 3. Affected Tables/Columns

| Table | Column | Action | Current Row Count |
|-------|--------|--------|-------------------|
| | | | |

---

## 4. Restore Point

### Method (check one)
- [ ] Supabase PITR (Point-in-Time Recovery) enabled
- [ ] Manual backup export created
- [ ] Both

### Proof of Backup
```
-- Row counts BEFORE change:
SELECT 'artworks' AS tbl, COUNT(*) FROM artworks
UNION ALL
SELECT 'artists', COUNT(*) FROM artists
UNION ALL
SELECT '[other_table]', COUNT(*) FROM [other_table];

-- Results:
-- artworks: ___
-- artists: ___
-- [other]: ___
```

### Backup Location
- PITR checkpoint: [timestamp or N/A]
- Export file: [path or N/A]

---

## 5. Rollback Plan

### If Change Fails
```sql
-- Exact SQL to revert (or migration name to rollback)
```

### Rollback Steps
1. ...
2. ...
3. ...

---

## 6. Testing Completed

- [ ] Tested on local/staging DB first
- [ ] Verified affected routes still work
- [ ] Verified no data loss
- [ ] Verified rollback procedure

---

## 7. Approval

> **DO NOT CHECK THIS BOX YOURSELF.**
> Only Leon or an authorized reviewer may approve.

- [ ] **APPROVED** - Reviewed by: ___________ on YYYY-MM-DD

---

## Notes

[Any additional context or considerations]
