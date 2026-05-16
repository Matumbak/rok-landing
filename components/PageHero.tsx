"use client";

import { cn } from "@/lib/utils";
import { DiamondDivider } from "@/components/ornaments";
import { useT } from "@/lib/i18n";

/**
 * Page hero — heraldic landing strip used at the top of /migration,
 * /dkp, etc. Rebuilt per Design System v3 §8.2-8.3:
 *
 *   ┌─── ◆ eyebrow ───────────────────┐
 *   │                                 │
 *   │      ENGRAVED PAGE TITLE        │
 *   │      —  diamond divider  —      │
 *   │      italic serif description   │
 *   │                                 │
 *   └─────────────────────────────────┘
 *
 * Two ways to supply content:
 *   1. Explicit strings — `eyebrow`, `title`, `description`.
 *   2. i18n namespace — `tKey="pages.migration"`, the component
 *      reads `<tKey>.eyebrow / .title / .description`.
 *
 * Explicit strings win when both are passed.
 */
type Props = {
  tKey?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
};

export function PageHero({
  tKey,
  eyebrow,
  title,
  description,
  className,
}: Props) {
  const t = useT();
  const resolved = {
    eyebrow: eyebrow ?? (tKey ? t(`${tKey}.eyebrow`) : ""),
    title: title ?? (tKey ? t(`${tKey}.title`) : ""),
    description:
      description ?? (tKey ? t(`${tKey}.description`) : undefined),
  };

  return (
    <section
      className={cn(
        "relative pt-36 pb-12 md:pt-44 md:pb-16 overflow-hidden",
        className,
      )}
    >
      {/* Soft golden-hour radial echoing the home hero's warmth */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(204,168,78,0.10)_0%,transparent_60%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-grid opacity-[0.10]"
        aria-hidden
      />
      {/* Bottom hairline — soft transition into the page body */}
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-6 lg:px-8 text-center">
        {/* Eyebrow + flanking gem dividers */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <DiamondDivider variant="default" className="max-w-[80px] md:max-w-[140px]" />
          <span className="font-display tracking-[0.4em] text-[11px] md:text-xs text-accent uppercase whitespace-nowrap">
            {resolved.eyebrow}
          </span>
          <DiamondDivider variant="default" className="max-w-[80px] md:max-w-[140px]" />
        </div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase leading-[1] tracking-[0.04em] engraved">
          {resolved.title}
        </h1>

        {resolved.description && (
          <p className="mt-6 max-w-2xl mx-auto font-script italic text-lg md:text-xl text-cream-200 leading-relaxed">
            {resolved.description}
          </p>
        )}
      </div>
    </section>
  );
}
