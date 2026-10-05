import type {Metadata} from 'next';
import {Baloo_2, Bungee, Kalam} from 'next/font/google';
import './globals.css';

// Self-hosted via next/font: no render-blocking CSS @import, no layout shift.
// Bungee (signage display, Latin) + Baloo 2 (body, Devanagari) + Kalam (handwritten notes).
const display = Bungee({subsets: ['latin'], weight: '400', variable: '--font-display-loaded', display: 'swap'});
const body = Baloo_2({subsets: ['latin', 'devanagari'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body-loaded', display: 'swap'});
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
    <html lang="en" className={`h-full antialiased ${display.variable} ${body.variable} ${hand.variable}`}>
      <body suppressHydrationWarning className="h-full overflow-x-hidden font-sans selection:bg-pink selection:text-white">
        {/* Full-viewport high-contrast noise texture layer using CSS mix-blend-mode */}
        <div className="noise-tactical-layer" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
