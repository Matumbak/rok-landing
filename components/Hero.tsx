"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KINGDOM_ID } from "@/lib/data";
import { useT } from "@/lib/i18n";

/**
 * Phoenix NEST hero — v4.
 *
 * v3's hard-bordered panel read as a "drawer pasted on the artwork".
 * v4 ditches the box, anchors slogan + CTAs to the bottom of the
 * viewport directly on a deeper bg-fade scrim, and brings sakura-
 * rose accents in from the artwork (the artwork's "3615" digits are
 * rose-gold, crown gems + banner gems are bright pink, cherry petals
 * everywhere) so the page reads as continuous with the bg instead of
 * sitting in front of it.
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
        {/* Bottom scrim — heavy dark fade so the slogan + CTAs read
         *  without a hard panel. Top of the fade is fully transparent
         *  to let the artwork breathe; bottom is opaque enough that
         *  body text gets full contrast. */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background-deep via-background-deep/90 to-transparent"
          aria-hidden
        />
        {/* Subtle rose glow from the bottom-left — picks up the
         *  cherry-blossom + gem pink of the artwork and ties the
         *  page colour story to the bg. */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_95%,rgba(196,122,138,0.18)_0%,transparent_45%)]"
          aria-hidden
        />
      </div>

      <CornerHud />

      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8 pb-10 md:pb-14">
        <h1 className="sr-only">{t("hero.title")}</h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="max-w-2xl"
        >
          {/* Eyebrow — "KINGDOM" stays gold, the number echoes the
           *  rose-gold "3615" lettering on the artwork. The thin
           *  rule alternates gold → rose to bring the pink accent
           *  into the page chrome. */}
          <div className="flex items-center gap-3 mb-4">
            <span
              aria-hidden
              className="h-px w-12 bg-gradient-to-r from-accent via-rose to-transparent"
            />
            <span className="font-display tracking-[0.4em] text-[11px] uppercase">
              <span className="text-accent">Kingdom</span>{" "}
              <span className="engraved-rose">{KINGDOM_ID}</span>
            </span>
          </div>

          <p className="max-w-xl text-lg md:text-xl text-foreground font-medium leading-relaxed [text-shadow:0_2px_10px_rgba(0,0,0,0.85),0_0_2px_rgba(0,0,0,0.9)]">
            {t("hero.description")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
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
