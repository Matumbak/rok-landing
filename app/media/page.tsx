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
      <PageHero
        eyebrow="Field Reports"
        title="Media"
        description="Watch the Horde in motion — KvK pushes, Ark coordination, migration walkthroughs from the 4028 frontline."
      />
      <MediaSection items={items} />
    </>
  );
}
