import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { IrisArrival } from "@/components/IrisLink";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const body = Geist({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Aether Studio — Create anything with Aiko",
  description:
    "Aether Studio is your AI-powered creative universe. Generate stunning images, enhance prompts, and let Aiko guide your creativity.",
  openGraph: {
    title: "Aether Studio",
    description: "Generate stunning images, enhance prompts, and let Aiko guide your creativity.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#04050b",
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {children}
        <IrisArrival />
      </body>
    </html>
  );
}
