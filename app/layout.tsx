import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="antialiased text-foreground flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
