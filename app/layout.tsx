import type { Metadata } from "next";
import {
  Cinzel,
  Cormorant_Garamond,
  Cormorant_SC,
  Inter_Tight,
  Montserrat,
} from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

/* Font stack per Design System v3 (.claude/DESIGN-SYSTEM-v3.md §4):
 *
 *   Display     → Cinzel              (Latin only; H1/H2/CTA/eyebrow)
 *   Display-RU  → Cormorant SC        (per-glyph Cyrillic fallback)
 *   Sub-display → Cormorant Garamond  (italic mottos, sparingly)
 *   Body        → Inter Tight         (slimmer geometric, pairs well
 *                                      with Cinzel's Roman caps)
 *   Fallback    → Montserrat          (kept as cascade safety net for
 *                                      anything that lived on its
 *                                      metrics during v1/v2)
 */

const cinzel = Cinzel({
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const cormorantSc = Cormorant_SC({
  variable: "--font-cyrillic-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin", "cyrillic"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin", "cyrillic"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Kingdom 3615 — Phoenix NEST",
    template: "%s · Kingdom 3615",
  },
  description:
    "The official landing of Kingdom 3615 in Rise of Kingdoms. Phoenix NEST — recruiting fighters for SoC 7.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorantSc.variable} ${cormorantGaramond.variable} ${interTight.variable} ${montserrat.variable}`}
    >
      <body className="antialiased text-foreground flex min-h-screen flex-col">
        <I18nProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
