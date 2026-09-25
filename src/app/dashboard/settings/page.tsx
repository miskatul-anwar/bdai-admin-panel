'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAdmin } from '@/lib/store';
import { api } from '@/lib/api';
import ImageUpload from '@/components/ui/ImageUpload';
import {
  Settings,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Database,
  Info,
  Server,
  Building,
  Lock,
  CheckCircle2,
  Save,
  BarChart3,
  Globe,
  Users2,
  FolderGit2,
  BookOpen,
  FileText,
  Mail,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function SettingsPageContent() {
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
    settings,
    updateSiteSetting,
    refreshBackendData,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'stats' | 'hero' | 'about' | 'sectors' | 'partners' | 'work_packages' | 'publications' | 'reports' | 'contact' | 'system'>('stats');
  const [saving, setSaving] = useState<string | null>(null);

  const searchParams = useSearchParams();

  // Sync tab from URL if ?tab=partners etc.
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['stats', 'hero', 'about', 'sectors', 'partners', 'work_packages', 'publications', 'reports', 'contact', 'system'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // Local editable states synced from settings
  const [statsData, setStatsData] = useState<any[]>([]);
  const [heroData, setHeroData] = useState<any>({});
  const [aboutData, setAboutData] = useState<any>({});
  const [sectorsData, setSectorsData] = useState<any[]>([]);
  const [partnersData, setPartnersData] = useState<any[]>([]);
  const [wpData, setWpData] = useState<any[]>([]);
  const [pubData, setPubData] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any[]>([]);
  const [contactData, setContactData] = useState<any>({});

  // Sync from settings whenever settings updates
  useEffect(() => {
    if (settings) {
      if (Array.isArray(settings.hero_stats)) setStatsData(settings.hero_stats);
      if (settings.hero_content) setHeroData(settings.hero_content);
      if (settings.about) setAboutData(settings.about);
      if (Array.isArray(settings.sectors)) setSectorsData(settings.sectors);
      if (Array.isArray(settings.partners)) setPartnersData(settings.partners);
      if (Array.isArray(settings.work_packages)) setWpData(settings.work_packages);
      if (Array.isArray(settings.publications)) setPubData(settings.publications);
      if (Array.isArray(settings.reports)) setReportsData(settings.reports);
      if (settings.contact) setContactData(settings.contact);
    }
  }, [settings]);

  const handleSave = async (sectionId: string, dataToSave: any) => {
    try {
      setSaving(sectionId);
      await updateSiteSetting(sectionId, dataToSave);
      // Synchronize directly with backend API as well
      try {
        await api.updateSetting(sectionId, dataToSave);
      } catch {
        // Direct DB update already succeeded
      }
    } catch {
      // error handled in store toast
    } finally {
      setSaving(null);
    }
  };

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
    <div className="space-y-6 max-w-6xl pb-16">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0c2461] flex items-center justify-center text-white shadow-sm shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0c2461]">Portal Settings &amp; Content</h1>
            <p className="text-sm text-gray-500">
              Manage dynamic statistics, text, consortium members, and deliverables stored in Supabase PostgreSQL
            </p>
          </div>
        </div>

        <button
          onClick={() => refreshBackendData(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold self-start sm:self-auto transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reload From DB</span>
        </button>
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar overscroll-contain">
        {[
          { id: 'stats', label: 'Key Metrics & Numbers', icon: BarChart3 },
          { id: 'hero', label: 'Hero Banner', icon: Sparkles },
          { id: 'about', label: 'Vision & Mission', icon: Globe },
          { id: 'sectors', label: 'Target Sectors', icon: FolderGit2 },
          { id: 'partners', label: 'Consortium Partners', icon: Users2 },
          { id: 'work_packages', label: 'Work Packages', icon: Building },
          { id: 'publications', label: 'Publications', icon: BookOpen },
          { id: 'reports', label: 'Reports & Deliverables', icon: FileText },
          { id: 'contact', label: 'Contact & Metadata', icon: Mail },
          { id: 'system', label: 'System & Security', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#0c2461] text-white shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab 1: Key Metrics & Numbers (hero_stats) ───────────── */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0c2461] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0c2461]" />
                Live Metric Stats (Frontpage Numbers)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Every single metric card displayed across the portal. Change values, labels, and sub-labels in real-time.
              </p>
            </div>
            <button
              onClick={() => handleSave('hero_stats', statsData)}
              disabled={saving === 'hero_stats'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'hero_stats' ? 'Saving to DB...' : 'Save All Stats'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statsData.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Card #{idx + 1}</span>
                  <button
                    onClick={() => {
                      const updated = statsData.filter((_, i) => i !== idx);
                      setStatsData(updated);
                    }}
                    className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Number / Value</label>
                    <input
                      type="text"
                      value={stat.value || ''}
                      onChange={(e) => {
                        const updated = [...statsData];
                        updated[idx].value = e.target.value;
                        setStatsData(updated);
                      }}
                      className="w-full text-lg font-bold font-mono px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[#0c2461] focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                      placeholder="e.g. 20+"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Color Theme</label>
                    <select
                      value={stat.color || 'blue'}
                      onChange={(e) => {
                        const updated = [...statsData];
                        updated[idx].color = e.target.value;
                        setStatsData(updated);
                      }}
                      className="w-full text-xs font-medium px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                    >
                      <option value="emerald">Emerald</option>
                      <option value="blue">Blue</option>
                      <option value="violet">Violet</option>
                      <option value="amber">Amber</option>
                      <option value="rose">Rose</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Stat Label</label>
                  <input
                    type="text"
                    value={stat.label || ''}
                    onChange={(e) => {
                      const updated = [...statsData];
                      updated[idx].label = e.target.value;
                      setStatsData(updated);
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                    placeholder="e.g. Researchers & Engineers"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sub-label / Description</label>
                  <input
                    type="text"
                    value={stat.sub || ''}
                    onChange={(e) => {
                      const updated = [...statsData];
                      updated[idx].sub = e.target.value;
                      setStatsData(updated);
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                    placeholder="e.g. Faculty, Fellows & Associates"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setStatsData([...statsData, { label: 'New Metric', value: '10+', sub: 'Description', color: 'blue' }]);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Metric Card</span>
          </button>
        </div>
      )}

      {/* ── Tab 2: Hero Content (hero_content) ─────────────────── */}
      {activeTab === 'hero' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0c2461] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0c2461]" />
                Main Portal Hero Banner
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize the top title, highlighted keywords, sub-heading, and CTA buttons on the public portal.
              </p>
            </div>
            <button
              onClick={() => handleSave('hero_content', heroData)}
              disabled={saving === 'hero_content'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'hero_content' ? 'Saving to DB...' : 'Save Hero Content'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Top Badge Pill</label>
              <input
                type="text"
                value={heroData.badge || ''}
                onChange={(e) => setHeroData({ ...heroData, badge: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                placeholder="e.g. HEAT-13211-CU ATF Sub-Project (UGC Bangladesh & World Bank)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Main Heading (Prefix)</label>
                <input
                  type="text"
                  value={heroData.title || ''}
                  onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                  placeholder="e.g. Empowering Bangladesh through"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Highlighted Heading (Gradient Text)</label>
                <input
                  type="text"
                  value={heroData.title_highlight || ''}
                  onChange={(e) => setHeroData({ ...heroData, title_highlight: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                  placeholder="e.g. Applied AI Innovation"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Mission Pitch</label>
              <textarea
                rows={3}
                value={heroData.subtitle || ''}
                onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                placeholder="Describe project mission statement..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-[#0c2461]">Primary CTA Button</span>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Button Text</label>
                  <input
                    type="text"
                    value={heroData.primary_btn_text || ''}
                    onChange={(e) => setHeroData({ ...heroData, primary_btn_text: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    placeholder="Explore Work Packages"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Target Route / URL</label>
                  <input
                    type="text"
                    value={heroData.primary_btn_url || ''}
                    onChange={(e) => setHeroData({ ...heroData, primary_btn_url: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    placeholder="/work-packages"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-[#0c2461]">Secondary CTA Button</span>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Button Text</label>
                  <input
                    type="text"
                    value={heroData.secondary_btn_text || ''}
                    onChange={(e) => setHeroData({ ...heroData, secondary_btn_text: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    placeholder="Consortium Partners"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Target Route / URL</label>
                  <input
                    type="text"
                    value={heroData.secondary_btn_url || ''}
                    onChange={(e) => setHeroData({ ...heroData, secondary_btn_url: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    placeholder="/consortium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: About & Vision (about) ───────────────────────── */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0c2461] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#0c2461]" />
                Vision, Mission &amp; Research Areas
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Define the high-level objectives, vision, and core AI research tracks.
              </p>
            </div>
            <button
              onClick={() => handleSave('about', aboutData)}
              disabled={saving === 'about'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'about' ? 'Saving to DB...' : 'Save About & Vision'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Vision Statement</label>
              <textarea
                rows={3}
                value={aboutData.vision || ''}
                onChange={(e) => setAboutData({ ...aboutData, vision: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                placeholder="State the vision for BDAI..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mission Statement</label>
              <textarea
                rows={3}
                value={aboutData.mission || ''}
                onChange={(e) => setAboutData({ ...aboutData, mission: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                placeholder="State the mission for BDAI..."
              />
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-[#0c2461] block mb-2">Research Focus Areas</label>
              <div className="space-y-3">
                {(aboutData.research_areas || []).map((area: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Focus Area #{idx + 1}</span>
                      <button
                        onClick={() => {
                          const updated = (aboutData.research_areas || []).filter((_: any, i: number) => i !== idx);
                          setAboutData({ ...aboutData, research_areas: updated });
                        }}
                        className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={area.title || ''}
                      onChange={(e) => {
                        const updated = [...(aboutData.research_areas || [])];
                        updated[idx].title = e.target.value;
                        setAboutData({ ...aboutData, research_areas: updated });
                      }}
                      className="w-full text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none"
                      placeholder="Title (e.g. Natural Language Processing)"
                    />
                    <textarea
                      rows={2}
                      value={area.desc || ''}
                      onChange={(e) => {
                        const updated = [...(aboutData.research_areas || [])];
                        updated[idx].desc = e.target.value;
                        setAboutData({ ...aboutData, research_areas: updated });
                      }}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none"
                      placeholder="Description of this research track..."
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const current = aboutData.research_areas || [];
                  setAboutData({
                    ...aboutData,
                    research_areas: [...current, { title: 'New Area', desc: 'Description' }],
                  });
                }}
                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Research Area</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Target Sectors (sectors) ────────────────────── */}
      {activeTab === 'sectors' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0c2461] flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#0c2461]" />
                Target National Priority Sectors
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Edit the 5 primary focus domains (Socio-Economics, Agriculture, Healthcare, Education, Tourism).
              </p>
            </div>
            <button
              onClick={() => handleSave('sectors', sectorsData)}
              disabled={saving === 'sectors'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'sectors' ? 'Saving to DB...' : 'Save Sectors'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {sectorsData.map((sec, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0c2461]">
                    Sector #{idx + 1}: {sec.name || 'Untitled'}
                  </span>
                  <button
                    onClick={() => {
                      const updated = sectorsData.filter((_, i) => i !== idx);
                      setSectorsData(updated);
                    }}
                    className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sector Name (English)</label>
                    <input
                      type="text"
                      value={sec.name || ''}
                      onChange={(e) => {
                        const updated = [...sectorsData];
                        updated[idx].name = e.target.value;
                        setSectorsData(updated);
                      }}
                      className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Bengali Title (বাংলা)</label>
                    <input
                      type="text"
                      value={sec.bengali || ''}
                      onChange={(e) => {
                        const updated = [...sectorsData];
                        updated[idx].bengali = e.target.value;
                        setSectorsData(updated);
                      }}
                      className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Color Theme</label>
                    <select
                      value={sec.color || 'blue'}
                      onChange={(e) => {
                        const updated = [...sectorsData];
                        updated[idx].color = e.target.value;
                        setSectorsData(updated);
                      }}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    >
                      <option value="blue">Blue</option>
                      <option value="emerald">Emerald</option>
                      <option value="rose">Rose</option>
                      <option value="amber">Amber</option>
                      <option value="indigo">Indigo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Description &amp; Goals</label>
                  <textarea
                    rows={2}
                    value={sec.desc || ''}
                    onChange={(e) => {
                      const updated = [...sectorsData];
                      updated[idx].desc = e.target.value;
                      setSectorsData(updated);
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setSectorsData([
                  ...sectorsData,
                  { id: `sector-${Date.now()}`, name: 'New Sector', bengali: 'নতুন খাত', desc: 'Description', color: 'blue', icon: 'Compass' },
                ]);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Sector</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 5: Consortium Partners (partners) ──────────────── */}
      {activeTab === 'partners' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0c2461] flex items-center gap-2">
                <Users2 className="w-4 h-4 text-[#0c2461]" />
                Consortium Partners &amp; Affiliates
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage consortium institutions, logos, roles, and descriptions shown on both Home and Consortium pages.
              </p>
            </div>
            <button
              onClick={() => handleSave('partners', partnersData)}
              disabled={saving === 'partners'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'partners' ? 'Saving to DB...' : 'Save Partners'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {partnersData.map((part, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0c2461] uppercase tracking-wider">
                    Partner #{idx + 1}: {part.name || 'Untitled'}
                  </span>
                  <button
                    onClick={() => {
                      const updated = partnersData.filter((_, i) => i !== idx);
                      setPartnersData(updated);
                    }}
                    className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Organization Name</label>
                    <input
                      type="text"
                      value={part.name || ''}
                      onChange={(e) => {
                        const updated = [...partnersData];
                        updated[idx].name = e.target.value;
                        setPartnersData(updated);
                      }}
                      className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Partner Type / Tag</label>
                    <input
                      type="text"
                      value={part.type || ''}
                      onChange={(e) => {
                        const updated = [...partnersData];
                        updated[idx].type = e.target.value;
                        setPartnersData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                      placeholder="e.g. Lead R&D Facility"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Role / Department</label>
                    <input
                      type="text"
                      value={part.role || ''}
                      onChange={(e) => {
                        const updated = [...partnersData];
                        updated[idx].role = e.target.value;
                        setPartnersData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <ImageUpload
                      value={part.logo || ''}
                      onChange={(url) => {
                        const updated = [...partnersData];
                        updated[idx].logo = url;
                        setPartnersData(updated);
                      }}
                      label="Organization Logo"
                      folder="partners"
                      helperText="Upload official logo to Cloudinary or specify URL"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Official Website URL</label>
                    <input
                      type="text"
                      value={part.url || part.website || ''}
                      onChange={(e) => {
                        const updated = [...partnersData];
                        updated[idx].url = e.target.value;
                        updated[idx].website = e.target.value;
                        setPartnersData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Description / Mission</label>
                  <textarea
                    rows={2}
                    value={part.desc || part.description || ''}
                    onChange={(e) => {
                      const updated = [...partnersData];
                      updated[idx].desc = e.target.value;
                      updated[idx].description = e.target.value;
                      setPartnersData(updated);
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setPartnersData([
                  ...partnersData,
                  { name: 'New Organization', type: 'Collaborator', role: 'Role Details', logo: '/partners/cu.png', desc: 'Description', url: '#' },
                ]);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Partner Organization</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 6: Work Packages (work_packages) ───────────────── */}
      {activeTab === 'work_packages' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0c2461] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0c2461]" />
                HEAT Work Packages (WP1 - WP5)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Modify work package titles, lead investigators, objectives, milestones, and task deliverables.
              </p>
            </div>
            <button
              onClick={() => handleSave('work_packages', wpData)}
              disabled={saving === 'work_packages'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'work_packages' ? 'Saving to DB...' : 'Save Work Packages'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {wpData.map((wp, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0c2461] uppercase tracking-wider">
                    {wp.id || `WP${idx + 1}`}: {wp.title || 'Untitled'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Package ID</label>
                    <input
                      type="text"
                      value={wp.id || ''}
                      onChange={(e) => {
                        const updated = [...wpData];
                        updated[idx].id = e.target.value;
                        setWpData(updated);
                      }}
                      className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Lead Investigator</label>
                    <input
                      type="text"
                      value={wp.lead || ''}
                      onChange={(e) => {
                        const updated = [...wpData];
                        updated[idx].lead = e.target.value;
                        setWpData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Status</label>
                    <select
                      value={wp.status || 'Active'}
                      onChange={(e) => {
                        const updated = [...wpData];
                        updated[idx].status = e.target.value;
                        setWpData(updated);
                      }}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Planned">Planned</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Full Title</label>
                  <input
                    type="text"
                    value={wp.title || ''}
                    onChange={(e) => {
                      const updated = [...wpData];
                      updated[idx].title = e.target.value;
                      setWpData(updated);
                    }}
                    className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Primary Objective</label>
                  <textarea
                    rows={2}
                    value={wp.objective || ''}
                    onChange={(e) => {
                      const updated = [...wpData];
                      updated[idx].objective = e.target.value;
                      setWpData(updated);
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 7: Publications (publications) ─────────────────── */}
      {activeTab === 'publications' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0c2461] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0c2461]" />
                Scientific Publications
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Add, remove, and modify peer-reviewed journal &amp; conference publications.
              </p>
            </div>
            <button
              onClick={() => handleSave('publications', pubData)}
              disabled={saving === 'publications'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'publications' ? 'Saving to DB...' : 'Save Publications'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {pubData.map((pub, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0c2461] uppercase tracking-wider">
                    Paper #{idx + 1}: {pub.title || 'Untitled'}
                  </span>
                  <button
                    onClick={() => {
                      const updated = pubData.filter((_, i) => i !== idx);
                      setPubData(updated);
                    }}
                    className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Paper Title</label>
                  <input
                    type="text"
                    value={pub.title || ''}
                    onChange={(e) => {
                      const updated = [...pubData];
                      updated[idx].title = e.target.value;
                      setPubData(updated);
                    }}
                    className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Authors (comma separated)</label>
                    <input
                      type="text"
                      value={pub.authors || ''}
                      onChange={(e) => {
                        const updated = [...pubData];
                        updated[idx].authors = e.target.value;
                        setPubData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Venue / Journal</label>
                    <input
                      type="text"
                      value={pub.venue || ''}
                      onChange={(e) => {
                        const updated = [...pubData];
                        updated[idx].venue = e.target.value;
                        setPubData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Year</label>
                    <input
                      type="text"
                      value={pub.year || ''}
                      onChange={(e) => {
                        const updated = [...pubData];
                        updated[idx].year = e.target.value;
                        setPubData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">DOI / Paper URL</label>
                    <input
                      type="text"
                      value={pub.doi_url || ''}
                      onChange={(e) => {
                        const updated = [...pubData];
                        updated[idx].doi_url = e.target.value;
                        setPubData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">PDF URL</label>
                    <input
                      type="text"
                      value={pub.pdf_url || ''}
                      onChange={(e) => {
                        const updated = [...pubData];
                        updated[idx].pdf_url = e.target.value;
                        setPubData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                      placeholder="/papers/... or https://..."
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setPubData([
                  ...pubData,
                  {
                    id: `pub-${Date.now()}`,
                    title: 'New Publication Title',
                    authors: 'BDAI Research Team',
                    venue: 'International Conference / Journal',
                    year: '2025',
                    doi_url: '#',
                    pdf_url: '#',
                  },
                ]);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Publication</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 8: Reports & Deliverables (reports) ─────────────── */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0c2461] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0c2461]" />
                Deliverables, Annual Reports &amp; Policy Briefs
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage downloadable project documents, milestone briefs, and quarterly progress reports.
              </p>
            </div>
            <button
              onClick={() => handleSave('reports', reportsData)}
              disabled={saving === 'reports'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'reports' ? 'Saving to DB...' : 'Save Reports'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {reportsData.map((rep, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0c2461] uppercase tracking-wider">
                    Report #{idx + 1}: {rep.title || 'Untitled'}
                  </span>
                  <button
                    onClick={() => {
                      const updated = reportsData.filter((_, i) => i !== idx);
                      setReportsData(updated);
                    }}
                    className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Document Title</label>
                  <input
                    type="text"
                    value={rep.title || ''}
                    onChange={(e) => {
                      const updated = [...reportsData];
                      updated[idx].title = e.target.value;
                      setReportsData(updated);
                    }}
                    className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Work Package</label>
                    <input
                      type="text"
                      value={rep.wp || ''}
                      onChange={(e) => {
                        const updated = [...reportsData];
                        updated[idx].wp = e.target.value;
                        setReportsData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                      placeholder="e.g. WP1 or General"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Doc Type</label>
                    <input
                      type="text"
                      value={rep.type || ''}
                      onChange={(e) => {
                        const updated = [...reportsData];
                        updated[idx].type = e.target.value;
                        setReportsData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                      placeholder="e.g. Technical Report"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Date</label>
                    <input
                      type="text"
                      value={rep.date || ''}
                      onChange={(e) => {
                        const updated = [...reportsData];
                        updated[idx].date = e.target.value;
                        setReportsData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                      placeholder="e.g. Q1 2025"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">File Size</label>
                    <input
                      type="text"
                      value={rep.size || ''}
                      onChange={(e) => {
                        const updated = [...reportsData];
                        updated[idx].size = e.target.value;
                        setReportsData(updated);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                      placeholder="e.g. 2.4 MB"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Download URL</label>
                  <input
                    type="text"
                    value={rep.download_url || ''}
                    onChange={(e) => {
                      const updated = [...reportsData];
                      updated[idx].download_url = e.target.value;
                      setReportsData(updated);
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                    placeholder="/reports/... or https://..."
                  />
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setReportsData([
                  ...reportsData,
                  {
                    id: `rep-${Date.now()}`,
                    title: 'New Technical Report',
                    wp: 'WP1',
                    type: 'Milestone Deliverable',
                    date: '2025',
                    size: '1.5 MB',
                    download_url: '#',
                  },
                ]);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Report</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 9: Contact & Metadata (contact) ────────────────── */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0c2461] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0c2461]" />
                Footer, Affiliation &amp; Contact Metadata
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure physical office location, contact emails, subproject grant code, and copyright statement.
              </p>
            </div>
            <button
              onClick={() => handleSave('contact', contactData)}
              disabled={saving === 'contact'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving === 'contact' ? 'Saving to DB...' : 'Save Contact Info'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Physical Office Location</label>
              <input
                type="text"
                value={contactData.office || ''}
                onChange={(e) => setContactData({ ...contactData, office: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Official Project Email</label>
                <input
                  type="email"
                  value={contactData.email || ''}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Grant / Sub-Project Identification</label>
                <input
                  type="text"
                  value={contactData.sub_project || ''}
                  onChange={(e) => setContactData({ ...contactData, sub_project: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Footer Copyright Text</label>
              <input
                type="text"
                value={contactData.copyright || ''}
                onChange={(e) => setContactData({ ...contactData, copyright: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 10: System & Security (Original Settings) ──────── */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Admin Profile Card */}
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

          {/* Admin Authority & Provisioning Policy */}
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
                    Only users with the <strong>Admin</strong> role can add or remove an Admin or Moderator account.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0c2461] block">Rule: Only Admin can Add &amp; Remove All Kinds of Employees</strong>
                  <p className="text-slate-600 mt-0.5">
                    Personnel additions and deletions across all designations are strictly restricted to <strong>Admin</strong> accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Database & Persistence Sandbox */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#0c2461] mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0c2461]" />
              Database Records Count
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
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
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe Local Storage Cache</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading settings...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
