import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Container } from "@/components/layout/Container";
import { MAIN_SITE_URL } from "@/lib/brand";
import { PublicThemeToggle } from "@/components/public/PublicThemeToggle";

const NAV_ITEMS = [
  { label: "Archive", href: "/archive" },
  { label: "Mend Index Protocol", href: "/protocol" },
  { label: "Submit", href: "/submit" },
  { label: "Rights & Takedown", href: "/rights" },
] as const;

export function PublicHeader() {
  const pathname = headers().get("x-pathname") ?? "";
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-family-navy text-white shadow-family">
      <Container>
        <div className="flex items-center justify-between h-24 md:h-28">
          <a
            href={MAIN_SITE_URL}
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/images/bayview-estate-logo.jpg"
              alt="Bayview Hub Art Gallery"
              width={200}
              height={60}
              className="h-14 w-auto md:h-16"
              priority
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-xl md:text-2xl font-serif font-semibold leading-tight text-white">
                Bayview Hub
              </span>
              <span className="text-[11px] tracking-[0.16em] uppercase text-white/70">
                Art Gallery
              </span>
            </div>
          </a>

          <div className="flex items-center gap-1 md:gap-1.5">
            <PublicThemeToggle />
            <nav aria-label="Main navigation" className="flex items-center gap-1.5 md:gap-2">
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
                      ? "rounded-md bg-white/12 px-3 py-2 text-xs font-medium tracking-wide text-white md:text-sm"
                      : "rounded-md px-3 py-2 text-xs font-medium tracking-wide text-white/75 transition-colors duration-200 hover:bg-white/8 hover:text-white md:text-sm"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
            </nav>
          </div>
        </div>
      </Container>
    </header>
  );
}
