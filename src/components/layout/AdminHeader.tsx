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
    <header className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs gap-3">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:inline shrink-0">
            {currentRoute.section}
          </span>
          <span className="text-slate-300 hidden md:inline shrink-0">/</span>
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight truncate">
            {currentRoute.title}
          </h1>
        </div>
      </div>

      {/* Right: Quick Utilities */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0c2461] hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Open Live Public Portal"
        >
          <span className="hidden sm:inline">Live Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        </a>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs shrink-0">
            <img
              src={user?.avatar || '/team/miskat.jpg'}
              alt={user?.name || 'Miskat'}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[120px] truncate">
            {user?.name || 'Miskat'}
          </span>
        </div>
      </div>
    </header>
  );
}
