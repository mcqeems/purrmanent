import type { Metadata } from 'next';
import { Rubik, Inter } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';
import { cn } from '@/lib/utils/cn';

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
  metadataBase: new URL('https://purrmanent.web.id'),
  title: 'Purrmanent',
  description:
    'Your 90-day interactive guide for new cat parents. Track health, manage daily checklists, get AI coaching, and earn graduation certificates.',
  keywords: [
    'cat care',
    'new cat',
    'pet adoption',
    'cat guide',
    '3-3-3 rule',
    'cat health',
    'kitten',
    'cat parent',
  ],
  authors: [{ name: 'Purrmanent' }],
  creator: 'Purrmanent',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://purrmanent.web.id',
    siteName: 'Purrmanent',
    title: 'Purrmanent — 90-Day Cat Parent Guide',
    description:
      'Your 90-day interactive guide for new cat parents. Track health, manage daily checklists, get AI coaching, and earn graduation certificates.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Purrmanent logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Purrmanent — 90-Day Cat Parent Guide',
    description:
      'Your 90-day interactive guide for new cat parents. Track health, manage daily checklists, get AI coaching, and earn graduation certificates.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        'antialiased',
        rubik.variable,
        inter.variable,
        'font-sans',
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
