'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/store';
import Image from 'next/image';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAdmin();

  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  return (
    <div className="min-h-screen bg-[#07101f] flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 rounded-xl bg-[#0c2461] border border-blue-500/30 flex items-center justify-center animate-pulse mb-3">
        <Image
          src="/logo.png"
          alt="BDAI"
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
      <p className="text-xs text-slate-400">Loading BDAI Admin Console...</p>
    </div>
  );
}
