import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.SVGProps<SVGSVGElement> & {
  className?: string;
  /** Kingdom number stamped across the shield. Defaults to the
   *  imported KINGDOM_ID — pass a different value if you need a
   *  parameterised crest (e.g. for non-canonical previews). */
  kingdomId?: string;
};

/**
 * Heater shield with the kingdom number engraved across the centre and
 * a phoenix glyph silhouette behind it. Replaces the old HunsMark
 * (Spartan helmet) — Phoenix NEST kingdom branding leans on red/gold
 * heraldry rather than antique-Greek aesthetics, so the logo follows.
 *
 * Renders flat-color via `currentColor` so a single Tailwind text-*
 * class drives both the shield outline and the inscription. The
 * phoenix wing motif uses an opacity-stepped fill to keep the focal
 * digits readable at any size.
 */
export function ShieldMark({
  className,
  kingdomId = "3615",
  ...rest
}: Props) {
  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Kingdom ${kingdomId} crest`}
      className={cn("text-accent", className)}
      {...rest}
    >
      <defs>
        {/* Burnished antique gold — same tones as .engraved in
         *  globals.css. Avoid the bright #FFB800 family; reads as
         *  cheap costume gold against the painterly phoenix bg. */}
        <linearGradient id="shield-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8c490" />
          <stop offset="50%" stopColor="#b8902c" />
          <stop offset="100%" stopColor="#6e4e1c" />
        </linearGradient>
        <linearGradient id="shield-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8e1b1b" />
          <stop offset="100%" stopColor="#4a0d0d" />
        </linearGradient>
      </defs>

      {/* Shield silhouette — heater shape */}
      <path
        d="M 100 8 L 188 36 L 188 110 C 188 168 154 210 100 232 C 46 210 12 168 12 110 L 12 36 Z"
        fill="url(#shield-red)"
        stroke="url(#shield-gold)"
        strokeWidth="4"
      />

      {/* Phoenix wing silhouette — soft, behind the digits */}
      <g opacity="0.3" fill="#d8c490">
        <path d="M 60 70 Q 100 50 140 70 Q 130 95 100 105 Q 70 95 60 70 Z" />
        <path d="M 50 105 Q 75 90 95 110 Q 85 130 65 130 Q 50 122 50 105 Z" />
        <path d="M 150 105 Q 125 90 105 110 Q 115 130 135 130 Q 150 122 150 105 Z" />
      </g>

      {/* Kingdom number — display digits stamped across the centre */}
      <text
        x="100"
        y="148"
        textAnchor="middle"
        fontFamily="var(--font-cinzel), serif"
        fontWeight="800"
        fontSize="58"
        fill="url(#shield-gold)"
        stroke="#3a0808"
        strokeWidth="1"
        letterSpacing="2"
        style={{
          paintOrder: "stroke",
          filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.6))",
        }}
      >
        {kingdomId}
      </text>

      {/* Bottom flourish — small gold bar to anchor the composition */}
      <rect
        x="60"
        y="170"
        width="80"
        height="4"
        fill="url(#shield-gold)"
        opacity="0.7"
      />
    </svg>
  );
}
