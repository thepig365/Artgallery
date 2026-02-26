import { Shield, Eye, Scale } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Eye,
    title: "Blind Assessment",
    text: "Assessors score without knowing artist identity",
  },
  {
    icon: Scale,
    title: "Structured Protocol",
    text: "Four-axis Mend Index scoring methodology",
  },
  {
    icon: Shield,
    title: "Full Transparency",
    text: "Provenance-logged with legal disclaimers",
  },
] as const;

export function TrustStrip() {
  return (
    <section className="border-y border-gallery-border bg-gallery-surface-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gallery-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon
                  className="w-4 h-4 text-gallery-accent"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gallery-text">
                  {title}
                </p>
                <p className="text-xs text-gallery-muted mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
