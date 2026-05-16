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
      {/* Background plate. Mobile crop is portrait-tall; we shift its
       *  object-position UP so the wreath emblem sits in the upper
       *  third of the viewport — that pushes the dim/dark bottom band
       *  of the painting off-screen and the inscription strip below
       *  doesn't sit in a void of empty space. Desktop keeps centred. */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg-mobile.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 0px, 100vw"
          className="object-cover object-[center_25%] md:hidden"
        />
        <Image
          src="/hero-bg-desktop.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 100vw, 0px"
          className="hidden md:block object-cover object-center"
        />

        {/* Subtle warm radial */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(204,168,78,0.10)_0%,transparent_60%)]"
          aria-hidden
        />

        {/* Two-layer bottom scrim. Mobile uses a TALLER fade region
         *  but a SHORTER solid band — the artwork is shifted up
         *  (object-[center_25%]) so we don't need a huge solid mask
         *  at the bottom; instead a long soft fade smoothly hands off
         *  the lower painting into the inscription strip with no
         *  visible void between them. Desktop keeps the original
         *  proportions because the centred crop has more to mask. */}
        <div
          className="absolute inset-x-0 bottom-0 h-[14%] md:h-[26%] bg-background-deep"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-[14%] md:bottom-[26%] h-[34%] md:h-[20%] bg-gradient-to-t from-background-deep via-background-deep/85 to-transparent"
          aria-hidden
        />

        {/* Petal-rose glow — kept in the inscription area */}
        <div
          className="absolute inset-x-0 bottom-0 h-[40%] md:h-[26%] bg-[radial-gradient(ellipse_at_20%_75%,rgba(196,122,138,0.12)_0%,transparent_55%)]"
          aria-hidden
        />
      </div>

      <CornerHud />

      {/* Inscription strip. Mobile pulls content up via mb-* (pushing
       *  the items-end target higher) so slogan + CTAs sit ~30vh up
       *  from the bottom edge, right under the visible artwork —
       *  no glued-to-bottom + void-above pattern. Desktop keeps the
       *  bottom-flush anchoring. */}
      <div className="relative mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-8 pb-8 md:pb-14">
        <h1 className="sr-only">{t("hero.title")}</h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="text-center"
        >
          <DiamondDivider
            variant="default"
            className="max-w-[120px] md:max-w-[140px] mx-auto mb-5 md:mb-6"
          />

          <p
            className={[
              "font-script italic",
              "text-base sm:text-xl md:text-2xl lg:text-3xl",
              "text-cream-100 leading-snug",
              "max-w-2xl mx-auto px-2",
              "[text-shadow:0_2px_12px_rgba(0,0,0,0.9),0_0_2px_rgba(0,0,0,1)]",
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
