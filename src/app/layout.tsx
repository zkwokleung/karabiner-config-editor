import type React from 'react';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { Suspense } from 'react';
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
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Karabiner Config Editor',
    description:
      'Build and validate Karabiner-Elements mappings with a visual editor, then export a clean karabiner.json.',
    siteName: 'Karabiner Config Editor',
    images: [
      {
        url: '/placeholder-logo.png',
        width: 512,
        height: 512,
        alt: 'Karabiner Config Editor logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Karabiner Config Editor',
    description:
      'Visual editor for Karabiner-Elements configurations with validation and export tools.',
    images: ['/placeholder-logo.png'],
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
    <html lang='en'>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  );
}
