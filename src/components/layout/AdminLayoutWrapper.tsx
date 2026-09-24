'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdmin } from '@/lib/store';
import AdminNavbar from './AdminNavbar';
import AdminFooter from './AdminFooter';
import ToastContainer from '../ToastContainer';
import Image from 'next/image';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAdmin();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (pathname === '/login') {
      setCheckingAuth(false);
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setCheckingAuth(false);
    }
  }, [isAuthenticated, pathname, router]);

  // Don't wrap login page with Navbar / Footer
  if (pathname === '/login') {
    return (
      <>
        {children}
        <ToastContainer />
      </>
    );
  }

  if (checkingAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07101f] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-xl bg-[#0c2461] border border-blue-500/30 flex items-center justify-center animate-pulse">
          <Image
            src="/logo.png"
            alt="BDAI"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Loading BDAI Admin Console...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ecf0f1] font-sans flex flex-col justify-between">
      <AdminNavbar />

      <div className="pt-14 flex-1">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>

      <AdminFooter />
      <ToastContainer />
    </div>
  );
}
