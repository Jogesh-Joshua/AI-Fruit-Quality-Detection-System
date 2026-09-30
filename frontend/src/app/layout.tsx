import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FruitScan AI — Fruit Quality Detection",
  description:
    "AI-powered fruit quality detection. Upload a photo of your fruit to instantly classify it as Good, Damaged, or Spoiled using computer vision.",
  keywords: ["fruit quality", "AI detection", "food safety", "computer vision"],
  openGraph: {
    title: "FruitScan AI",
    description: "Instant AI-powered fruit quality classification",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
