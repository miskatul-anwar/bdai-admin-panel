'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdmin } from '@/lib/store';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import ToastContainer from '../ToastContainer';
import Image from 'next/image';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAdmin();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;

    if (pathname === '/login') {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        setCheckingAuth(false);
      }
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setCheckingAuth(false);
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  // Don't wrap login page with Navbar / Footer
  if (pathname === '/login') {
    return (
      <>
        {children}
        <ToastContainer />
      </>
    );
  }

  if (!isInitialized || (checkingAuth && !isAuthenticated)) {
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
          Loading BDAI...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ecf0f1] font-sans flex">
      {/* Modern Collapsible Left Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <AdminFooter />
      </div>

      <ToastContainer />
    </div>
  );
}
