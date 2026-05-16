"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KINGDOM_ID } from "@/lib/data";
import { useT } from "@/lib/i18n";

/**
 * Phoenix NEST hero — v3 layout.
 *
 * v2 dropped the backplate trusting the artwork; v3 readability test
 * failed (eyebrow + slogan got lost in the bright sakura/gold scene).
 * Restored a heraldic backplate styled to feel like part of the
 * kingdom UI — dark forest-tinted glass with a gold-edge frame
 * mirroring the green banners in the artwork — and anchored to the
 * bottom of the viewport so the centered "KINGDOM 3615 / PHOENIX
 * NEST" lettering on the bg art stays the visual hero.
 *
 * The h1 is sr-only — the visible brand lives inside the artwork.
 */
export function Hero() {
  const t = useT();
  return (
    <section className="relative min-h-[100svh] flex items-end overflow-hidden">
      {/* Full-bleed kingdom artwork — separate mobile + desktop crops
       *  so portrait phones get a different focal area than landscape. */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg-mobile.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 0px, 100vw"
          className="object-cover object-center md:hidden"
        />
        <Image
          src="/hero-bg-desktop.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 100vw, 0px"
          className="hidden md:block object-cover object-center"
        />
        {/* Bottom fade — wider + darker than v2 so the slogan panel
         *  has a soft transition into the artwork instead of floating
         *  on top of a busy band of detail. */}
        <div
          className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-background-deep via-background/85 to-transparent"
          aria-hidden
        />
      </div>

      <CornerHud />

      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8 pb-10 md:pb-16">
        <h1 className="sr-only">{t("hero.title")}</h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="max-w-2xl"
        >
          {/* Heraldic panel — forest-green-tinted glass with a gold
           *  edge, echoing the green/gold banners in the artwork.
           *  Higher-opacity backplate than v2 so foreground text reads
           *  cleanly over any part of the bg. */}
          <div className="relative bg-[rgba(12,8,5,0.78)] backdrop-blur-md border border-accent/50 px-6 py-6 md:px-8 md:py-7 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {/* Inner gold hairline — gives the panel that "framed
             *  scroll" feel without extra dom. */}
            <span
              aria-hidden
              className="absolute inset-1.5 border border-accent/20 pointer-events-none"
            />

            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-px w-10 bg-accent" />
                <span className="font-display tracking-[0.4em] text-[10px] text-accent-bright uppercase">
                  {t("hero.eyebrow", { id: KINGDOM_ID })}
                </span>
              </div>

              <p className="max-w-xl text-base md:text-lg text-foreground leading-relaxed [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
                {t("hero.description")}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/migration">
                  <Button size="lg" className="btn-royal">
                    {t("hero.cta.join")}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dkp">
                  <Button size="lg" variant="outline">
                    {t("hero.cta.standings")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CornerHud() {
  const corners = [
    { pos: "top-6 left-6", lines: "border-l border-t" },
    { pos: "top-6 right-6", lines: "border-r border-t" },
    { pos: "bottom-6 left-6", lines: "border-l border-b" },
    { pos: "bottom-6 right-6", lines: "border-r border-b" },
  ];
  return (
    <>
      {corners.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className={`absolute ${c.pos} ${c.lines} h-10 w-10 border-accent/40 pointer-events-none`}
        />
      ))}
    </>
  );
}
