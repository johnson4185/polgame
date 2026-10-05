import type {Metadata} from 'next';
import {Barlow, Barlow_Condensed, Kalam, Oswald} from 'next/font/google';
import './globals.css';

// Self-hosted via next/font: no render-blocking CSS @import, no layout shift
const body = Barlow({subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body-loaded', display: 'swap'});
const label = Barlow_Condensed({subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-label-loaded', display: 'swap'});
const display = Oswald({subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display-loaded', display: 'swap'});
const hand = Kalam({subsets: ['latin', 'devanagari'], weight: ['400', '700'], variable: '--font-hand-loaded', display: 'swap'});

export const metadata: Metadata = {
  title: 'REPUBLIC: 543 — Indian Political Strategy & Life Simulation',
  description: 'A deep 2D political strategy and life-simulation game of citizen movements, Jantar Mantar protests, general elections, and governance in real India.',
  openGraph: {
    title: 'REPUBLIC: 543 — Indian Political Strategy & Life Simulation',
    description: 'A deep 2D political strategy and life-simulation game of citizen movements, Jantar Mantar protests, general elections, and governance in real India.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'REPUBLIC: 543 — Indian Political Strategy & Life Simulation',
    description: 'A deep 2D political strategy and life-simulation game of citizen movements, Jantar Mantar protests, general elections, and governance in real India.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`h-full antialiased ${body.variable} ${label.variable} ${display.variable} ${hand.variable}`}>
      <body suppressHydrationWarning className="h-full overflow-x-hidden font-sans selection:bg-brand selection:text-white">
        {/* Full-viewport high-contrast noise texture layer using CSS mix-blend-mode */}
        <div className="noise-tactical-layer" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
