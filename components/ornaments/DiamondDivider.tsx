import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Horizontal gold rule with a rose-gem diamond in the centre. Direct
 * echo of the divider that runs through "KINGDOM 3615" on the hero
 * artwork. Use it between page sections, under page headers, and as
 * a decorative full stop on long form pages.
 *
 * Renders as a flex row so width hugs whatever container holds it.
 *
 * Variants:
 *   `default` — gold rule, rose gem
 *   `gold`    — gold rule, gold gem (no rose accent)
 *   `subtle`  — bronze rule, gold gem (used as in-card dividers)
 */
export function DiamondDivider({
  variant = "default",
  className,
}: {
  variant?: "default" | "gold" | "subtle";
  className?: string;
}) {
  const ruleColor =
    variant === "subtle"
      ? "via-bronze-600/60 to-bronze-600/60"
      : "via-accent/45 to-accent/45";
  const gemColor =
    variant === "subtle" || variant === "gold"
      ? "text-accent"
      : "text-rose";

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
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        className="shrink-0"
      >
        <path
          d="M5 0.5 L9.5 5 L5 9.5 L0.5 5 Z"
          fill="currentColor"
          className={gemColor}
        />
        <path
          d="M5 0.5 L9.5 5 L5 9.5 L0.5 5 Z"
          stroke="currentColor"
          strokeWidth="0.6"
          className="text-gold-200"
          opacity="0.7"
        />
      </svg>
      <span
        className={cn(
          "flex-1 h-px bg-gradient-to-l from-transparent",
          ruleColor,
        )}
      />
    </div>
  );
}
