import type { Metadata } from 'next';
import './globals.css';
import { AdminProvider } from '@/lib/store';
import AdminLayoutWrapper from '@/components/layout/AdminLayoutWrapper';

export const metadata: Metadata = {
  title: 'BDAI Admin Console — Management Panel',
  description:
    'Administrative content management console for BDAI (BanglaDesh Sectoral Knowledge Graphs and Large Language Models)',
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
