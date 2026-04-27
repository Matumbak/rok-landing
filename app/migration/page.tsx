import type {Metadata} from "next";
import {ArrowRight} from "lucide-react";
import {KingdomInfo} from "@/components/KingdomInfo";
import {PageHero} from "@/components/PageHero";
import {Button} from "@/components/ui/button";
import {DISCORD_URL} from "@/lib/data";
import {fetchRequirements} from "@/lib/api";

export const metadata: Metadata = {
  title: "Migration",
  description:
    "Requirements and process for joining Kingdom 4028 — the Bastion of WarDaddyChadski.",
};

// Re-fetch the requirements list every 60s in production.
export const revalidate = 60;

export default async function MigrationPage() {
  const requirements = await fetchRequirements();

  return (
    <>
      <PageHero
        eyebrow="Recruitment"
        title="Join the Horde"
        description="The gates of 4028 are open to disciplined governors who pull weight in KvK, Ark, and the Pass. Read the brief, then knock on Discord."
      />
      <KingdomInfo requirements={requirements} />
      <section className="relative pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="border border-accent/40 bg-card/60 backdrop-blur-sm p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-3xl md:text-4xl uppercase tracking-wider">
                Ready to march?
              </h3>
              <p className="mt-2 text-muted">
                Hit Discord — an officer will walk you through the migration.
              </p>
            </div>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer noopener">
              <Button size="lg" className="pulse-glow">
                Open Discord
                <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
