"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KINGDOM_ID } from "@/lib/data";
import { useT } from "@/lib/i18n";

/**
 * Phoenix NEST hero. Full-bleed phoenix imagery as the background,
 * with a maroon/crimson tint on top to keep the brand colour story
 * intact and the foreground text readable. Single copy column —
 * the right-side shield was competing with the phoenix artwork in
 * the source image, so the layout drops to a single column and lets
 * the artwork breathe. The header keeps the small kingdom shield as
 * the brand mark.
 *
 * The text column sits on a backdrop-blurred panel per Gemini's brief
 * (`backdrop-filter: blur(10px); background: rgba(20,15,10,0.7)`) so
 * the headline survives the sometimes-busy phoenix artwork below it.
 */
export function Hero() {
  const t = useT();
  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Full-bleed phoenix background — separate mobile + desktop crops
       *  so portrait phones get a different focal area than landscape
       *  screens. Both images live in /public; sizes hint Next/Image's
       *  responsive loader to pick the right one. */}
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
        {/* Crimson + gold tint over the photo — keeps the Phoenix NEST
         *  palette regardless of what's in the source image */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgba(142,27,27,0.45)_0%,transparent_55%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_30%,rgba(255,184,0,0.18)_0%,transparent_55%)]"
          aria-hidden
        />
        {/* Bottom fade — anchors the page into the body bg below */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background-deep via-background/70 to-transparent"
          aria-hidden
        />
        {/* Global dim — cuts overall contrast so foreground text reads */}
        <div
          className="absolute inset-0 bg-background-deep/35"
          aria-hidden
        />
      </div>

      <CornerHud />

      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8 py-24 md:py-0">
        <div className="max-w-2xl">
          {/* Copy column — backdrop-blur panel per Gemini brief so the
           *  headline survives over the phoenix artwork even when the
           *  artwork is busy in this part of the frame. */}
          <div className="relative md:bg-[rgba(20,15,10,0.7)] md:backdrop-blur-[10px] md:border md:border-border-bronze/40 md:p-8 lg:p-10">
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
