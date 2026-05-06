"use client";

import { DISCORD_URL } from "@/lib/data";
import { useT } from "@/lib/i18n";

/** Tiny client-only sentence under the migration form pointing at
 *  Discord. Lifted out of the (server-rendered) page so it can call
 *  useT(). */
export function MigrationDiscordHint() {
  const t = useT();
  return (
    <p className="mt-6 text-center text-xs text-muted">
      {t("pages.migration.preferChat")}{" "}
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="text-accent hover:text-accent-bright underline-offset-4 hover:underline"
      >
        {t("pages.migration.openDiscord")}
      </a>{" "}
      {t("pages.migration.walkthrough")}
    </p>
  );
}
