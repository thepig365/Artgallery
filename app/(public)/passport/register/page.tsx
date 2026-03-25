import type { Metadata } from "next";
import { HostRegisterClient } from "./HostRegisterClient";

export const metadata: Metadata = {
  title: "Register as a Host | Artwork Passport · Bayview Hub",
  description:
    "Register your artwork with Bayview Hub's Private Viewing Network. Submit your artwork details to receive a Preliminary Passport and QR-linked record.",
  robots: { index: false, follow: false },
};

export default function PassportRegisterPage() {
  return <HostRegisterClient />;
}
