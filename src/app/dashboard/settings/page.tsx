'use client';

import React from 'react';
import Image from 'next/image';
import { useAdmin } from '@/lib/store';
import {
  Settings,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Database,
  Info,
  Server,
  Building,
  ShieldAlert,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    user,
    resetToDemoData,
    team,
    news,
    vacancies,
    objectives,
    showToast,
    isAdmin,
    adminOnlyProvisioning,
    toggleAdminOnlyProvisioning,
  } = useAdmin();

  const handleClearAll = () => {
    if (
      window.confirm(
        'Warning: This will clear all browser storage and reset the admin panel. Continue?'
      )
    ) {
      localStorage.clear();
      showToast('Storage wiped. Reloading...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0c2461] flex items-center justify-center text-white shadow-sm">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0c2461]">Console Settings</h1>
          <p className="text-sm text-gray-500">
            Active session profile, demo data persistence, and BDAI project metadata
          </p>
        </div>
      </div>

      {/* ── Admin Profile Card ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#0c2461] mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0c2461]" />
          Active Administrator Session
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm shrink-0">
              <Image
                src={user?.avatar || '/team/miskat.jpg'}
                alt={user?.name || 'Admin'}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0c2461]">{user?.name}</h3>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-[#0c2461] rounded px-2 py-0.5">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Admin Authority & Provisioning Policy ────────────── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-[#0c2461] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0c2461]" />
              Administrative Security Option
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Role-Based Access Control enforcing exclusive Admin rights for user accounts and personnel
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={toggleAdminOnlyProvisioning}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0c2461] font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto border border-slate-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin-Only Policy: {adminOnlyProvisioning ? 'Strict (Enabled)' : 'Relaxed'}</span>
            </button>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0c2461] block">Rule: Only Admin can Add &amp; Remove Users</strong>
              <p className="text-slate-600 mt-0.5">
                Only users with the <strong>Admin</strong> role can add or remove an Admin, Moderator, or Member account. Moderators and Members have restricted view access.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0c2461] block">Rule: Only Admin can Add &amp; Remove All Kinds of Employees</strong>
              <p className="text-slate-600 mt-0.5">
                Personnel additions and deletions across all editable designations (SPM, ASPM, Professor, Fellow, Assistant, Annotator) are strictly restricted to <strong>Admin</strong> accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Active Role Authority: <strong className="text-[#0c2461]">{user?.role}</strong></span>
          <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
            isAdmin ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {isAdmin ? 'Full Provisioning Rights' : 'Restricted (Non-Admin)'}
          </span>
        </div>
      </div>

      {/* ── Mock Data & Storage Sandbox ───────────────────────── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#0c2461] mb-2 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#0c2461]" />
          Demo Storage &amp; Persistence
        </h2>

        <p className="text-xs text-slate-600 mb-6">
          This dummy admin panel stores edits, additions, and deletions in browser localStorage so your changes persist across page reloads without requiring an external database.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Team Members</p>
            <p className="text-2xl font-bold text-[#0c2461] font-mono mt-1">{team.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">News Articles</p>
            <p className="text-2xl font-bold text-[#0c2461] font-mono mt-1">{news.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Tenders / Notices</p>
            <p className="text-2xl font-bold text-[#0c2461] font-mono mt-1">{vacancies.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Objectives</p>
            <p className="text-2xl font-bold text-[#0c2461] font-mono mt-1">{objectives.length}</p>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-100 flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (window.confirm('Reset all edited content back to default demo data?')) {
                resetToDemoData();
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Local Storage</span>
          </button>
        </div>
      </div>

      {/* ── Project Specs ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#0c2461] mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0c2461]" />
          Project Affiliation
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Building className="w-5 h-5 text-[#0c2461] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0c2461] block text-sm">Host Institution</strong>
              <p className="text-slate-600 mt-0.5">Department of Computer Science &amp; Engineering, University of Chittagong</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Server className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0c2461] block text-sm">Sub-Project &amp; Grant</strong>
              <p className="text-slate-600 mt-0.5">HEAT-13211-CU ATF Sub-Project (UGC Bangladesh &amp; World Bank)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
