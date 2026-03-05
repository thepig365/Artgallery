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
  title: {
    default: "Bayview Hub Art Gallery",
    template: "%s | Bayview Hub Art Gallery",
  },
  description:
    "Bayview Hub Art Gallery presents curated contemporary works, study resources, and the Mend Index protocol.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    siteName: "Bayview Hub Art Gallery",
    title: "Bayview Hub Art Gallery",
    description:
      "Curated archive, study library, and assessment protocol by Bayview Hub Art Gallery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bayview Hub Art Gallery",
    description:
      "Curated archive, study library, and assessment protocol by Bayview Hub Art Gallery.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
