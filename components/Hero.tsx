"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      {/* Background — full artwork, visible end-to-end. No scrim band
       *  swallows the lower half of the painting (balustrade + mountains
       *  + foreground are intentional composition; user reads them).
       *  Readability for the inscription text comes from per-element
       *  text-shadow + the buttons' own surfaces, not from blacking
       *  out the canvas. */}
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

        {/* Soft vertical vignette — TOP fade hands the artwork off to
         *  the always-on header backdrop; BOTTOM fade is just a 12vh
         *  whisper of dark tail that anchors the page to the footer
         *  below (no longer a wholesale scrim). The painting itself
         *  stays visible throughout. */}
        <div
          className="absolute inset-x-0 top-0 h-[14vh] bg-gradient-to-b from-background-deep/55 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[14vh] bg-gradient-to-t from-background-deep via-background-deep/50 to-transparent"
          aria-hidden
        />

        {/* Subtle side-edges vignette — pulls focus to the painted
         *  central column without dimming any meaningful content */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_55%,_rgba(12,8,5,0.45)_100%)] pointer-events-none"
          aria-hidden
        />
      </div>

      <CornerHud />

      {/* Inscription block — slogan + CTAs sit over the artwork's
       *  lower foreground (balustrade / mountains / silhouette zone),
       *  which is already darker tonality. Text-shadow handles the
       *  remaining contrast; the artwork itself stays visible. */}
      <div className="relative mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-8 pb-10 md:pb-16">
        <h1 className="sr-only">{t("hero.title")}</h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="text-center"
        >
          {/*
           * Slogan readability — over the painting we need real
           * contrast without an opaque backdrop. Layered text-shadow
           * gives a soft halo (12px black blur + 2px edge crisp +
           * 1px outline-sharp) which reads cleanly on both the dim
           * foreground silhouette AND the brighter sky patches that
           * bleed through at the edges.
           */}
          <p
            className={[
              "font-script italic",
              "text-base sm:text-xl md:text-2xl lg:text-3xl",
              "text-cream-50 leading-snug",
              "max-w-2xl mx-auto px-2",
              "[text-shadow:0_0_16px_rgba(0,0,0,0.95),0_2px_6px_rgba(0,0,0,1),0_0_2px_rgba(0,0,0,1)]",
            ].join(" ")}
          >
            {t("hero.description")}
          </p>

          <div className="mt-6 md:mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:justify-center">
            <Link href="/migration" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">
                {t("hero.cta.join")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dkp" className="w-full sm:w-auto">
              {/* Hero outline button gets a backdrop-blur wrap so its
               *  text stays readable over the artwork. Outline variant
               *  on its own is transparent — fine on a dark page bg,
               *  underconstrast over a busy painting. */}
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto backdrop-blur-md bg-bronze-900/45"
              >
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
