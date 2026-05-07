import type { Metadata } from "next";
import { Cinzel, Cormorant_SC, Inter, Montserrat } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

/** Cyrillic-supporting display font for RU headings. Cinzel ships Latin
 *  only, so without a fallback Cyrillic glyphs render in the user's
 *  system serif (Times on Win, Times New Roman on iOS) and the brand
 *  feel collapses.
 *
 *  Cormorant SC (small caps variant of Cormorant Garamond, by Christian
 *  Thalmann) sits closer to Cinzel than the earlier Forum experiment:
 *  classical serif, all-caps rhythm, uniform-ish stroke width, full
 *  Cyrillic coverage. Browser does per-glyph fallback through the
 *  cascade in globals.css, so EN keeps Cinzel and RU automatically
 *  picks up Cormorant SC for Cyrillic. */
const cormorantSc = Cormorant_SC({
  variable: "--font-cyrillic-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
});

/** Body font — Montserrat per the Phoenix NEST brief. Geometric sans
 *  pairs better with Cinzel's Roman caps than Inter's neo-grotesque.
 *  Cyrillic + latin subsets so RU copy doesn't fall to a system font. */
const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
});

/** Inter kept around as a system-text fallback / safety net — referenced
 *  by `--font-sans` cascade in globals.css so any component that grew
 *  attached to Inter's metrics keeps rendering close to its old self. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Kingdom 3615 — Phoenix NEST",
    template: "%s · Kingdom 3615",
  },
  description:
    "The official landing of Kingdom 3615 in Rise of Kingdoms. Phoenix NEST — recruiting fighters for SoC 7, B-seed run, 3B+ power & KP.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorantSc.variable} ${montserrat.variable} ${inter.variable}`}
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
