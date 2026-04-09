import type { Metadata } from "next";
import { Cormorant_Garamond, Syne, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-cormorant-garamond",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-syne",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "Lotus Ops",
  description: "Internal operations platform for AaraSaan Consulting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${syne.variable} ${jost.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
