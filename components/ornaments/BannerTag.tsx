"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Vertical hanging banner-tag — mirrors the green pennants flanking
 * the hero artwork. Use sparingly: lang-toggle, a status indicator,
 * a Discord shortcut. NOT for general containers.
 *
 * Composition:
 *   1. Top pole (thin gold line + small cap)
 *   2. Banner body — rectangle with a pointed bottom (forest-green
 *      tinted glass)
 *   3. Inner gold inset border (the "trim" you see on real banners)
 *   4. Slot for one piece of content centred inside
 *
 * Anchored as `absolute` from the parent, top-edge attached. Pass
 * `side="left"` or `"right"` to bias the pole shadow.
 */
export function BannerTag({
  children,
  className,
  side = "left",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
}) {
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* Pole + cap */}
      <span
        aria-hidden
        className="block h-3 w-px bg-gradient-to-b from-transparent to-accent/70"
      />
      <span
        aria-hidden
        className="block h-1.5 w-1.5 rotate-45 border border-accent/70 bg-gold-700/40"
      />

      {/* Banner body — pointed-bottom shape via clip-path */}
      <div
        className={cn(
          "relative w-12 px-1.5 pt-3 pb-6 -mt-px",
          "bg-forest-600/70 backdrop-blur-sm",
          "border border-accent/40",
          "shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
          side === "left" ? "drop-shadow-[2px_0_0_rgba(0,0,0,0.25)]" : "drop-shadow-[-2px_0_0_rgba(0,0,0,0.25)]",
        )}
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)",
        }}
      >
        {/* Inner gold trim */}
        <span
          aria-hidden
          className="absolute inset-1 border border-accent/25 pointer-events-none"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 98%, 0 78%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-1">
          {children}
        </div>
      </div>
    </div>
  );
}
