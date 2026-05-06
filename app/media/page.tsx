import type { Metadata } from "next";
import { MediaSection } from "@/components/MediaSection";
import { PageHero } from "@/components/PageHero";
import { fetchMedia } from "@/lib/api";

export const metadata: Metadata = {
  title: "Media",
  description: "Field reports — KvK pushes, Ark coordination, migration walkthroughs.",
};

export const revalidate = 60;

export default async function MediaPage() {
  const items = await fetchMedia();

  return (
    <>
      <PageHero tKey="pages.media" />
      <MediaSection items={items} />
    </>
  );
}
