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
      <PageHero tKey="pages.dkp" />
      <DkpStandings />
    </>
  );
}
