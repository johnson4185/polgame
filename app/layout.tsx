import type {Metadata} from 'next';
import {IBM_Plex_Mono, Inter, Space_Grotesk} from 'next/font/google';
import './globals.css';

// Self-hosted via next/font: no render-blocking CSS @import, no layout shift
const sans = Inter({subsets: ['latin'], variable: '--font-sans-loaded', display: 'swap'});
const mono = IBM_Plex_Mono({subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-mono-loaded', display: 'swap'});
const display = Space_Grotesk({subsets: ['latin'], weight: ['500', '700'], variable: '--font-display-loaded', display: 'swap'});

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
    <html lang="en" className={`h-full antialiased ${sans.variable} ${mono.variable} ${display.variable}`}>
      <body suppressHydrationWarning className="h-full overflow-x-hidden font-sans selection:bg-[#DC2626] selection:text-white">
        {/* Full-viewport high-contrast noise texture layer using CSS mix-blend-mode */}
        <div className="noise-tactical-layer" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
