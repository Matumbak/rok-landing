"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KINGDOM_ID } from "@/lib/data";
import { useT } from "@/lib/i18n";

/**
 * Phoenix NEST hero — v2 layout.
 *
 * The new hero artwork bakes "KINGDOM 3615 / PHOENIX NEST" + the
 * royal crest into the image itself (centered, upper-middle). The
 * old layout duplicated that text in a left-aligned panel which
 * fought the composition. v2 swaps the panel for a bottom-anchored
 * slogan strip + CTAs so the page reads as:
 *
 *     [ HERO ARTWORK with brand baked in ]
 *     [   eyebrow + slogan + CTA buttons   ]
 *
 * The big h1 is sr-only so non-image fallbacks and SEO still see the
 * title; the visible composition trusts the artwork to carry it.
 *
 * Tint overlays match the new palette: soft gold-sunset radials
 * instead of the previous crimson + neon-gold combo that suited the
 * fiery phoenix bg.
 */
export function Hero() {
  const t = useT();
  return (
    <section className="relative min-h-[100svh] flex items-end md:items-center overflow-hidden">
      {/* Full-bleed kingdom artwork — separate mobile + desktop crops
       *  so portrait phones get a different focal area than landscape
       *  screens. */}
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
        {/* Soft warm tints — replace the previous crimson + neon-gold
         *  overlays that suited the fiery phoenix bg. The new artwork
         *  already carries its own golden-hour palette, so we just
         *  gently reinforce it from the corners. */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(204,168,78,0.12)_0%,transparent_55%)]"
          aria-hidden
        />
        {/* Bottom fade — anchors the page into the body bg below and
         *  gives the slogan strip a readable backplate. */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-background-deep via-background/80 to-transparent"
          aria-hidden
        />
      </div>

      <CornerHud />

      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8 pb-12 md:pb-0 md:pt-[55vh]">
        {/* sr-only h1 keeps SEO + screen readers in the loop; the
         *  visible "Phoenix NEST" headline lives inside the artwork. */}
        <h1 className="sr-only">{t("hero.title")}</h1>

        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="h-px w-12 bg-accent" />
            <span className="font-display tracking-[0.5em] text-xs text-accent uppercase">
              {t("hero.eyebrow", { id: KINGDOM_ID })}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="max-w-xl text-base md:text-lg text-foreground/95 leading-relaxed [text-shadow:0_1px_8px_rgba(12,8,5,0.9)]"
          >
            {t("hero.description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
            className="mt-8 flex flex-wrap gap-4"
          >
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
          </motion.div>
        </div>
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
