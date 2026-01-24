import type { Metadata } from 'next';
import '../styles/globals.css';
import { Toaster } from '../components/ui/sonner';
import { Providers } from '../components/Providers';

export const metadata: Metadata = {
  title: 'ECO Manager - Enterprise Edition',
  description: 'Engineering Change Order Management System for Manufacturing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}