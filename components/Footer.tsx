import { DISCORD_URL, KINGDOM_ID } from "@/lib/data";

export function Footer() {
  return (
    <footer className="relative mt-12 border-t border-border-bronze/60">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-display tracking-[0.4em] uppercase text-xs text-muted">
          {KINGDOM_ID} Huns · Rise of Kingdoms
        </div>
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="text-xs font-display uppercase tracking-[0.4em] text-muted hover:text-accent transition-colors"
        >
          Join Discord →
        </a>
      </div>
    </footer>
  );
}
