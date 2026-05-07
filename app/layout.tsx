import type { Metadata } from "next";
import { Cinzel, Cormorant_SC, Inter } from "next/font/google";
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
 *  First attempt was Forum — visually too thin/contrasted (fashion-mag
 *  aesthetic) and didn't sit well next to the Cinzel-rendered Latin.
 *  Cormorant SC (small caps variant of Cormorant Garamond, by Christian
 *  Thalmann) sits closer to Cinzel: classical serif, all-caps rhythm,
 *  uniform-ish stroke width, and full Cyrillic coverage. Browser does
 *  per-glyph fallback through the cascade in globals.css, so EN keeps
 *  Cinzel and RU automatically picks up Cormorant SC for Cyrillic. */
const cormorantSc = Cormorant_SC({
  variable: "--font-cyrillic-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
});

/** Body text. Cyrillic subset added so Russian copy doesn't fall to a
 *  system font with a different metric. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "4028 HUNS — Bastion of WarDaddyChadski",
    template: "%s · 4028 HUNS",
  },
  description:
    "Discipline & Power. The official landing of Kingdom 4028 in Rise of Kingdoms.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorantSc.variable} ${inter.variable}`}
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
