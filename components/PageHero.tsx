"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

/**
 * Page hero — atmospheric heraldic banner at the top of /migration,
 * /dkp, etc.
 *
 * Design choice — does NOT use the literal hero artwork. The home
 * page's painting has "KINGDOM 3615 / PHOENIX NEST" + the wreath
 * emblem baked into the middle of the canvas, and `object-cover`
 * can only show ~60% of the original image inside a banner-ratio
 * container; either crop leaves the brand title visible and the
 * page's own title sits on top of it = visual collision.
 *
 * Instead, PageHero distills the artwork's palette + mood into pure
 * CSS: sunset-gold radial from above, sakura-rose petal glow from
 * the lower edges, sage banner-green shimmer on the right, plus a
 * pair of stylised sakura branches in the upper corners as a visual
 * echo of the painting. Inner pages thus feel like they live in the
 * same kingdom without literally copying the painting.
 *
 * Two ways to supply content:
 *   1. Explicit strings — `eyebrow`, `title`, `description`.
 *   2. i18n namespace — `tKey="pages.migration"`.
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
        "relative pt-32 pb-12 md:pt-36 md:pb-16 overflow-hidden",
        "min-h-[44vh] md:min-h-[48vh]",
        "flex items-center",
        className,
      )}
    >
      {/* Atmospheric gradient stack — golden-hour mood without the
       *  literal artwork. Stronger here than the body bg so the
       *  banner reads as a distinct stage above page content. */}
      <div className="absolute inset-0">
        {/* Warm gold sky overhead — main light source */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-30%,rgba(230,201,124,0.32)_0%,rgba(204,168,78,0.14)_30%,transparent_65%)]"
          aria-hidden
        />
        {/* Sage-green shimmer from the right — banner echo */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_105%_50%,rgba(58,95,58,0.22)_0%,transparent_55%)]"
          aria-hidden
        />
        {/* Sakura-rose glow from the bottom-left — petal memory */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_-10%_120%,rgba(196,122,138,0.28)_0%,transparent_55%)]"
          aria-hidden
        />
        {/* Bottom fade — softens into the page body below */}
        <div
          className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-background-deep via-background-deep/50 to-transparent"
          aria-hidden
        />
        {/* Subtle grid wallpaper — gives the banner surface texture */}
        <div
          className="absolute inset-0 bg-grid opacity-[0.07]"
          aria-hidden
        />
      </div>

      {/* Sakura branch ornaments — stylised SVG cherry sprigs in the
       *  upper corners. Visual echo of the painting's framing without
       *  needing the bitmap. Hidden on the smallest screens so the
       *  title doesn't get crowded. */}
      <SakuraBranch className="absolute -top-2 -left-4 w-44 md:w-64 text-rose-300/50 rotate-[-12deg] hidden sm:block" />
      <SakuraBranch className="absolute -top-2 -right-4 w-44 md:w-64 text-rose-300/50 rotate-[192deg] hidden sm:block" />

      {/* Inscribed title */}
      <div className="relative mx-auto w-full max-w-5xl px-6 lg:px-8 text-center">
        {resolved.eyebrow && (
          <span className="font-display tracking-[0.45em] text-[10px] md:text-xs text-accent uppercase block mb-3">
            {resolved.eyebrow}
          </span>
        )}

        <h1
          className={[
            "font-display text-4xl md:text-6xl lg:text-7xl uppercase leading-[1] tracking-[0.04em] engraved",
            "[filter:drop-shadow(0_3px_10px_rgba(0,0,0,0.6))_drop-shadow(0_1px_2px_rgba(0,0,0,1))]",
          ].join(" ")}
        >
          {resolved.title}
        </h1>

        {resolved.description && (
          <p
            className={[
              "mt-5 md:mt-6 max-w-2xl mx-auto font-script italic",
              "text-base md:text-lg lg:text-xl text-cream-100 leading-relaxed",
              "[text-shadow:0_2px_6px_rgba(0,0,0,0.7)]",
            ].join(" ")}
          >
            {resolved.description}
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Stylised cherry-blossom branch — used as a corner ornament on
 * PageHero. Single-colour via `currentColor` so a Tailwind text-*
 * class drives the tint.
 *
 * Composition: a curved branch with 5 blossoms scattered along it.
 * Each blossom is a 5-petal flower with a small centre. The branch
 * arcs gently inward from the corner so the visual weight is on the
 * outer edge of the page.
 */
function SakuraBranch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 100"
      fill="none"
      aria-hidden
      className={className}
    >
      {/* Branch — gently curving stroke */}
      <path
        d="M0 18 Q40 8 80 22 Q120 36 160 24 Q180 18 200 28"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
        fill="none"
      />
      {/* Branch shoots */}
      <path
        d="M40 14 L48 4 M82 22 L88 8 M122 34 L116 50 M158 24 L168 12"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
      {/* Five blossoms — each a small 5-petal cluster */}
      {[
        { cx: 14, cy: 16, r: 4.5 },
        { cx: 50, cy: 6, r: 5 },
        { cx: 90, cy: 8, r: 4 },
        { cx: 120, cy: 50, r: 5 },
        { cx: 168, cy: 10, r: 4.5 },
      ].map((b, i) => (
        <g key={i} transform={`translate(${b.cx} ${b.cy})`} opacity="0.85">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="0"
              rx={b.r * 0.7}
              ry={b.r * 0.45}
              fill="currentColor"
              transform={`rotate(${angle}) translate(0 -${b.r * 0.55})`}
            />
          ))}
          <circle cx="0" cy="0" r={b.r * 0.25} fill="currentColor" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}
