import { redirect } from "next/navigation";

export const metadata = {
  robots: {
    index: false,
  },
};

export default function Page() {
  redirect("/");
}
