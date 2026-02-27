import type { MetadataRoute } from "next";

const SITE_URL = "https://gallery.bayviewhub.me";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/login", "/portal"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
