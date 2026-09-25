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
  Menu,
  X,
  ChevronDown,
  UserCheck,
  Database,
  Handshake,
  Wrench,
  PlayCircle,
} from 'lucide-react';
import { useAdmin } from '@/lib/store';

const NAV_ITEMS = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/dashboard/users', icon: ShieldCheck },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'News', href: '/dashboard/news', icon: Newspaper },
  { name: 'Vacancies', href: '/dashboard/vacancies', icon: Briefcase },
  { name: 'Objectives', href: '/dashboard/objectives', icon: Target },
  { name: 'Tools', href: '/dashboard/tools', icon: Wrench },
  { name: 'Videos', href: '/dashboard/videos', icon: PlayCircle },
  { name: 'Partners', href: '/dashboard/settings?tab=partners', icon: Handshake },
  { name: 'Database', href: '/dashboard/database', icon: Database },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const { user, users, switchUser, logout } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const roleBadgeStyles = {
    Admin: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40',
    Moderator: 'bg-blue-400/30 text-blue-200 border-blue-400/40',
    Member: 'bg-white/10 text-slate-300 border-white/20',
  }[user?.role || 'Admin'];

  // Render navigation links (compact pill for single row, tab buttons for row 2)
  const renderNavLinks = (isRow2: boolean) => (
    NAV_ITEMS.map((item) => {
      const isActive =
        item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href);
      const Icon = item.icon;

      return (
        <Link
          key={item.href}
          href={item.href}
          className={`inline-flex items-center gap-1.5 transition-all shrink-0 ${
            isRow2
              ? 'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg'
              : 'px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full'
          } ${
            isActive
              ? 'bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/25'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">{item.name}</span>
        </Link>
      );
    })
  );

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 inset-x-0 z-[5000] bg-[#0c2461] text-white shadow-lg border-b border-white/10 transition-all duration-300 ease-in-out"
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          {/* Row 1 / Primary Bar */}
          <div className="h-14 flex items-center justify-between gap-3 transition-all duration-300">
            {/* Logo & Brand */}
            <Link href="/dashboard" className="flex items-center gap-2 mr-2 sm:mr-4 shrink-0 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white/10 group-hover:bg-white/15 transition-colors">
                <Image
                  src="/logo.png"
                  alt="BD AI"
                  width={32}
                  height={32}
                  className="object-contain scale-90"
                />
              </div>
              <span className="text-white font-bold text-base tracking-tight">
                BD<span className="text-[#60a5fa]">AI</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90 bg-white/20 rounded px-2 py-0.5">
                Admin
              </span>
            </Link>

            {/* Desktop Navigation Links (Row 1): Shown only on wide displays where space permits */}
            <nav className="hidden min-[1400px]:flex items-center gap-1 mx-auto transition-all duration-300">
              {renderNavLinks(false)}
            </nav>

            {/* Right side utility actions */}
            <div className="ml-auto min-[1400px]:ml-0 flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Live site link */}
              <a
                href="https://bdai.bike-csecu.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#60a5fa] hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* User Profile & Role Switcher Dropdown */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-white/40 shrink-0">
                    <img
                      src={user?.avatar || '/team/miskat.jpg'}
                      alt={user?.name || 'Admin'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-semibold text-white block leading-tight max-w-[110px] truncate">
                      {user?.name || 'Admin'}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${roleBadgeStyles}`}
                    >
                      {user?.role || 'Admin'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150 z-[6000]">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-[#0c2461] truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <div className="pt-1">
                      <Link
                        href="/dashboard/users"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0c2461]" />
                        <span>Manage Users</span>
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile hamburger (visible only on small mobile devices < md) */}
              <button
                className="md:hidden p-1.5 text-white ml-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Open menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Row 2 / Sub Navigation Bar: Gracefully expands when space is constrained (< 1400px) */}
          <div className="overflow-hidden transition-all duration-300 ease-in-out min-[1400px]:max-h-0 min-[1400px]:opacity-0 min-[1400px]:pointer-events-none min-[1400px]:border-t-0 max-h-16 opacity-100 border-t border-white/10 bg-[#091b48]/60 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6">
            <div className="py-1.5">
              <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
                {renderNavLinks(true)}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[4999] md:hidden bg-[#0c2461]/95 backdrop-blur-md p-6 space-y-2 text-white overflow-y-auto"
          style={{ top: 'var(--admin-nav-height, 56px)' }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider ${
                  isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-white/20 mt-4 space-y-2">
            <a
              href="https://bdai.bike-csecu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider text-[#60a5fa] bg-white/10"
            >
              <span>Visit Live Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
