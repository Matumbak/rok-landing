import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display tracking-[0.2em] uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-accent-bright to-accent text-background-deep font-semibold shadow-[inset_0_1px_0_rgba(255,200,150,0.35),0_0_0_1px_rgba(201,123,61,0.6)] hover:shadow-[inset_0_1px_0_rgba(255,200,150,0.45),0_0_28px_rgba(201,123,61,0.6)]",
        outline:
          "border border-accent/50 text-accent bg-accent/[0.04] hover:bg-accent hover:text-background-deep hover:border-accent",
        ghost: "text-foreground hover:text-accent",
        discord:
          "bg-[#5865F2] text-white hover:bg-[#4752c4] shadow-[0_0_0_1px_rgba(88,101,242,0.6)] hover:shadow-[0_0_24px_rgba(88,101,242,0.5)]",
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
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
