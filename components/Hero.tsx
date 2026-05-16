"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiamondDivider } from "@/components/ornaments";
import { useT } from "@/lib/i18n";

/**
 * Phoenix NEST hero — rebuilt per Design System v3 §8.1.
 *
 * Strategy: the artwork is self-contained brand chrome. It already
 * shows "KINGDOM 3615 / PHOENIX NEST" + the wreath emblem at huge
 * scale, so the page chrome doesn't repeat any of that. Only thing
 * the page contributes is the SLOGAN + CTAs, rendered as if they
 * were inscribed on the stone balustrade at the bottom of the
 * painting.
 *
 * Changes from previous iterations:
 *   • No "KINGDOM 3615" eyebrow under the artwork — that text was
 *     literally above it already (user feedback). Replaced with a
 *     single DiamondDivider ornament as a visual stop between the
 *     painting and the CTA block.
 *   • Slogan moved from Inter Tight sans-serif to Cormorant
 *     Garamond italic — reads as a royal motto/inscription instead
 *     of a modern web tagline. Matches the painting's serif gold
 *     lettering.
 *   • Heraldic primary CTA reinforced (lighter polished-bronze
 *     surface, thicker rim, stronger sheen) so it pops against the
 *     dark scrim.
 *   • Mobile: CTAs stack full-width vertically; content positioned
 *     bottom-third with extra padding so it doesn't get crushed
 *     under the artwork.
 */
export function Hero() {
  const t = useT();
  return (
    <section className="relative min-h-[100svh] flex items-end overflow-hidden">
      {/* Background plate */}
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

        {/* Subtle warm radial — reinforces the golden-hour mood */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(204,168,78,0.10)_0%,transparent_60%)]"
          aria-hidden
        />

        {/* Bottom scrim — TWO LAYERS for a clean cut between artwork
         *  and inscription strip. Lower layer is solid bg-deep so
         *  the wreath emblem from the painting can't bleed into the
         *  inscription area at the bottom; upper layer is the soft
         *  fade that smoothly transitions back into the artwork
         *  higher up. Earlier single-layer scrim let the artwork's
         *  wreath emblem leak into the CTA area ("наплывание"). */}
        <div
          className="absolute inset-x-0 bottom-0 h-[28%] md:h-[26%] bg-background-deep"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-[28%] md:bottom-[26%] h-[24%] md:h-[20%] bg-gradient-to-t from-background-deep via-background-deep/92 to-transparent"
          aria-hidden
        />

        {/* Petal-rose glow from the bottom-left, sits in the
         *  inscription area to tie the strip to the artwork pinks */}
        <div
          className="absolute inset-x-0 bottom-0 h-[28%] md:h-[26%] bg-[radial-gradient(ellipse_at_20%_75%,rgba(196,122,138,0.12)_0%,transparent_55%)]"
          aria-hidden
        />
      </div>

      <CornerHud />

      {/* Inscription strip — slogan + CTAs in the solid scrim band
       *  at the very bottom of the viewport. The artwork's wreath +
       *  shield emblem now sits comfortably above the scrim's hard
       *  edge, no overlap. */}
      <div className="relative mx-auto w-full max-w-5xl px-6 lg:px-8 pb-10 md:pb-14">
        <h1 className="sr-only">{t("hero.title")}</h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="text-center"
        >
          {/* Visual stop between artwork and inscription — single
           *  diamond divider, no text. The artwork carries the
           *  brand; we don't repeat it. */}
          <DiamondDivider variant="default" className="max-w-[140px] mx-auto mb-6" />

          {/* Slogan — serif italic, royal-inscription voice.
           *  Layered text-shadow keeps it crisp over any patch of
           *  the painting that bleeds through the scrim. */}
          <p
            className={[
              "font-script italic",
              "text-xl md:text-2xl lg:text-3xl",
              "text-cream-100 leading-snug",
              "max-w-2xl mx-auto",
              "[text-shadow:0_2px_12px_rgba(0,0,0,0.9),0_0_2px_rgba(0,0,0,1)]",
            ].join(" ")}
          >
            {t("hero.description")}
          </p>

          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:justify-center">
            <Link href="/migration" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">
                {t("hero.cta.join")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dkp" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
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
