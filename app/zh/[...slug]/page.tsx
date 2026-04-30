import { redirect } from "next/navigation";

export const metadata = {
  robots: {
    index: false,
  },
};

export default function Page({ params }: { params: { slug?: string[] } }) {
  const segments = params.slug ?? [];
  const englishPath = `/${segments.join("/")}`;
  redirect(englishPath);
}
