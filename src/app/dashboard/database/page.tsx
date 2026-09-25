'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import {
  Database,
  Table,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code,
  Layers,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';

type TableKey =
  | 'users'
  | 'team_members'
  | 'news_articles'
  | 'vacancies'
  | 'research_objectives'
  | 'activity_logs';

export default function DatabaseConsolePage() {
  const {
    isAdmin,
    users,
    team,
    news,
    vacancies,
    objectives,
    activities,
    isLiveBackend,
    refreshBackendData,
    deleteUser,
    deleteTeamMember,
    deleteNews,
    deleteVacancy,
    deleteObjective,
    showToast,
  } = useAdmin();

  const [activeTable, setActiveTable] = useState<TableKey>('team_members');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRowJson, setSelectedRowJson] = useState<any | null>(null);

  const tables: {
    key: TableKey;
    label: string;
    schema: string;
    count: number;
    description: string;
  }[] = [
    {
      key: 'team_members',
      label: 'public.team_members',
      schema: 'PostgreSQL',
      count: team.length,
      description: 'Personnel with fully dynamic designations & institutional affiliations',
    },
    {
      key: 'users',
      label: 'public.users',
      schema: 'PostgreSQL',
      count: users.length,
      description: 'Console user accounts (Admin, Moderator, Member) with bcrypt hashes',
    },
    {
      key: 'news_articles',
      label: 'public.news_articles',
      schema: 'PostgreSQL',
      count: news.length,
      description: 'News items, workshop circulars, and official milestones',
    },
    {
      key: 'vacancies',
      label: 'public.vacancies',
      schema: 'PostgreSQL',
      count: vacancies.length,
      description: 'Tenders, job circulars & fellowships with free-form notice types',
    },
    {
      key: 'research_objectives',
      label: 'public.research_objectives',
      schema: 'PostgreSQL',
      count: objectives.length,
      description: 'Sectoral KG and RAG deliverables, progress percentages, and leads',
    },
    {
      key: 'activity_logs',
      label: 'public.activity_logs',
      schema: 'PostgreSQL',
      count: activities.length,
      description: 'Immutable system audit logs tracking logins and mutations',
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBackendData(true);
    setIsRefreshing(false);
    showToast('Database records refreshed from Supabase', 'success');
  };

  const handleDeleteRow = async (id: string, nameOrTitle: string) => {
    if (!isAdmin) {
      showToast('Permission denied: Only Admins can directly manipulate database records', 'error');
      return;
    }
    if (!window.confirm(`Execute SQL DELETE on ${activeTable} for row ID: ${id} (${nameOrTitle})?`)) {
      return;
    }

    try {
      if (activeTable === 'team_members') await deleteTeamMember(id);
      else if (activeTable === 'users') await deleteUser(id);
      else if (activeTable === 'news_articles') await deleteNews(id);
      else if (activeTable === 'vacancies') await deleteVacancy(id);
      else if (activeTable === 'research_objectives') await deleteObjective(id);
      showToast(`SQL DELETE executed on ${activeTable}`, 'info');
    } catch {
      showToast(`Failed to delete record ${id}`, 'error');
    }
  };

  // Get active rows
  const getTableRows = () => {
    switch (activeTable) {
      case 'team_members':
        return team.filter(
          (m) =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'users':
        return users.filter(
          (u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'news_articles':
        return news.filter(
          (n) =>
            n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.slug.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'vacancies':
        return vacancies.filter(
          (v) =>
            v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.department.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'research_objectives':
        return objectives.filter(
          (o) =>
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.sector.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'activity_logs':
        return activities.filter(
          (a) =>
            a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.targetName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
  };

  const rows = getTableRows();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0c2461] text-white flex items-center justify-center shrink-0 shadow-md">
            <Database className="w-6 h-6" />
          </div>
            <div>
              <h1 className="text-xl font-bold text-[#0c2461]">Database</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Inspect tables and live records on Supabase PostgreSQL
              </p>
            </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live DB</span>
          </button>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white shadow-xs transition-colors cursor-pointer"
          >
            <span>Supabase Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Database Schema & Tables Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tables.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTable(t.key);
              setSearchTerm('');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeTable === t.key
                ? 'bg-[#0c2461] text-white border-[#0c2461] shadow-md ring-2 ring-blue-400/30'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Table className={`w-4 h-4 ${activeTable === t.key ? 'text-blue-300' : 'text-slate-400'}`} />
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeTable === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t.count}
              </span>
            </div>
            <p className="font-mono text-xs font-bold truncate">{t.key}</p>
            <p
              className={`text-[10px] mt-0.5 truncate ${
                activeTable === t.key ? 'text-slate-200' : 'text-slate-400'
              }`}
            >
              {t.schema}
            </p>
          </button>
        ))}
      </div>

      {/* Table Explorer Toolbar */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0c2461]" />
            <h2 className="font-bold text-sm text-[#0c2461] font-mono">
              SELECT * FROM public.{activeTable}
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
              {rows.length} rows returned
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeTable}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0c2461]"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Primary Key (id)</th>
                {activeTable === 'team_members' && (
                  <>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Designation (Editable)</th>
                    <th className="py-2.5 px-3">Institution</th>
                    <th className="py-2.5 px-3">Order</th>
                  </>
                )}
                {activeTable === 'users' && (
                  <>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                  </>
                )}
                {activeTable === 'news_articles' && (
                  <>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Slug</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Status</th>
                  </>
                )}
                {activeTable === 'vacancies' && (
                  <>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Notice Type (Text)</th>
                    <th className="py-2.5 px-3">Deadline</th>
                    <th className="py-2.5 px-3">Status</th>
                  </>
                )}
                {activeTable === 'research_objectives' && (
                  <>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Researcher</th>
                    <th className="py-2.5 px-3">Sector</th>
                    <th className="py-2.5 px-3">Progress</th>
                  </>
                )}
                {activeTable === 'activity_logs' && (
                  <>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Entity</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">User</th>
                  </>
                )}
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No matching records found in table
                  </td>
                </tr>
              ) : (
                rows.map((row: any) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                      {row.id}
                    </td>

                    {/* Team Columns */}
                    {activeTable === 'team_members' && (
                      <>
                        <td className="py-2 px-3 font-semibold text-slate-900">{row.name}</td>
                        <td className="py-2 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#0c2461] border border-blue-200">
                            {row.designation}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[11px] truncate max-w-xs">
                          {row.institution}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500">{row.order}</td>
                      </>
                    )}

                    {/* Users Columns */}
                    {activeTable === 'users' && (
                      <>
                        <td className="py-2 px-3 font-semibold text-slate-900">{row.name}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{row.email}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              row.role === 'Admin'
                                ? 'bg-emerald-100 text-emerald-800'
                                : row.role === 'Moderator'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {row.role}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}

                    {/* News Columns */}
                    {activeTable === 'news_articles' && (
                      <>
                        <td className="py-2 px-3 font-semibold text-slate-900 max-w-xs truncate">
                          {row.title}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500 text-[11px] truncate max-w-xs">
                          {row.slug}
                        </td>
                        <td className="py-2 px-3 uppercase text-[10px] font-bold text-slate-600">
                          {row.category}
                        </td>
                        <td className="py-2 px-3 uppercase text-[10px] font-bold text-emerald-600">
                          {row.status}
                        </td>
                      </>
                    )}

                    {/* Vacancies Columns */}
                    {activeTable === 'vacancies' && (
                      <>
                        <td className="py-2 px-3 font-semibold text-slate-900 max-w-xs truncate">
                          {row.title}
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            {row.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                          {row.deadline}
                        </td>
                        <td className="py-2 px-3 uppercase text-[10px] font-bold text-emerald-600">
                          {row.status}
                        </td>
                      </>
                    )}

                    {/* Objectives Columns */}
                    {activeTable === 'research_objectives' && (
                      <>
                        <td className="py-2 px-3 font-semibold text-slate-900 max-w-xs truncate">
                          {row.title}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{row.researcher}</td>
                        <td className="py-2 px-3 text-slate-600">{row.sector}</td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-600">
                          {row.progress}%
                        </td>
                      </>
                    )}

                    {/* Activities Columns */}
                    {activeTable === 'activity_logs' && (
                      <>
                        <td className="py-2 px-3 font-semibold text-[#0c2461]">{row.action}</td>
                        <td className="py-2 px-3 text-slate-600">{row.entity}</td>
                        <td className="py-2 px-3 font-mono text-slate-600 max-w-xs truncate">
                          {row.targetName}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{row.user}</td>
                      </>
                    )}

                    {/* Action buttons */}
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRowJson(row)}
                          title="Inspect JSON record"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && activeTable !== 'activity_logs' && (
                          <button
                            onClick={() => handleDeleteRow(row.id, row.name || row.title || row.id)}
                            title="Direct SQL DELETE row"
                            className="p-1 rounded text-red-400 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Record Inspector Modal */}
      {selectedRowJson && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#0c2461]" />
                <h3 className="font-bold text-sm text-[#0c2461]">
                  Record Inspector: public.{activeTable} ({selectedRowJson.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRowJson(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="mt-4 p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto max-h-96">
              {JSON.stringify(selectedRowJson, null, 2)}
            </pre>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedRowJson(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
