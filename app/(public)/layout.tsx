import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { FAMILY_STRIP, GALLERY_EMAIL, MAIN_SITE_URL } from "@/lib/brand";
import { SITE_URL } from "@/lib/site-url";

const PUBLIC_THEME_INIT_SCRIPT = `
(function () {
  try {
    var key = "public-theme-mode";
    var rootId = "public-theme-root";
    var mode = localStorage.getItem(key);
    if (mode !== "system" && mode !== "dark" && mode !== "light") {
      mode = "system";
    }
    var shouldDark =
      mode === "dark" ||
      (mode === "system" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    var root = document.getElementById(rootId);
    if (!root) return;
    root.classList.toggle("dark", !!shouldDark);
    root.setAttribute("data-theme-mode", mode);
    root.style.colorScheme = shouldDark ? "dark" : "light";
  } catch (e) {}
})();
`;

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ArtGallery",
    name: "Bayview Hub Art Gallery",
    url: SITE_URL,
    email: GALLERY_EMAIL,
    parentOrganization: {
      "@type": "Organization",
      name: "Bayview Hub",
      url: MAIN_SITE_URL,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "365 Purves Road",
      addressLocality: "Main Ridge",
      addressRegion: "VIC",
      postalCode: "3928",
      addressCountry: "AU",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "11:00",
        closes: "23:00",
      },
    ],
    sameAs: FAMILY_STRIP.links.map((l) => l.href),
  };

  return (
    <div id="public-theme-root" className="flex min-h-screen flex-col bg-bg text-fg">
      <script dangerouslySetInnerHTML={{ __html: PUBLIC_THEME_INIT_SCRIPT }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
