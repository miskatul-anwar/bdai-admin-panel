'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Newspaper,
  Briefcase,
  Target,
  ShieldCheck,
  Settings,
  ExternalLink,
  LogOut,
  Database,
  Handshake,
  Wrench,
  PlayCircle,
  Calendar,
  X,
} from 'lucide-react';
import { useAdmin } from '@/lib/store';

const NAVIGATION_GROUPS = [
  {
    title: 'Dashboard',
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Portal Content',
    items: [
      { name: 'Team', href: '/dashboard/team', icon: Users },
      { name: 'News & Articles', href: '/dashboard/news', icon: Newspaper },
      { name: 'Events (Held & Upcoming)', href: '/dashboard/events', icon: Calendar },
      { name: 'Objectives', href: '/dashboard/objectives', icon: Target },
      { name: 'Tools & Platforms', href: '/dashboard/tools', icon: Wrench },
      { name: 'Featured Videos', href: '/dashboard/videos', icon: PlayCircle },
      { name: 'Vacancies & Notices', href: '/dashboard/vacancies', icon: Briefcase },
      { name: 'Partners & Consortium', href: '/dashboard/settings?tab=partners', icon: Handshake },
    ],
  },
  {
    title: 'System & Database',
    items: [
      { name: 'Database', href: '/dashboard/database', icon: Database },
      { name: 'Users & Access', href: '/dashboard/users', icon: ShieldCheck },
      { name: 'Site Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAdmin();

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    if (href.includes('?')) {
      const [path, query] = href.split('?');
      if (pathname === path) {
        if (typeof window !== 'undefined') {
          return window.location.search === `?${query}`;
        }
        return false;
      }
      return false;
    }
    if (href === '/dashboard/settings') {
      return (
        pathname === '/dashboard/settings' &&
        (typeof window === 'undefined' || !window.location.search.includes('tab=partners'))
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0c2461] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white/10 group-hover:bg-white/15 transition-colors">
              <Image
                src="/logo.png"
                alt="BDAI"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-base tracking-tight leading-none">
                BD<span className="text-[#60a5fa]">AI</span>
              </span>
              <span className="text-[10px] text-white/60 tracking-wider font-medium mt-0.5">
                Control Panel
              </span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-3 mb-1.5">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isItemActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? 'bg-white/20 text-white font-semibold shadow-xs ring-1 ring-white/20'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Quick Live Link & User Profile */}
        <div className="p-3 border-t border-white/10 space-y-2 shrink-0 bg-[#081740]">
          {/* Live Website Link */}
          <a
            href="https://bdai.bike-csecu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#60a5fa] hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* User Account / Logout */}
          <div className="flex items-center justify-between px-2 pt-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 shrink-0">
                <img
                  src={user?.avatar || '/team/miskat.jpg'}
                  alt={user?.name || 'Miskat'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.name || 'Miskat'}
                </p>
                <p className="text-[10px] text-white/50 truncate mt-0.5">
                  {user?.email || 'miskat@cse.cu.ac.bd'}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-white/60 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
