import type { Metadata } from 'next';
import './globals.css';
import { AdminProvider } from '@/lib/store';
import AdminLayoutWrapper from '@/components/layout/AdminLayoutWrapper';

export const metadata: Metadata = {
  title: 'BDAI — Control Panel',
  description: 'Control panel for BDAI laboratory',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AdminProvider>
          <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
        </AdminProvider>
      </body>
    </html>
  );
}
