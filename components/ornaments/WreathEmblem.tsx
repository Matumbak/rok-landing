import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Laurel wreath surrounding a small shield with a cross. Direct echo
 * of the centerpiece emblem on the hero artwork. Use it as a brand
 * mark on detail pages (applicant profile header, migration brief
 * top, "received" confirmation screens).
 *
 * Single-colour via `currentColor` — Tailwind text-* drives tint.
 * Renders crisp at 48px and up; below that the wreath foliage loses
 * detail — fall back to BrandMark (phoenix) for compact placements.
 */
export function WreathEmblem({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className={cn("text-accent", className)}
    >
      {/* Left wreath branch — 4 leaves curving up */}
      <g stroke="currentColor" strokeWidth="1.2" fill="currentColor" opacity="0.85">
        <path d="M14 48 Q10 38 14 28 Q16 24 14 20 M14 48 Q22 46 26 40" />
        <ellipse cx="13" cy="42" rx="3.5" ry="1.5" transform="rotate(-30 13 42)" />
        <ellipse cx="12" cy="36" rx="3.5" ry="1.5" transform="rotate(-50 12 36)" />
        <ellipse cx="13" cy="30" rx="3.5" ry="1.5" transform="rotate(-70 13 30)" />
        <ellipse cx="15" cy="24" rx="3.5" ry="1.5" transform="rotate(-85 15 24)" />
      </g>
      {/* Right wreath branch — mirror */}
      <g stroke="currentColor" strokeWidth="1.2" fill="currentColor" opacity="0.85">
        <path d="M50 48 Q54 38 50 28 Q48 24 50 20 M50 48 Q42 46 38 40" />
        <ellipse cx="51" cy="42" rx="3.5" ry="1.5" transform="rotate(30 51 42)" />
        <ellipse cx="52" cy="36" rx="3.5" ry="1.5" transform="rotate(50 52 36)" />
        <ellipse cx="51" cy="30" rx="3.5" ry="1.5" transform="rotate(70 51 30)" />
        <ellipse cx="49" cy="24" rx="3.5" ry="1.5" transform="rotate(85 49 24)" />
      </g>
      {/* Central shield */}
      <path
        d="M32 18 L42 22 L42 36 Q42 44 32 50 Q22 44 22 36 L22 22 Z"
        fill="currentColor"
        opacity="0.18"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Cross inside shield */}
      <path
        d="M32 24 L32 40 M26 32 L38 32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
      {/* Bottom ribbon hint */}
      <path
        d="M22 50 L32 53 L42 50"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  );
}
