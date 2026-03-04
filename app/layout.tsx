import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { ZoneProvider } from "@/components/layout/ZoneProvider";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { isPublicRoute } from "@/lib/nav/public-routes";
import { SITE_URL } from "@/lib/site-url";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Art Valuation Protocol",
  description: "Curated gallery with optional Mend Index assessment",
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = headers().get("x-pathname") ?? "";
  const isPublic = isPublicRoute(pathname);

  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <ZoneProvider>
          <div className="flex flex-col min-h-screen">
            {isPublic ? <PublicHeader /> : null}
            <main className="flex-1">{children}</main>
            {isPublic ? <PublicFooter /> : null}
          </div>
        </ZoneProvider>
      </body>
    </html>
  );
}
