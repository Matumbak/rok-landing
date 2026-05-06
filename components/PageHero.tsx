"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

/**
 * Two ways to use this component:
 *
 *   1. With explicit strings — pass `eyebrow`, `title`, `description`.
 *      Useful one-off content that doesn't live in the i18n dict.
 *
 *   2. With a translation namespace key — pass `tKey="pages.migration"`
 *      and the component looks up `pages.migration.eyebrow / .title /
 *      .description` from the active locale automatically. This is the
 *      common pattern; server-rendered pages use it so they don't have
 *      to become client components themselves.
 *
 *  If both are passed, explicit strings win.
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
        "relative pt-36 pb-14 md:pt-44 md:pb-20 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 bg-grid opacity-25" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,123,61,0.14),_transparent_65%)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="h-px w-12 bg-accent" />
          <span className="font-display tracking-[0.5em] text-xs text-accent uppercase">
            {resolved.eyebrow}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase leading-[1] tracking-[0.04em] engraved">
          {resolved.title}
        </h1>
        {resolved.description && (
          <p className="mt-6 max-w-2xl text-base md:text-lg text-muted leading-relaxed">
            {resolved.description}
          </p>
        )}
      </div>
    </section>
  );
}
