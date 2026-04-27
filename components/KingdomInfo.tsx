import { AnimatedSection } from "@/components/AnimatedSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KINGDOM_STATS } from "@/lib/data";
import type { ApiRequirement } from "@/lib/api";
import { resolveIcon } from "@/lib/icons";

type Props = {
  requirements?: ApiRequirement[];
};

export function KingdomInfo({ requirements = [] }: Props) {
  return (
    <AnimatedSection className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Intel Brief"
          title="Kingdom Stats"
          subtitle="Hard numbers. No ceremony."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {KINGDOM_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="hover:border-accent/60 transition-colors"
              >
                <CardContent className="p-6 flex flex-col gap-3">
                  <Icon className="h-6 w-6 text-accent" />
                  <span className="font-display text-3xl md:text-4xl tracking-[0.05em] text-foreground engraved">
                    {stat.value}
                  </span>
                  <span className="text-xs uppercase tracking-[0.3em] text-muted">
                    {stat.label}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {requirements.length > 0 && (
          <div className="mt-20">
            <SectionHeading
              eyebrow="Recruitment"
              title="Migration Requirements"
              subtitle="If you meet these, the gates are open."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {requirements.map((req) => {
                const Icon = resolveIcon(req.iconKey);
                return (
                  <Card
                    key={req.id}
                    className="group hover:border-accent/60 hover:shadow-[0_0_32px_rgba(201,123,61,0.18)] transition-all"
                  >
                    <CardHeader className="flex flex-row items-start gap-4">
                      <span className="flex h-12 w-12 items-center justify-center border border-accent/40 bg-accent/10 text-accent group-hover:bg-accent group-hover:text-background-deep transition-colors shrink-0">
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <CardTitle>{req.title}</CardTitle>
                        <CardDescription>{req.description}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-10 md:mb-14">
      <div className="flex items-center gap-3 mb-3">
        <span className="h-px w-10 bg-accent" />
        <span className="font-display tracking-[0.5em] text-xs text-accent uppercase">
          {eyebrow}
        </span>
      </div>
      <h2 className="font-display text-3xl md:text-5xl uppercase tracking-[0.04em] engraved">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-muted text-base md:text-lg max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
