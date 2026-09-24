'use client';

import React from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/store';
import {
  Users,
  Newspaper,
  Briefcase,
  Target,
  ArrowRight,
  Plus,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Leaf,
  HeartPulse,
  GraduationCap,
  Plane,
} from 'lucide-react';

const SECTORS = [
  { icon: TrendingUp, label: 'Socio-Economics' },
  { icon: Leaf, label: 'Agriculture' },
  { icon: HeartPulse, label: 'Healthcare' },
  { icon: GraduationCap, label: 'Education' },
  { icon: Plane, label: 'Tourism' },
];

export default function DashboardOverviewPage() {
  const { user, team, news, vacancies, objectives, activities, canEdit } = useAdmin();

  const totalTeam = team.length;
  const publishedNews = news.filter((n) => n.status === 'published').length;
  const openVacancies = vacancies.filter((v) => v.status === 'open').length;
  const avgProgress = Math.round(
    objectives.reduce((acc, o) => acc + o.progress, 0) / (objectives.length || 1)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ── Compact Hero Section (Matching bdai-web Home hero) ──────── */}
      <section className="relative rounded-2xl bg-[#07101f] text-white p-6 sm:p-8 md:p-10 overflow-hidden border border-slate-800 shadow-md">
        {/* 40px subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient glow — top right */}
        <div
          className="absolute top-0 right-0 w-[350px] h-[350px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, rgba(59,130,246,0.15) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-400/30">
                  Active Role: {user?.role || 'Admin'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Welcome, {user?.name}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white m-0">
                BD<span className="text-blue-400">AI</span>{' '}
                <span className="text-slate-400 text-xl sm:text-2xl font-normal">| Admin Console</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                Leveraging <span className="text-blue-400 font-bold">B</span>angla<span className="text-blue-400 font-bold">D</span>esh Sectoral Knowledge Graphs and Large Language Models for <span className="text-blue-400 font-bold">A</span>rtificial <span className="text-blue-400 font-bold">I</span>ntelligence Driven Insights.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {canEdit ? (
                <>
                  <Link
                    href="/dashboard/team"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-500 text-white text-[11px] font-semibold tracking-wider uppercase transition-opacity hover:opacity-90"
                  >
                    <Plus size={13} /> Add Member
                  </Link>
                  <Link
                    href="/dashboard/news"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-slate-300 border border-slate-700 text-[11px] font-medium tracking-wider uppercase transition-colors hover:border-slate-500 hover:text-white"
                  >
                    <Plus size={13} /> Post News
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard/team"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 text-slate-200 text-[11px] font-semibold tracking-wider uppercase transition-opacity hover:bg-white/20"
                >
                  View Team Directory
                </Link>
              )}
            </div>
          </div>

          {/* Compact Stats Row matching bdai-web */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 mt-8 border border-slate-800 rounded-lg overflow-hidden text-sm">
            <div className="py-3 px-3 text-center bg-slate-900/50 border-r border-slate-800">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 tracking-tight leading-none">
                {totalTeam}
              </div>
              <div className="text-[10px] tracking-widest uppercase text-slate-400 mt-1">
                Team Members
              </div>
            </div>

            <div className="py-3 px-3 text-center bg-slate-900/50 border-r border-slate-800">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 tracking-tight leading-none">
                {publishedNews}
              </div>
              <div className="text-[10px] tracking-widest uppercase text-slate-400 mt-1">
                Published News
              </div>
            </div>

            <div className="py-3 px-3 text-center bg-slate-900/50 border-r border-slate-800">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 tracking-tight leading-none">
                {openVacancies}
              </div>
              <div className="text-[10px] tracking-widest uppercase text-slate-400 mt-1">
                Active Notices
              </div>
            </div>

            <div className="py-3 px-3 text-center bg-slate-900/50">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 tracking-tight leading-none">
                {avgProgress}%
              </div>
              <div className="text-[10px] tracking-widest uppercase text-slate-400 mt-1">
                Program Progress
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sector Ticker Ribbon (Matching bdai-web) ───────────────── */}
      <div className="bg-blue-500 rounded-xl px-4 py-2.5 flex items-center justify-between overflow-x-auto gap-4 shadow-sm text-white">
        <span className="text-[11px] font-black uppercase tracking-widest shrink-0 text-white/80">
          Target Sectors:
        </span>
        <div className="flex items-center gap-6 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap">
          {SECTORS.map(({ icon: Icon, label }, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-white">
              <Icon size={13} /> {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── 2-Column Main Content Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Research Objectives Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-[#0c2461] text-lg flex items-center gap-2 m-0">
                <Target className="w-5 h-5 text-[#0c2461]" />
                Research Objectives (OB1 &ndash; OB8)
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Current milestone completion status for BDAI work packages
              </p>
            </div>
            <Link
              href="/dashboard/objectives"
              className="text-xs font-semibold text-[#0c2461] hover:text-blue-600 flex items-center gap-1"
            >
              <span>Manage all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {objectives.slice(0, 5).map((obj) => (
              <div
                key={obj.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#0c2461] rounded px-2 py-0.5">
                      {obj.id}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0c2461]">
                      {obj.title}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#0c2461] font-mono">
                    {obj.progress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0c2461] transition-all duration-500"
                    style={{ width: `${obj.progress}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Researcher: <strong className="text-slate-700">{obj.researcher}</strong></span>
                  <span className="capitalize font-semibold text-[#0c2461]">{obj.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity & Partner Links Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
              <h2 className="font-bold text-[#0c2461] text-lg flex items-center gap-2 m-0">
                <Clock className="w-5 h-5 text-[#0c2461]" />
                Recent Activity
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#0c2461] rounded px-2 py-0.5">
                Live
              </span>
            </div>

            <div className="space-y-4">
              {activities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 text-xs pb-3 border-b border-slate-100 last:border-0"
                >
                  <div className="w-2 h-2 rounded-full bg-[#0c2461] mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-800 font-medium">
                      <span className="text-[#0c2461] font-bold">
                        {act.action}
                      </span>{' '}
                      {act.entity}: <span className="text-slate-600">"{act.targetName}"</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      by {act.user} &bull; {act.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100">
            <a
              href="https://bdai.bike-csecu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
