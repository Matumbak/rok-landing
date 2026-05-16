"use client";

import { DISCORD_URL } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { DiamondDivider } from "@/components/ornaments";

/** Closing hint under the migration form pointing applicants at
 *  Discord for direct contact. Wrapped in a diamond divider to act
 *  as a soft "end of page" marker. */
export function MigrationDiscordHint() {
  const t = useT();
  return (
    <div className="mt-10 md:mt-14">
      <DiamondDivider
        variant="default"
        className="max-w-[200px] mx-auto mb-5"
      />
      <p className="text-center text-sm md:text-base text-muted font-script italic">
        {t("pages.migration.preferChat")}{" "}
        {/* Inline link styled to live INSIDE the italic Cormorant
         *  sentence — same font / weight / italic, just tinted gold and
         *  underlined so it reads as one continuous manuscript line
         *  instead of a sans-serif chip glued between two cursive
         *  fragments. */}
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="font-script italic text-accent hover:text-accent-bright underline decoration-accent/40 decoration-1 underline-offset-[5px] hover:decoration-accent transition-colors"
        >
          {t("pages.migration.openDiscord")}
        </a>{" "}
        {t("pages.migration.walkthrough")}
      </p>
    </div>
  );
}
