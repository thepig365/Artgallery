import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const host = new URL(SITE_URL).host;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/login", "/portal", "/assessor", "/laboratory"],
      },
    ],
    host,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
