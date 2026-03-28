/** Direct share targets for a canonical page URL (no client required). */

export function facebookShareUrl(pageUrl: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
}

export function linkedInShareUrl(pageUrl: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
}

export function buildShareMailto(opts: { subject: string; intro: string; url: string }) {
  const body = `${opts.intro.trim()}\n\n${opts.url}`;
  return `mailto:?subject=${encodeURIComponent(opts.subject)}&body=${encodeURIComponent(body)}`;
}
