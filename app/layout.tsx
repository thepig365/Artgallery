import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ZoneProvider } from "@/components/layout/ZoneProvider";
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
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} font-sans`}>
      <body className="min-h-screen bg-bg font-sans text-fg antialiased">
        <ZoneProvider>{children}</ZoneProvider>
      </body>
    </html>
  );
}
