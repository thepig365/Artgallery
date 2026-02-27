import type { Metadata } from "next";
import TakedownRequestPage from "@/app/takedown/page";

export const metadata: Metadata = {
  title: "Rights & Licensing | Bayview Hub Gallery",
  description:
    "Submit rights, ownership, and takedown requests for artworks in the public archive.",
  alternates: { canonical: "/rights" },
  openGraph: {
    title: "Rights & Licensing | Bayview Hub Gallery",
    description:
      "Submit rights, ownership, and takedown requests for artworks in the public archive.",
    type: "website",
    url: "/rights",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rights & Licensing | Bayview Hub Gallery",
    description:
      "Submit rights, ownership, and takedown requests for artworks in the public archive.",
  },
};

export default function RightsAliasPage() {
  return <TakedownRequestPage />;
}
