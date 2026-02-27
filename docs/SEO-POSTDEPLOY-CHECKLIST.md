# SEO Post-Deploy Checklist

Use this checklist after each production release.

## 1) Automated smoke check

Run from repo root:

```bash
bash scripts/seo_verify.sh https://gallery.bayviewhub.me 3
```

- Arg 1: site base URL
- Arg 2: minimum expected `/archive/[slug]` count in sitemap

Expected: final line shows `SEO verification result: PASS`.

## 2) Google Search Console (GSC)

1. Open Google Search Console for the production property.
2. Go to **Sitemaps**.
3. Submit/re-submit:
   - `https://gallery.bayviewhub.me/sitemap.xml`
4. Confirm sitemap status is **Success**.
5. Use **URL Inspection** for:
   - `/archive`
   - one `/archive/[slug]` page
6. Request indexing only if page is new/updated and not yet indexed.
7. Check **Pages** report:
   - No unexpected spikes in excluded pages.
   - Canonical selected as expected for archive detail pages.

## 3) Bing Webmaster Tools (Bing WMT)

1. Open Bing Webmaster Tools for the production property.
2. Go to **Sitemaps**.
3. Submit/re-submit:
   - `https://gallery.bayviewhub.me/sitemap.xml`
4. Confirm sitemap is fetched without errors.
5. Use **URL Inspection** for:
   - `/archive`
   - one `/archive/[slug]` page
6. Check **Index Coverage** for crawl/indexing anomalies.

## 4) Manual page checks (browser)

1. Open `/archive` and one artwork detail page.
2. In page source, verify:
   - `<title>`
   - `<link rel="canonical" ...>`
   - `og:image` meta tag
3. Open `/robots.txt` and verify public allow + admin/api disallow rules.
4. Open `/sitemap.xml` and verify archive URLs are present.
