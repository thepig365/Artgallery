import { notFound } from "next/navigation";
import UIPreviewClient from "./UIPreviewClient";

export default function UIPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <UIPreviewClient />;
}
