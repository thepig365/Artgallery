import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Container } from "./Container";
import { GalleryNavServer } from "./GalleryNavServer";
import { isGalleryRoute } from "@/lib/nav/galleryNav";

/**
 * Server-rendered header. Nav items render in full for SSR (no client hooks).
 */
export function SiteHeaderServer() {
  const pathname = headers().get("x-pathname") ?? "";
  const isGallery = isGalleryRoute(pathname);
  const titleColor = isGallery ? "#111827" : "#F9FAFB";
  const subtitleColor = isGallery ? "#374151" : "#D1D5DB";

  if (isGallery) {
    return (
      <header className="border-b border-border bg-surface/95 backdrop-blur-sm sticky top-0 z-50">
        <Container>
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              href="/archive"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <Image
                src="/images/bayview-estate-logo.jpg"
                alt="Bayview Estate"
                width={200}
                height={60}
                className="h-16 w-auto md:h-20"
                priority
              />
              <div className="flex flex-col">
                <span
                  className="text-xl md:text-2xl font-serif font-bold leading-tight"
                  style={{ color: titleColor }}
                >
                  Bayview Hub
                </span>
                <span
                  className="text-[11px] tracking-widest uppercase"
                  style={{ color: subtitleColor }}
                >
                  Art Gallery
                </span>
              </div>
            </Link>
            <GalleryNavServer />
          </div>
        </Container>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-surface sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link
            href="https://bayviewhub.me"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/images/bayview-estate-logo.jpg"
              alt="Bayview Estate"
              width={200}
              height={60}
              className="h-12 w-auto md:h-14"
              priority
            />
            <div className="flex flex-col">
              <span
                className="text-lg font-serif font-bold leading-tight"
                style={{ color: titleColor }}
              >
                Bayview Hub
              </span>
              <span
                className="text-[10px] tracking-widest uppercase"
                style={{ color: subtitleColor }}
              >
                Art Gallery
              </span>
            </div>
          </Link>
          <GalleryNavServer />
        </div>
      </Container>
    </header>
  );
}
