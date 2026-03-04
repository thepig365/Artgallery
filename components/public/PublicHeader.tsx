import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Container } from "@/components/layout/Container";
import { MAIN_SITE_URL } from "@/lib/brand";

const NAV_ITEMS = [
  { label: "Archive", href: "/archive" },
  { label: "Mend Index", href: "/protocol" },
  { label: "Submit for Curation", href: "/submit" },
  { label: "Rights & Takedown", href: "/rights" },
] as const;

export function PublicHeader() {
  const pathname = headers().get("x-pathname") ?? "";
  return (
    <header className="border-b border-border bg-surface/95 backdrop-blur-sm sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between h-16 md:h-20">
          <a
            href={MAIN_SITE_URL}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/images/bayview-estate-logo.jpg"
              alt="Bayview Hub Art Gallery"
              width={200}
              height={60}
              className="h-16 w-auto md:h-20"
              priority
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-xl md:text-2xl font-serif font-bold leading-tight text-gallery-text">
                Bayview Hub
              </span>
              <span className="text-[11px] tracking-widest uppercase text-gallery-muted">
                Art Gallery
              </span>
            </div>
          </a>

          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "px-3 py-2 text-sm font-medium rounded-md text-gallery-accent bg-gallery-accent/10"
                      : "px-3 py-2 text-sm font-medium rounded-md text-gallery-muted hover:text-gallery-text hover:bg-gallery-surface-alt transition-colors duration-200"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </Container>
    </header>
  );
}
