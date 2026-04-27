"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KINGDOM_ID } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-end md:items-center overflow-hidden">
      {/* full-bleed map background */}
      <div className="absolute inset-0">
        {/* mobile portrait crop */}
        <Image
          src="/hero-bg-mobile.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 0px, 100vw"
          className="object-cover object-center md:hidden"
        />
        {/* desktop wide crop */}
        <Image
          src="/hero-bg-desktop.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 100vw, 0px"
          className="hidden md:block object-cover object-center"
        />
        {/* global dim — knocks back the bright bronze art everywhere */}
        <div
          className="absolute inset-0 bg-background-deep/45"
          aria-hidden
        />
        {/* desktop: heavy left-side fade behind the text column */}
        <div
          className="absolute inset-0 hidden md:block bg-[linear-gradient(to_right,_rgba(6,10,13,0.92)_0%,_rgba(6,10,13,0.78)_30%,_rgba(6,10,13,0.35)_55%,_transparent_75%)]"
          aria-hidden
        />
        {/* mobile: heavy bottom fade behind the stacked text + CTA */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 md:h-1/2 bg-gradient-to-t from-background-deep via-background-deep/85 to-transparent"
          aria-hidden
        />
        {/* subtle vignette on the corners — keeps the map readable in the middle */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(6,10,13,0.6)_100%)]"
          aria-hidden
        />
      </div>

      <CornerHud />

      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8 pb-16 md:pb-0 md:pt-32">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3 mb-5"
          >
            <span className="h-px w-12 bg-accent" />
            <span className="font-display tracking-[0.5em] text-xs text-accent uppercase">
              Kingdom {KINGDOM_ID}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="font-display text-2xl md:text-4xl tracking-[0.15em] uppercase leading-tight engraved"
          >
            Discipline &amp; Power
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="mt-4 max-w-xl text-base md:text-lg text-foreground/90 leading-relaxed [text-shadow:0_1px_8px_rgba(6,10,13,0.85)]"
          >
            The Bastion of{" "}
            <span className="text-accent-bright font-medium">
              WarDaddyChadski
            </span>
            . A federation forged for KvK, drilled for the Pass, ready for the
            Ark.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.45 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link href="/migration">
              <Button size="lg" className="pulse-glow">
                Join the Horde
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dkp">
              <Button size="lg" variant="outline">
                View Standings
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
