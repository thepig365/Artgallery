#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://gallery.bayviewhub.me}"
MIN_ARCHIVE_ENTRIES="${2:-3}"
TMP_DIR="$(mktemp -d)"

pass_count=0
fail_count=0

pass() {
  printf "PASS: %s\n" "$1"
  pass_count=$((pass_count + 1))
}

fail() {
  printf "FAIL: %s\n" "$1"
  fail_count=$((fail_count + 1))
}

fetch() {
  local path="$1"
  local body_file="$2"
  local headers_file="$3"
  local status
  status="$(curl -sS -L -D "$headers_file" -o "$body_file" -w "%{http_code}" "${BASE_URL}${path}")"
  printf "%s" "$status"
}

echo "SEO verify target: ${BASE_URL}"
echo "----------------------------------------"

# 1) robots.txt
robots_body="${TMP_DIR}/robots.txt"
robots_headers="${TMP_DIR}/robots.headers"
robots_status="$(fetch "/robots.txt" "$robots_body" "$robots_headers")"
if [[ "$robots_status" == "200" ]]; then
  pass "/robots.txt status is 200"
else
  fail "/robots.txt status is ${robots_status} (expected 200)"
fi

if rg -q "Allow:\s*/" "$robots_body"; then
  pass "/robots.txt contains 'Allow: /'"
else
  fail "/robots.txt missing 'Allow: /'"
fi

if rg -q "Disallow:\s*/admin" "$robots_body" && rg -q "Disallow:\s*/api" "$robots_body"; then
  pass "/robots.txt contains expected disallow rules (/admin, /api)"
else
  fail "/robots.txt missing expected disallow rules (/admin, /api)"
fi

# 2) sitemap.xml
sitemap_body="${TMP_DIR}/sitemap.xml"
sitemap_headers="${TMP_DIR}/sitemap.headers"
sitemap_status="$(fetch "/sitemap.xml" "$sitemap_body" "$sitemap_headers")"
if [[ "$sitemap_status" == "200" ]]; then
  pass "/sitemap.xml status is 200"
else
  fail "/sitemap.xml status is ${sitemap_status} (expected 200)"
fi

if rg -q "${BASE_URL}/archive" "$sitemap_body"; then
  pass "/sitemap.xml contains /archive"
else
  fail "/sitemap.xml missing /archive"
fi

archive_urls_file="${TMP_DIR}/archive_urls.txt"
rg -o "https?://[^<[:space:]]+/archive/[A-Za-z0-9._~:/?#\\[\\]@!$&'()*+,;=%-]+" "$sitemap_body" | sort -u > "$archive_urls_file" || true
archive_count="$(wc -l < "$archive_urls_file" | tr -d ' ')"
if [[ "$archive_count" -ge "$MIN_ARCHIVE_ENTRIES" ]]; then
  pass "/sitemap.xml has ${archive_count} archive detail URLs (>= ${MIN_ARCHIVE_ENTRIES})"
else
  fail "/sitemap.xml has ${archive_count} archive detail URLs (< ${MIN_ARCHIVE_ENTRIES})"
fi

# 3) sample 3 artwork pages: title, canonical, og:image
sample_file="${TMP_DIR}/sample3.txt"
head -n 3 "$archive_urls_file" > "$sample_file"
sample_count="$(wc -l < "$sample_file" | tr -d ' ')"

if [[ "$sample_count" -eq 0 ]]; then
  fail "No archive detail URLs available for metadata checks"
else
  while IFS= read -r url; do
    [[ -z "$url" ]] && continue
    slug="${url##*/}"
    page_body="${TMP_DIR}/${slug}.html"
    page_headers="${TMP_DIR}/${slug}.headers"
    page_status="$(curl -sS -L -D "$page_headers" -o "$page_body" -w "%{http_code}" "$url")"

    if [[ "$page_status" != "200" ]]; then
      fail "Artwork page ${slug} status is ${page_status} (expected 200)"
      continue
    fi

    if rg -q "<title>.*</title>" "$page_body"; then
      pass "Artwork page ${slug} has <title>"
    else
      fail "Artwork page ${slug} missing <title>"
    fi

    if rg -q "<link[^>]+rel=[\"']canonical[\"'][^>]+href=" "$page_body"; then
      pass "Artwork page ${slug} has canonical link"
    else
      fail "Artwork page ${slug} missing canonical link"
    fi

    if rg -q "<meta[^>]+property=[\"']og:image[\"'][^>]+content=" "$page_body"; then
      pass "Artwork page ${slug} has og:image"
    else
      fail "Artwork page ${slug} missing og:image"
    fi
  done < "$sample_file"
fi

echo "----------------------------------------"
echo "Summary: ${pass_count} PASS / ${fail_count} FAIL"
if [[ "$fail_count" -eq 0 ]]; then
  echo "SEO verification result: PASS"
  exit 0
else
  echo "SEO verification result: FAIL"
  exit 1
fi
