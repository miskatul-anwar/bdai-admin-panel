'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, ExternalLink } from 'lucide-react';
import { useAdmin } from '@/lib/store';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; section: string }> = {
  '/dashboard': { title: 'Overview', section: 'Dashboard' },
  '/dashboard/team': { title: 'Team Directory', section: 'Portal Content' },
  '/dashboard/news': { title: 'News & Articles', section: 'Portal Content' },
  '/dashboard/events': { title: 'Events (Held & Upcoming)', section: 'Portal Content' },
  '/dashboard/objectives': { title: 'Research Objectives', section: 'Portal Content' },
  '/dashboard/tools': { title: 'Tools & Platforms', section: 'Portal Content' },
  '/dashboard/videos': { title: 'Featured Videos', section: 'Portal Content' },
  '/dashboard/vacancies': { title: 'Vacancies & Notices', section: 'Portal Content' },
  '/dashboard/users': { title: 'Users & Permissions', section: 'System' },
  '/dashboard/database': { title: 'Database Explorer', section: 'System' },
  '/dashboard/settings': { title: 'Platform Settings', section: 'System' },
};

export default function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user } = useAdmin();

  // Determine current breadcrumb info
  const currentRoute = ROUTE_TITLES[pathname] || {
    title: pathname.split('/').filter(Boolean).pop()?.toUpperCase() || 'Dashboard',
    section: 'Dashboard',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
            {currentRoute.section}
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {currentRoute.title}
          </h1>
        </div>
      </div>

      {/* Right: Quick Utilities */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* API Server Live Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>API Connected</span>
        </div>

        {/* Live Site Link */}
        <a
          href="https://bdai.bike-csecu.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0c2461] hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <span>Live Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs">
            <img
              src={user?.avatar || '/team/miskat.jpg'}
              alt={user?.name || 'Miskat'}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
            {user?.name || 'Miskat'}
          </span>
        </div>
      </div>
    </header>
  );
}
