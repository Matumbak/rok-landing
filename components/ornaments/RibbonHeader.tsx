import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Banner-style section header — a horizontal ribbon with pointed
 * ends, an inscribed title inside. Used for section anchors on
 * long pages (KingdomInfo, requirements, DKP standings header,
 * etc.).
 *
 * Composition is pure CSS:
 *   - clip-path arrow shape on both sides
 *   - dark bronze surface with thin gold inner trim
 *   - engraved title text centred
 *
 * The title is rendered via children so callers can mix translations
 * + decorative spans (e.g. eyebrow + accent number).
 */
export function RibbonHeader({
  children,
  className,
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const padX = size === "lg" ? "px-14" : size === "sm" ? "px-8" : "px-10";
  const padY = size === "lg" ? "py-3" : size === "sm" ? "py-1.5" : "py-2";
  const textSize =
    size === "lg" ? "text-xl md:text-2xl" : size === "sm" ? "text-sm" : "text-base md:text-lg";

  return (
    <div className={cn("relative inline-flex", className)}>
      <div
        className={cn(
          "relative bg-bronze-800/85 backdrop-blur-sm",
          "border-y border-accent/60",
          "shadow-[0_4px_16px_rgba(0,0,0,0.4)]",
          padX,
          padY,
        )}
        style={{
          clipPath:
            "polygon(0% 50%, 4% 0%, 96% 0%, 100% 50%, 96% 100%, 4% 100%)",
        }}
      >
        <span
          aria-hidden
          className="absolute inset-y-1 left-2 right-2 border-y border-accent/20"
        />
        <div
          className={cn(
            "relative font-display uppercase tracking-[0.3em] text-center",
            "engraved",
            textSize,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
