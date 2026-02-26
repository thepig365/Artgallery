This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Masterpieces Harvest (Scheduled Ingestion)

The curated harvester ingests public-domain works from The Met and Art Institute of Chicago. It uses **fast-mode limits** (MET_MAX_TOTAL=500, MET_MAX_SCAN=200) to avoid long runs.

### Run manually

```bash
# Daily batch: 5 artists × 3 works each (lightweight, for cron)
npm run harvest:daily

# Full zero-fill: process all artists with 0 works
npm run harvest:zeros

# Top 50 batch: 10 artists × 6 works
npm run harvest:top50
```

### Schedule via Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/harvest",
      "schedule": "0 6 * * *"
    }
  ]
}
```

Create `app/api/cron/harvest/route.ts` that runs `harvest:daily` (e.g. via `execSync` or a child process). Ensure the route is protected by `CRON_SECRET` or Vercel's cron auth.

### Schedule via GitHub Actions

Create `.github/workflows/harvest-daily.yml`:

```yaml
name: Harvest Daily
on:
  schedule:
    - cron: '0 6 * * *'  # 6am UTC daily
  workflow_dispatch:
jobs:
  harvest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run harvest:daily
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

Set `DATABASE_URL` in the repo's GitHub Secrets.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
