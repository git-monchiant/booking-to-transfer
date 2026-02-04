import './globals.css';
import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-prompt',
});

export const metadata: Metadata = {
  title: 'SENA Booking Tracker',
  description: 'Booking to Transfer Tracking System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={prompt.variable}>
      <body className={prompt.className}>{children}</body>
    </html>
  );
}
