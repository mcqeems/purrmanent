import type { Metadata } from 'next';
import { Rubik, Inter } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';
import { cn } from '@/lib/utils';

const rubik = Rubik({
  subsets: ['latin'],
  variable: '--font-rubik',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Purrmanent',
  description:
    'Purrmanent is a 90-day guide for new cat parents — a clear, day-by-day plan based on the 3-3-3 adjustment rule.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn('h-full', 'antialiased', rubik.variable, inter.variable, 'font-sans')}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
