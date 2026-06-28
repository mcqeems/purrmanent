import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Purrmanent",
  description:
    "urrmanent is a 90-day guide for new cat parents. It turns the stressful first months of cat adoption into a clear, day-by-day plan based on the cat's adjustment timeline (the 3-3-3 rule: about 3 days to decompress, 3 weeks to learn the routine, 3 months to feel at home). After a short onboarding questionnaire about your cat, Purrmanent builds a personalized plan and walks you through daily tasks, milestones, health tracking, and emergencies — so you always know what to do next. It supports multiple cats, each with its own plan and progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
