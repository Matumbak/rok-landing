import type { Metadata } from "next";
import { KingdomInfo } from "@/components/KingdomInfo";
import { PageHero } from "@/components/PageHero";
import { MigrationApplyForm } from "@/components/MigrationApplyForm";
import { MigrationDiscordHint } from "@/components/MigrationDiscordHint";
import { fetchKingdomStats, fetchRequirements } from "@/lib/api";

export const metadata: Metadata = {
  title: "Migration",
  description:
    "Apply to join Kingdom 4028 — the Bastion of WarDaddyChadski. Submit your governor brief and screenshots; an officer reviews within 48h.",
};

export const revalidate = 60;

export default async function MigrationPage() {
  const [stats, requirements] = await Promise.all([
    fetchKingdomStats(),
    fetchRequirements(),
  ]);

  return (
    <>
      <PageHero tKey="pages.migration" />
      <KingdomInfo stats={stats} requirements={requirements} />
      <section id="apply" className="relative pb-24 md:pb-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <MigrationApplyForm />
          <MigrationDiscordHint />
        </div>
      </section>
    </>
  );
}
