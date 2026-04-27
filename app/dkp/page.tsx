import type { Metadata } from "next";
import { DkpStandings } from "@/components/DkpStandings";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "DKP Standings",
  description: "Top performers of Kingdom 4028 ranked by DKP this season.",
};

export default function DkpPage() {
  return (
    <>
      <PageHero
        eyebrow="Leaderboard"
        title="DKP Standings"
        description="Ranked by combined kill points and rally contribution this season. Updated after every KvK pass."
      />
      <DkpStandings />
    </>
  );
}
