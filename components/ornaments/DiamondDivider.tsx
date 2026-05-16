import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Horizontal gold rule with a faceted rose gem in the centre. Direct
 * echo of the divider that runs through "KINGDOM 3615" on the hero
 * artwork.
 *
 * The gem is a proper faceted SVG — radial body gradient + corner
 * facet planes + top highlight glint + gold rim + soft outer glow —
 * not the flat pink-rhombus-with-yellow-stroke the v1 ornament had.
 *
 * Variants:
 *   `default` — gold rule, rose gem (page primary)
 *   `gold`    — gold rule, gold gem (no pink, used in dense sections)
 *   `subtle`  — bronze rule, gold gem (in-card dividers)
 */
export function DiamondDivider({
  variant = "default",
  className,
  gemSize = 14,
}: {
  variant?: "default" | "gold" | "subtle";
  className?: string;
  gemSize?: number;
}) {
  const ruleColor =
    variant === "subtle"
      ? "via-bronze-600/60 to-bronze-600/60"
      : "via-accent/55 to-accent/55";

  return (
    <div
      className={cn("flex items-center gap-3 w-full", className)}
      aria-hidden
    >
      <span
        className={cn(
          "flex-1 h-px bg-gradient-to-r from-transparent",
          ruleColor,
        )}
      />
      <Gem variant={variant} size={gemSize} />
      <span
        className={cn(
          "flex-1 h-px bg-gradient-to-l from-transparent",
          ruleColor,
        )}
      />
    </div>
  );
}

/**
 * Faceted princess-cut gem. Re-usable on its own (score chips,
 * status badges, decorative pulls) — exported via the ornaments
 * barrel.
 */
export function Gem({
  variant = "default",
  size = 14,
}: {
  variant?: "default" | "gold" | "subtle";
  size?: number;
}) {
  const isRose = variant === "default";
  const fillId = isRose ? "gem-fill-rose" : "gem-fill-gold";
  const highlightId = isRose ? "gem-hi-rose" : "gem-hi-gold";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0"
      // Soft outer glow — drop-shadow filter on the wrapper
      style={{
        filter: isRose
          ? "drop-shadow(0 0 3px rgba(196,122,138,0.45))"
          : "drop-shadow(0 0 3px rgba(204,168,78,0.4))",
      }}
    >
      <defs>
        {/* Body gradient — light top → mid → deep bottom */}
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          {isRose ? (
            <>
              <stop offset="0%"   stopColor="#f5d5c5" />
              <stop offset="35%"  stopColor="#d89ca0" />
              <stop offset="70%"  stopColor="#a86072" />
              <stop offset="100%" stopColor="#5e3040" />
            </>
          ) : (
            <>
              <stop offset="0%"   stopColor="#f0dcaa" />
              <stop offset="35%"  stopColor="#cca84e" />
              <stop offset="70%"  stopColor="#7a5418" />
              <stop offset="100%" stopColor="#3a280c" />
            </>
          )}
        </linearGradient>

        {/* Top-facet highlight gradient — soft white-tint at the
         *  upper plane to suggest light catching the gem */}
        <linearGradient id={highlightId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Gem body — outer diamond */}
      <path
        d="M8 0.6 L15.4 8 L8 15.4 L0.6 8 Z"
        fill={`url(#${fillId})`}
      />

      {/* Top facet — slightly lighter triangle catching the top
       *  light. Spans from gem peak to halfway down. */}
      <path
        d="M8 0.6 L15.4 8 L8 8 L0.6 8 Z"
        fill={`url(#${highlightId})`}
      />

      {/* Bright highlight glint — small upper-left wedge, the
       *  classic "twinkle" on a gem */}
      <path
        d="M8 1.2 L11.5 4.8 L8 8 L4.5 4.8 Z"
        fill="#ffffff"
        opacity="0.18"
      />

      {/* Inner facet edges — thin internal lines suggesting the
       *  cut planes. Helps the eye read it as a faceted stone. */}
      <path
        d="M8 0.6 L8 15.4 M0.6 8 L15.4 8"
        stroke="#ffffff"
        strokeWidth="0.35"
        opacity="0.22"
      />

      {/* Gold rim — sits over everything, thin */}
      <path
        d="M8 0.6 L15.4 8 L8 15.4 L0.6 8 Z"
        fill="none"
        stroke="#e6c97c"
        strokeWidth="0.7"
        strokeLinejoin="miter"
      />

      {/* Deeper shadow stroke under the rim — gives the rim a
       *  pressed-bezel feel */}
      <path
        d="M8 1.5 L14.5 8 L8 14.5 L1.5 8 Z"
        fill="none"
        stroke="#5e3f12"
        strokeWidth="0.35"
        opacity="0.55"
      />
    </svg>
  );
}
