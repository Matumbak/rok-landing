"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShieldMark } from "@/components/ShieldMark";
import { KINGDOM_ID } from "@/lib/data";
import { useT } from "@/lib/i18n";

/**
 * Phoenix NEST hero. Replaces the Spartan-Huns landing — single-screen
 * intro with the kingdom shield as a focal element instead of a
 * background photo. Background stack:
 *
 *   1. Crimson radial bloom from the top-left (phoenix glow)
 *   2. Gold radial highlight from the upper-right
 *   3. Animated sweep across the bottom — gives motion without imagery
 *
 * No external image asset required, so the page renders fully even
 * before any kingdom photography is uploaded. When the user drops a
 * proper phoenix illustration into /public, drop it as a fixed bg in
 * place of the gradient stack.
 */
export function Hero() {
  const t = useT();
  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background — pure CSS so the page works without image assets */}
      <div className="absolute inset-0">
        {/* Layered radial blooms recall the phoenix-on-shield colour
         *  story without needing the actual artwork */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgba(142,27,27,0.65)_0%,transparent_55%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_30%,rgba(255,184,0,0.25)_0%,transparent_55%)]"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background-deep via-background/80 to-transparent"
          aria-hidden
        />
        {/* Subtle vignette so corners don't pull focus away from the
         *  shield + headline */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(13,5,3,0.7)_100%)]"
          aria-hidden
        />
      </div>

      <CornerHud />

      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8 py-24 md:py-0">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center gap-3 mb-5"
            >
              <span className="h-px w-12 bg-accent" />
              <span className="font-display tracking-[0.5em] text-xs text-accent uppercase">
                {t("hero.eyebrow", { id: KINGDOM_ID })}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl tracking-[0.06em] uppercase leading-[1] engraved"
            >
              {t("hero.title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
              className="mt-6 max-w-xl text-base md:text-lg text-foreground/90 leading-relaxed [text-shadow:0_1px_8px_rgba(13,5,3,0.85)]"
            >
              {/* Split on the {{focus}} placeholder so we can wrap the
                  recruitment focus in an accent span — keeps the dict
                  HTML-free. */}
              {(() => {
                const parts = t("hero.description").split("{{focus}}");
                return parts.flatMap((part, i) =>
                  i < parts.length - 1
                    ? [
                        part,
                        <span
                          key={`focus-${i}`}
                          className="text-accent-bright font-semibold"
                        >
                          SoC 7 / B-seed
                        </span>,
                      ]
                    : [part],
                );
              })()}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.45 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link href="/migration">
                <Button size="lg" className="btn-royal pulse-glow">
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

          {/* Shield panel — large kingdom crest as the visual anchor.
           *  Hidden on the smallest screens so the headline owns the
           *  fold; reappears at md+. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            className="order-1 md:order-2 flex justify-center md:justify-end"
          >
            <div className="relative">
              {/* Crimson glow ring behind the shield */}
              <div
                className="absolute inset-0 -m-8 rounded-full bg-[radial-gradient(circle,rgba(255,184,0,0.35)_0%,transparent_60%)] blur-2xl"
                aria-hidden
              />
              <ShieldMark
                kingdomId={KINGDOM_ID}
                className="relative h-56 w-48 md:h-80 md:w-72 drop-shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
              />
            </div>
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
