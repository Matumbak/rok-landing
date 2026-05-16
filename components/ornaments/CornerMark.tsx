import * as React from "react";

type Corner = "tl" | "tr" | "bl" | "br";

const PATHS: Record<Corner, string> = {
  tl: "M0.75 9.5 L0.75 0.75 L9.5 0.75",
  tr: "M0.5 0.75 L9.25 0.75 L9.25 9.5",
  bl: "M0.75 0.5 L0.75 9.25 L9.5 9.25",
  br: "M0.5 9.25 L9.25 9.25 L9.25 0.5",
};

/**
 * Small L-shaped gold corner mark, used in sets of 4 to frame
 * heraldic panels and CTAs. Stroke uses `currentColor` so a Tailwind
 * `text-*` class drives the tint; ships at 10px square so it slots
 * cleanly into a 1.5px-inset border arrangement.
 */
export function CornerMark({
  corner,
  size = 10,
  className,
}: {
  corner: Corner;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d={PATHS[corner]}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * Convenience wrapper — drops 4 CornerMarks into the corners of the
 * positioned parent. Parent must be `relative`. Uses negative
 * insets so corners overhang the parent border slightly, looking
 * "nailed on" rather than baked into the edge.
 */
export function CornerFrame({ className }: { className?: string }) {
  return (
    <>
      <span className={`pointer-events-none absolute -top-px -left-px ${className ?? "text-accent"}`}>
        <CornerMark corner="tl" />
      </span>
      <span className={`pointer-events-none absolute -top-px -right-px ${className ?? "text-accent"}`}>
        <CornerMark corner="tr" />
      </span>
      <span className={`pointer-events-none absolute -bottom-px -left-px ${className ?? "text-accent"}`}>
        <CornerMark corner="bl" />
      </span>
      <span className={`pointer-events-none absolute -bottom-px -right-px ${className ?? "text-accent"}`}>
        <CornerMark corner="br" />
      </span>
    </>
  );
}
