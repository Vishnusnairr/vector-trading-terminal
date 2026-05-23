import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

/**
 * Vector — Root Layout
 *
 * Note on fonts: we load Bricolage Grotesque and JetBrains Mono via a
 * runtime <link> tag rather than next/font. next/font self-hosts at build
 * time for optimal CLS but requires network access to Google Fonts during
 * the build. For maximum portability — and because the cold-start cost is
 * negligible for a logged-in app — we use runtime loading. Swap to
 * next/font/google if you prefer self-hosting in production.
 */

export const metadata: Metadata = {
  title: {
    default: 'Vector · Algo Terminal',
    template: '%s · Vector',
  },
  description:
    'AI-powered algorithmic trading platform with paper trading, backtesting, and the signature Ultra Safe Mode for capital preservation.',
  keywords: [
    'algorithmic trading',
    'paper trading',
    'backtesting',
    'AI trading assistant',
    'risk management',
  ],
  authors: [{ name: 'Vector' }],
  openGraph: {
    title: 'Vector · Algo Terminal',
    description:
      'Institutional-quality trading dashboard with AI assistance and Ultra Safe Mode.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#07080b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --font-display: 'Bricolage Grotesque', system-ui, sans-serif;
                --font-ui: 'Bricolage Grotesque', system-ui, sans-serif;
                --font-mono: 'JetBrains Mono', ui-monospace, monospace;
              }
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
