"use client";

import * as React from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { DiamondDivider, RibbonHeader, CornerFrame } from "@/components/ornaments";
import type { ApiKingdomStat, ApiRequirement } from "@/lib/api";
import { resolveIcon } from "@/lib/icons";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  stats?: ApiKingdomStat[];
  requirements?: ApiRequirement[];
};

/**
 * Kingdom stats grid + migration requirements list. Wrapped in
 * heraldic panels per Design System v3 — RibbonHeader for the
 * section titles, gold-cornered panels for the cards, engraved
 * gold for the big numbers.
 */
export function KingdomInfo({ stats = [], requirements = [] }: Props) {
  const t = useT();
  return (
    <AnimatedSection className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {stats.length > 0 && (
          <>
            <SectionHeading
              eyebrow={t("kingdomInfo.statsEyebrow")}
              title={t("kingdomInfo.statsTitle")}
              subtitle={t("kingdomInfo.statsSubtitle")}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {stats.map((stat) => {
                const Icon = resolveIcon(stat.iconKey);
                return (
                  <StatCard key={stat.id}>
                    <Icon className="h-5 w-5 text-accent" />
                    <span className="font-display text-3xl md:text-4xl tracking-[0.04em] leading-none engraved">
                      {stat.value}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
                      {stat.label}
                    </span>
                  </StatCard>
                );
              })}
            </div>
          </>
        )}

        {requirements.length > 0 && (
          <div className={stats.length > 0 ? "mt-20 md:mt-28" : ""}>
            <SectionHeading
              eyebrow={t("kingdomInfo.requirementsEyebrow")}
              title={t("kingdomInfo.requirementsTitle")}
              subtitle={t("kingdomInfo.requirementsSubtitle")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {requirements.map((req) => {
                const Icon = resolveIcon(req.iconKey);
                return (
                  <RequirementCard key={req.id}>
                    <span className="flex h-11 w-11 items-center justify-center border border-accent/50 bg-bronze-700/40 text-accent shrink-0">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg md:text-xl uppercase tracking-[0.06em] text-cream-100 leading-tight">
                        {req.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted leading-relaxed">
                        {req.description}
                      </p>
                    </div>
                  </RequirementCard>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}

/* ── Section heading — ribbon + serif italic subtitle ───────────── */
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
    <div className="mb-10 md:mb-14 text-center">
      <RibbonHeader size="sm" className="mb-6">
        {eyebrow}
      </RibbonHeader>
      <h2 className="font-display text-3xl md:text-5xl uppercase tracking-[0.04em] engraved">
        {title}
      </h2>
      {subtitle && (
        <>
          <DiamondDivider
            variant="default"
            className="max-w-[120px] mx-auto my-4"
          />
          <p className="font-script italic text-base md:text-lg text-cream-200 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </>
      )}
    </div>
  );
}

/* ── Stat card — small dark panel with corner ornaments ────────── */
function StatCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative bg-bronze-800/70 backdrop-blur-sm border border-bronze-600",
        "p-5 md:p-6 flex flex-col gap-2.5",
        "hover:border-accent/60 transition-colors duration-200",
        className,
      )}
    >
      <CornerFrame className="text-accent/40" />
      {children}
    </div>
  );
}

/* ── Requirement card — wider, icon + title + description ──────── */
function RequirementCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative bg-bronze-800/70 backdrop-blur-sm border border-bronze-600",
        "p-5 md:p-6 flex items-start gap-4",
        "hover:border-accent/60 transition-colors duration-200",
        className,
      )}
    >
      <CornerFrame className="text-accent/40" />
      {children}
    </div>
  );
}
