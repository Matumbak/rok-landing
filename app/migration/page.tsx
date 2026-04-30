import type { Metadata } from "next";
import { KingdomInfo } from "@/components/KingdomInfo";
import { PageHero } from "@/components/PageHero";
import { MigrationApplyForm } from "@/components/MigrationApplyForm";
import { DISCORD_URL } from "@/lib/data";
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
      <PageHero
        eyebrow="Recruitment"
        title="Join the Horde"
        description="The gates of 4028 are open to disciplined governors who pull weight in KvK, Ark, and the Pass. Read the brief, then submit your application below."
      />
      <KingdomInfo stats={stats} requirements={requirements} />
      <section id="apply" className="relative pb-24 md:pb-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <MigrationApplyForm />
          <p className="mt-6 text-center text-xs text-muted">
            Prefer to chat first?{" "}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent hover:text-accent-bright underline-offset-4 hover:underline"
            >
              Open Discord
            </a>{" "}
            — an officer will walk you through it.
          </p>
        </div>
      </section>
    </>
  );
}
