import type { Metadata } from "next";
import { DkpStandings } from "@/components/DkpStandings";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "DKP Standings",
  description: "Top performers of Kingdom 3615 (Phoenix NEST) ranked by DKP this KvK.",
};

export default function DkpPage() {
  return (
    <>
      <PageHero tKey="pages.dkp" />
      <DkpStandings />
    </>
  );
}
