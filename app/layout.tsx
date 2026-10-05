import type {Metadata} from 'next';
import './globals.css';

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
    <html lang="en" className="h-full bg-[#080B11] text-zinc-100 antialiased">
      <body suppressHydrationWarning className="h-full overflow-x-hidden font-sans selection:bg-[#DC2626] selection:text-white">
        {/* Full-viewport high-contrast noise texture layer using CSS mix-blend-mode */}
        <div className="noise-tactical-layer" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
