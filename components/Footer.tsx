"use client";

import { DISCORD_URL, KINGDOM_ID } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { BrandMark } from "@/components/BrandMark";
import { DiamondDivider } from "@/components/ornaments";

export function Footer() {
  const t = useT();
  return (
    <footer className="relative mt-16 md:mt-24">
      {/* Top diamond ornament — DiamondDivider as a soft visual
       *  closing on the page above */}
      <div className="mx-auto max-w-3xl px-6 mb-8">
        <DiamondDivider variant="default" className="max-w-md mx-auto" />
      </div>

      <div className="border-t border-border-bronze/40">
        <div
          aria-hidden
          className="absolute inset-x-0 mt-px h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
        />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandMark className="h-7 w-7 text-accent/70" />
            <div className="font-display tracking-[0.4em] uppercase text-[11px] text-muted">
              {t("footer.tagline", { id: KINGDOM_ID })}
            </div>
          </div>

          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[11px] font-display uppercase tracking-[0.4em] text-muted hover:text-accent transition-colors"
          >
            {t("footer.discord")}
          </a>
        </div>
      </div>
    </footer>
  );
}
