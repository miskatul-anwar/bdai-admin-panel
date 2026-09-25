'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Database,
  Handshake,
  Wrench,
  PlayCircle,
} from 'lucide-react';
import { useAdmin } from '@/lib/store';

// Row 2: Core Research & Content Modules (6 items)
const ROW_2_ITEMS = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'News', href: '/dashboard/news', icon: Newspaper },
  { name: 'Objectives', href: '/dashboard/objectives', icon: Target },
  { name: 'Tools', href: '/dashboard/tools', icon: Wrench },
  { name: 'Videos', href: '/dashboard/videos', icon: PlayCircle },
];

// Row 3: Operations & System Management (5 items)
const ROW_3_ITEMS = [
  { name: 'Vacancies', href: '/dashboard/vacancies', icon: Briefcase },
  { name: 'Partners', href: '/dashboard/settings?tab=partners', icon: Handshake },
  { name: 'Database', href: '/dashboard/database', icon: Database },
  { name: 'Users', href: '/dashboard/users', icon: ShieldCheck },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAdmin();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamically measure navbar height and keep document --admin-nav-height synced
  useEffect(() => {
    if (!headerRef.current) return;

    const syncHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--admin-nav-height', `${height}px`);
      }
    };

    syncHeight();

    const ro = new ResizeObserver(() => {
      syncHeight();
    });
    ro.observe(headerRef.current);

    window.addEventListener('resize', syncHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', syncHeight);
    };
  }, []);

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

  const renderNavLinks = (items: typeof ROW_2_ITEMS) => (
    items.map((item) => {
      const isActive = isItemActive(item.href);
      const Icon = item.icon;

      return (
        <Link
          key={item.href}
          href={item.href}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 ${
            isActive
              ? 'bg-white/20 text-white font-semibold shadow-xs ring-1 ring-white/25'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">{item.name}</span>
        </Link>
      );
    })
  );

  return (
    <header
      ref={headerRef}
      className="fixed top-0 inset-x-0 z-[5000] shadow-lg border-b border-white/10 text-white"
    >
      {/* ── ROW 1: Identity & User Bar ─────────────────────────────── */}
      <div className="h-[50px] flex items-center justify-between px-4 sm:px-6 bg-[#0c2461]">
        {/* Brand Logo & Title (Clean, NO redundant "Admin" badge!) */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden bg-white/10 group-hover:bg-white/15 transition-colors">
            <Image
              src="/logo.png"
              alt="BDAI"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            BD<span className="text-[#60a5fa]">AI</span>
          </span>
        </Link>

        {/* Global Utilities: Live Site + User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://bdai.bike-csecu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* User Profile (Clean name, NO redundant "Admin" badge pill!) */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-white/40 shrink-0">
                <img
                  src={user?.avatar || '/team/miskat.jpg'}
                  alt={user?.name || 'Miskat'}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-medium text-white/90 hidden sm:block max-w-[120px] truncate">
                {user?.name || 'Miskat'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/60" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1.5 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150 z-[6000]">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-[#0c2461] truncate">{user?.name || 'Miskat'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'miskat@cse.cu.ac.bd'}</p>
                </div>

                <div className="pt-1">
                  <Link
                    href="/dashboard/users"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0c2461]" />
                    <span>Users</span>
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 2: Core Research & Content Modules ─────────────────── */}
      <div className="h-[42px] flex items-center px-4 sm:px-6 bg-[#091b48] border-t border-white/10">
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full">
          {renderNavLinks(ROW_2_ITEMS)}
        </nav>
      </div>

      {/* ── ROW 3: Operations & System Management ───────────────────── */}
      <div className="h-[38px] flex items-center px-4 sm:px-6 bg-[#07153b] border-t border-white/10">
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full">
          {renderNavLinks(ROW_3_ITEMS)}
        </nav>
      </div>
    </header>
  );
}
