import type React from 'react';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  'https://karabiner-config-editor.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Karabiner Config Editor',
    template: '%s | Karabiner Config Editor',
  },
  description:
    'Visual Karabiner-Elements editor to import, edit, validate, and export karabiner.json with profile and complex rule support.',
  applicationName: 'Karabiner Config Editor',
  keywords: [
    'Karabiner-Elements',
    'karabiner.json',
    'keyboard remapping',
    'macOS keyboard shortcuts',
    'complex modifications',
    'Karabiner config editor',
  ],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/app-icon.png', type: 'image/png' }],
    apple: [{ url: '/app-icon.png', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Karabiner Config Editor',
    description:
      'Build and validate Karabiner-Elements mappings with a visual editor, then export a clean karabiner.json.',
    siteName: 'Karabiner Config Editor',
    images: [
      {
        url: '/app-icon.png',
        width: 1254,
        height: 1254,
        alt: 'Karabiner Config Editor logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Karabiner Config Editor',
    description:
      'Visual editor for Karabiner-Elements configurations with validation and export tools.',
    images: ['/app-icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
