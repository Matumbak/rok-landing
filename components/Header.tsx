"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HunsMark } from "@/components/HunsMark";
import { DISCORD_URL, KINGDOM_ID, NAV_ITEMS } from "@/lib/data";

const DiscordIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="h-4 w-4 fill-current"
  >
    <path d="M19.27 5.33A18 18 0 0 0 14.81 4l-.21.4a16.66 16.66 0 0 1 4.18 1.32 14.83 14.83 0 0 0-12.56 0A16.66 16.66 0 0 1 10.4 4.4L10.18 4a18 18 0 0 0-4.46 1.33A19.4 19.4 0 0 0 2 16.31a18.78 18.78 0 0 0 5.7 2.83l1.16-1.59a11.7 11.7 0 0 1-1.85-.89l.45-.32a13.36 13.36 0 0 0 11.07 0l.45.32a11.7 11.7 0 0 1-1.85.89l1.16 1.59A18.78 18.78 0 0 0 23 16.31a19.4 19.4 0 0 0-3.73-10.98ZM9.5 14.42a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm6 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
  </svg>
);

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled || mobileOpen
          ? "backdrop-blur-md bg-background/70 border-b border-border"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label={`${KINGDOM_ID} Huns — home`}
          >
            <HunsMark className="h-12 w-6 md:h-14 md:w-7 transition-all duration-300 group-hover:scale-105 group-hover:text-accent-bright drop-shadow-[0_0_10px_rgba(201,123,61,0.35)]" />
            <span className="font-display text-base md:text-lg tracking-[0.3em] uppercase hidden sm:inline">
              <span className="text-accent">Huns</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative font-display text-sm tracking-[0.25em] uppercase transition-colors",
                    active
                      ? "text-accent"
                      : "text-muted hover:text-accent",
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-2 left-0 right-0 h-px bg-accent" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Button variant="discord" size="sm">
                <DiscordIcon />
                Discord
              </Button>
            </a>
          </div>

          <button
            type="button"
            className="md:hidden text-foreground"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 flex flex-col gap-4">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-display text-base tracking-[0.25em] uppercase transition-colors",
                    active ? "text-accent" : "text-muted hover:text-accent",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="pt-2"
            >
              <Button variant="discord" size="sm" className="w-full">
                <DiscordIcon />
                Discord
              </Button>
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
