import type { Metadata } from "next";
import { Rubik, Space_Grotesk } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

// UI font (DESIGN.md) + chunky display substitute (Space Grotesk per DESIGN.md note).
const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap",
});
const displayFace = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Purrmanent",
  description:
    "Purrmanent is a 90-day guide for new cat parents — a clear, day-by-day plan based on the 3-3-3 adjustment rule.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${rubik.variable} ${displayFace.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
