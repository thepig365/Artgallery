# DB Change Guardrails

This document describes the automatic guardrails for database changes in the Artgallery project.

## Policy Overview

**NO database changes without explicit approval.**

- No DELETE/TRUNCATE/DROP/ALTER on production
- No RLS policy changes on production
- No `prisma db push` against production
- All changes require a DB Risk Report with approval

## Automatic Detection

The `guard:db` script automatically detects:

### File Patterns
- `prisma/**` - Schema and migration files
- `scripts/**` - Script files containing SQL keywords
- `*.sql` - Any SQL files

### Risky Keywords
- `DROP TABLE`, `TRUNCATE`, `DELETE FROM`
- `ALTER TABLE`, `DROP COLUMN`, `DROP INDEX`
- `CREATE POLICY`, `DROP POLICY`
- `ENABLE/DISABLE ROW LEVEL SECURITY`
- `prisma db push`

## Usage

### Before Pushing Changes
```bash
npm run guard:db
```

### In Pre-Commit Hook (if using Husky)
```bash
npm run guard:db:staged
```

### Sample Output (No DB Changes)
```
🔍 DB Change Detection Check
==================================================

DB_CHANGE_DETECTED=false

✅ No DB changes detected. Safe to proceed.
```

### Sample Output (DB Changes Detected)
```
🔍 DB Change Detection Check
==================================================

DB_CHANGE_DETECTED=true

📁 DB-related files changed:
   - prisma/schema.prisma

⚠️  Risky keywords detected:
   - ALTER TABLE

==================================================
🚨 DB CHANGE DETECTED - Checking guardrails...

❌ BLOCKED: No DB Risk Report found.
   Create docs/DB-RISK-REPORT.md from the template:
   cp docs/DB-RISK-REPORT.template.md docs/DB-RISK-REPORT.md

   Fill in all sections and get approval before proceeding.
```

## Creating a DB Risk Report

1. Copy the template:
   ```bash
   cp docs/DB-RISK-REPORT.template.md docs/DB-RISK-REPORT.md
   ```

2. Fill in ALL sections:
   - Why change is needed
   - Exact SQL/migration summary
   - Affected tables/columns
   - Restore point proof (row counts)
   - Rollback plan

3. Get approval from Leon
   - The `[x] APPROVED` checkbox must be marked by a reviewer
   - High-risk changes (DROP/TRUNCATE/DELETE) require explicit approval

4. Run `npm run guard:db` to verify

## Setting Up Pre-Commit Hook

### Option A: Using Husky (Recommended)

```bash
npx husky install
npx husky add .husky/pre-commit "npm run guard:db:staged"
```

### Option B: Manual Hook

Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
npm run guard:db:staged
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### Option C: Manual Check

Run before every push:
```bash
npm run guard:db
git push
```

## Default Approach

**Fix in code first.** Only change the database when code cannot solve the problem.

- Use explicit Prisma `select` clauses
- Add graceful fallbacks for missing columns
- Fix route/runtime issues before touching DB
