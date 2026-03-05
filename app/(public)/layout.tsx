import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

const PUBLIC_THEME_INIT_SCRIPT = `
(function () {
  try {
    var key = "public-theme-mode";
    var rootId = "public-theme-root";
    var mode = localStorage.getItem(key);
    if (mode !== "system" && mode !== "dark" && mode !== "light") {
      mode = "system";
    }
    var shouldDark =
      mode === "dark" ||
      (mode === "system" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    var root = document.getElementById(rootId);
    if (!root) return;
    root.classList.toggle("dark", !!shouldDark);
    root.setAttribute("data-theme-mode", mode);
    root.style.colorScheme = shouldDark ? "dark" : "light";
  } catch (e) {}
})();
`;

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div id="public-theme-root" className="flex min-h-screen flex-col bg-bg text-fg">
      <script dangerouslySetInnerHTML={{ __html: PUBLIC_THEME_INIT_SCRIPT }} />
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
