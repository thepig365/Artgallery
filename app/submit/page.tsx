import type { Metadata } from "next";
import ArtistSubmitClient from "@/app/portal/submit/ArtistSubmitClient";

export const metadata: Metadata = {
  title: "Submit Artwork | Bayview Hub Gallery",
  description:
    "Submit your artwork for optional Mend Index assessment and archive consideration.",
  alternates: { canonical: "/submit" },
  openGraph: {
    title: "Submit Artwork | Bayview Hub Gallery",
    description:
      "Submit your artwork for optional Mend Index assessment and archive consideration.",
    type: "website",
    url: "/submit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Submit Artwork | Bayview Hub Gallery",
    description:
      "Submit your artwork for optional Mend Index assessment and archive consideration.",
  },
};

export default function SubmitAliasPage() {
  return <ArtistSubmitClient />;
}
