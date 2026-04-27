import { AnimatedSection } from "@/components/AnimatedSection";
import type { ApiMediaItem } from "@/lib/api";

type Props = { items?: ApiMediaItem[] };

export function MediaSection({ items = [] }: Props) {
  return (
    <AnimatedSection className="relative pt-10 pb-20 md:pt-12 md:pb-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="border border-border-bronze/60 bg-card/60 px-6 py-12 text-center text-muted">
            <p className="font-display tracking-[0.3em] uppercase text-sm">
              No media yet — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group relative block bg-card/80 backdrop-blur-sm border border-border-bronze/70 overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-[0_0_40px_rgba(201,123,61,0.3)]"
              >
                <div className="relative aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 sepia-[0.4] saturate-[0.7] group-hover:sepia-0 group-hover:saturate-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-deep via-background/40 to-transparent" />
                </div>
                <div className="p-5 relative">
                  <h3 className="font-display text-lg tracking-[0.08em] uppercase text-foreground group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <span className="mt-2 inline-block text-xs uppercase tracking-[0.3em] text-muted">
                    Watch on YouTube
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}
