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
      <p className="text-center text-sm text-muted font-script italic">
        {t("pages.migration.preferChat")}{" "}
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="text-accent hover:text-accent-bright not-italic font-sans tracking-wide underline-offset-4 hover:underline transition-colors"
        >
          {t("pages.migration.openDiscord")}
        </a>{" "}
        {t("pages.migration.walkthrough")}
      </p>
    </div>
  );
}
