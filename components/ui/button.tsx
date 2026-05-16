import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button system per Design System v3 §7.1-7.3.
 *
 *   primary  → "heraldic": dark bronze surface, gold engraved text,
 *              thin gold rim. Looks like an inscribed metal plate.
 *              No bouncing on hover — only rim catches sunlight.
 *   outline  → secondary: transparent surface, dim gold rim, brightens
 *              on hover.
 *   ghost    → tertiary: no chrome, text-color only.
 *   discord  → utility variant, keeps Discord brand colour. Skipped the
 *              heraldic treatment because Discord blue is a known
 *              external mark and should look like itself.
 *
 * Old gradient-fill "primary" treatment ("цыганская кнопка") removed —
 * the new look reads as polished metal rather than a Mario block.
 */
const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-display tracking-[0.2em] uppercase",
    "transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          // Surface — dark bronze, slightly darker than page card
          "bg-bronze-800",
          // Gold engraved text (gradient fill via .engraved utility,
          // but Tailwind text-* won't apply when using .engraved, so
          // we set the gradient inline here instead — text-accent
          // serves as a fallback for browsers that don't honour
          // background-clip: text)
          "text-accent",
          "[background-image:linear-gradient(180deg,var(--bronze-700),var(--bronze-800))]",
          // Rim
          "border border-accent/70",
          // Top highlight (inner inset shadow — metal sheen)
          "shadow-[inset_0_1px_0_rgba(240,220,170,0.18),0_2px_8px_rgba(0,0,0,0.45)]",
          // Hover — rim brightens, sheen lifts
          "hover:border-accent-bright",
          "hover:shadow-[inset_0_1px_0_rgba(240,220,170,0.28),0_2px_12px_rgba(0,0,0,0.55)]",
          // Active — rim dims, "pressed metal"
          "active:border-accent-deep",
          "active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]",
        ].join(" "),
        outline: [
          "bg-transparent",
          "text-cream-200",
          "border border-accent-deep",
          "hover:border-accent hover:text-cream-50",
          "active:border-accent-deep",
        ].join(" "),
        ghost: [
          "bg-transparent border border-transparent",
          "text-muted",
          "hover:text-foreground hover:bg-bronze-700/30",
        ].join(" "),
        discord: [
          "bg-[#5865F2] text-white",
          "hover:bg-[#4752c4]",
          "shadow-[0_0_0_1px_rgba(88,101,242,0.6)]",
          "hover:shadow-[0_0_18px_rgba(88,101,242,0.45)]",
        ].join(" "),
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const isPrimary = (variant ?? "primary") === "primary";
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {/* Heraldic corner marks — 4 small nailheads at the rim
         *  corners, only on the primary metal variant. Decoration
         *  only; pointer-events-none so they don't steal hover. */}
        {isPrimary && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-accent-bright/70"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-accent-bright/70"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-accent-bright/70"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-accent-bright/70"
            />
          </>
        )}
        <span className={isPrimary ? "relative engraved" : "relative"}>
          {children}
        </span>
      </button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
