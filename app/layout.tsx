import type { Metadata } from "next";
import { Cinzel, Forum, Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

/** Cyrillic-supporting display font. Cinzel ships Latin only — without
 *  this, RU headings fall through to whatever serif the user's OS picks
 *  (Times on Win, Times New Roman on iOS), which makes the brand feel
 *  collapse. Forum is a chiseled-Roman style designed by Denis Masharov
 *  with full Cyrillic coverage and a similar engraved flavour, so the
 *  visual rhythm survives the language flip. CSS uses it as the second
 *  step in the `--font-display` cascade — Latin keeps Cinzel, Cyrillic
 *  picks up Forum at the per-glyph level. */
const forum = Forum({
  variable: "--font-forum",
  weight: ["400"],
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
      className={`${cinzel.variable} ${forum.variable} ${inter.variable}`}
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
