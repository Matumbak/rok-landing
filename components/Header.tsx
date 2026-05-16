"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";
import { Gem } from "@/components/ornaments";
import { DISCORD_URL, KINGDOM_ID, NAV_ITEMS } from "@/lib/data";
import { useT, useLocale } from "@/lib/i18n";

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
  const t = useT();

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
        // Always-on backdrop. Earlier we kept the header transparent
        // until scroll, but the new bright hero artwork (sakura,
        // gold lettering, sunset sky) made the nav text disappear at
        // the top of the page. A persistent translucent backdrop +
        // soft gradient fade keeps the brand + nav readable over any
        // bg while preserving the "barely-there chrome" look.
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled || mobileOpen
          ? "backdrop-blur-md bg-background-deep/85 border-b border-border-bronze/40"
          : "backdrop-blur-sm bg-gradient-to-b from-background-deep/85 via-background-deep/50 to-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label={`Kingdom ${KINGDOM_ID} — Phoenix NEST`}
          >
            <BrandMark className="h-9 w-9 md:h-10 md:w-10 text-accent transition-transform duration-300 group-hover:scale-105 group-hover:text-accent-bright drop-shadow-[0_0_8px_rgba(200,160,74,0.4)]" />
            <span className="font-display text-base md:text-lg tracking-[0.3em] uppercase hidden sm:inline">
              <span className="text-accent">Phoenix</span>
              <span className="text-foreground/70"> NEST</span>
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
                    "relative font-display text-sm tracking-[0.25em] uppercase transition-colors py-1",
                    "focus-visible:outline-none focus-visible:text-accent",
                    active ? "text-accent" : "text-muted hover:text-accent",
                  )}
                >
                  {t(`nav.${item.tKey}`)}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center"
                    >
                      <Gem size={8} variant="default" />
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LangToggle />
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Button variant="discord" size="sm">
                <DiscordIcon />
                {t("nav.discord")}
              </Button>
            </a>
          </div>

          <button
            type="button"
            className="md:hidden text-foreground"
            aria-label={t("nav.toggleMenu")}
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
            {/* Wrap in <nav> so the RU font override in globals.css
             *  (`header nav .font-display`) catches mobile menu items
             *  the same way it catches desktop nav. */}
            <nav className="flex flex-col gap-4">
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
                    {t(`nav.${item.tKey}`)}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-2 flex items-center gap-3">
              <LangToggle />
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="flex-1"
              >
                <Button variant="discord" size="sm" className="w-full">
                  <DiscordIcon />
                  {t("nav.discord")}
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Two-state EN/RU pill. Auto-detection (browser language) decides the
 * initial value, but officers running an English-locale OS still want
 * to read the form in Russian (or vice versa) — so we expose a manual
 * override that persists in localStorage.
 */
function LangToggle() {
  const { locale, setLocale } = useLocale();
  const t = useT();
  return (
    <div
      role="group"
      aria-label={t("langSwitch.label")}
      className="inline-flex border border-accent/60 bg-bronze-900/70 backdrop-blur-sm divide-x divide-accent/30"
    >
      {(["en", "ru"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={cn(
            "px-2.5 py-1 text-[10px] font-display tracking-[0.2em] uppercase transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-inset",
            locale === l
              ? "bg-accent/20 text-accent-bright"
              : "text-muted hover:text-foreground hover:bg-bronze-700/40",
          )}
          aria-pressed={locale === l}
        >
          {t(`langSwitch.${l}`)}
        </button>
      ))}
    </div>
  );
}
