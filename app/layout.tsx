import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Irsyad Stock Control', description: 'QR stock movement control' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ms"><body>{children}</body></html>;
}
