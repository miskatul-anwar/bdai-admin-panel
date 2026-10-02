'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/store';
import { WorkPackageItem, WorkPackageStateImage } from '@/types';
import ImageUpload from '@/components/ui/ImageUpload';
import Modal from '@/components/ui/Modal';
import { apiClient } from '@/lib/api';
import {
  Package,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Calendar,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Eye,
  RefreshCw,
  AlertCircle,
  Target,
  User,
} from 'lucide-react';
import Link from 'next/link';

const DEFAULT_WORK_PACKAGES: WorkPackageItem[] = [
  {
    id: 'WP1',
    number: 1,
    title: 'Infrastructure Development',
    lead: 'Dr. Mohammad Shahadat Hossain',
    status: 'Active',
    objective:
      'Establish a fully equipped physical and digital research lab environment with the necessary hardware, network, and workspace facilities to support all project activities.',
    highlights: [
      'Physical lab fit-out including server hardware and researcher workstations',
      'Secure LAN, internet connectivity, and firewall/security configuration',
      'UPS power protection, backup systems, and IT maintenance procedures',
    ],
    tasks: [
      { id: 'T1.1', label: 'Design and fit out lab interior space (partitioning, lighting, electrical points).' },
      { id: 'T1.2', label: 'Procure and install servers and storage hardware.' },
      { id: 'T1.3', label: 'Set up local area network (LAN), internet connectivity, and firewall/security.' },
      { id: 'T1.4', label: 'Procure and configure researcher workstations and peripherals.' },
      { id: 'T1.5', label: 'Install furnishings and ergonomic workspace equipment.' },
      { id: 'T1.6', label: 'Set up backup, power protection (UPS), and IT maintenance procedures.' },
    ],
    current_state_images: [
      {
        id: 'wp1-default-1',
        url: '/bdai-lab-preview.png',
        caption: 'High-Performance Research Computing & Lab Workstations deployed at BDAI Lab (CU CSE).',
        date: 'September 2026',
      },
    ],
  },
  {
    id: 'WP2',
    number: 2,
    title: 'Sectoral Data Collection & Quality',
    lead: 'Dr. Rudra Pratap Deb Nath',
    status: 'Active',
    objective:
      'Collect, harmonise, and prepare domain-specific datasets across all six sectors (SOCIO-ECO, EDU, ENV, TOUR, HEALTH, AGRI) to feed into the knowledge graph construction pipeline.',
    highlights: [
      'Covers six sectors: SOCIO-ECO, EDU, ENV, TOUR, HEALTH, and AGRI',
      'RDF serialisation and SPARQL-ready dataset preparation',
      'Data sharing agreements and access governance per sector',
    ],
    tasks: [
      { id: 'T2.1', label: 'Identify and inventory data sources per sector.' },
      { id: 'T2.2', label: 'Establish data sharing agreements and access permissions.' },
      { id: 'T2.3', label: 'Acquire and pre-process sectoral datasets.' },
      { id: 'T2.4', label: 'Convert and serialise data to RDF and other target formats.' },
      { id: 'T2.5', label: 'Validate and document datasets for completeness and accuracy.' },
    ],
    current_state_images: [],
  },
  {
    id: 'WP3',
    number: 3,
    title: 'Knowledge Graph Construction',
    lead: 'BDAI Core Research Team',
    status: 'Active',
    objective:
      'Construct, populate, and federate six domain-specific knowledge graphs and integrate them through a shared federation layer with a common meta-model and Digital Twin linkages.',
    highlights: [
      'Six domain-specific knowledge graphs with custom ontologies',
      'Federated SPARQL query engine for cross-domain queries',
      'Digital Twin linkages via simulation and data models',
    ],
    tasks: [
      { id: 'T3.1', label: 'Develop or adopt domain ontologies per sector (SOCIO-ECO KG, EDU KG, ENV KG, TOUR KG, HEALTH KG, AGRI KG).' },
      { id: 'T3.2', label: 'Populate individual domain KGs with data from WP2.' },
      { id: 'T3.3', label: 'Design and implement the Federation Layer meta-model for cross-domain alignment.' },
      { id: 'T3.4', label: 'Build federated SPARQL query engine across all domain KGs.' },
      { id: 'T3.5', label: 'Develop simulation, system, and data models and Digital Twin linkages.' },
    ],
    current_state_images: [],
  },
  {
    id: 'WP4',
    number: 4,
    title: 'Cross Sectoral Analysis over Knowledge Graphs',
    lead: 'BDAI Analytics & AI Group',
    status: 'Active',
    objective:
      'Enable descriptive, diagnostic, predictive, and prescriptive analytical capabilities by executing cross-domain queries and what-if scenario analyses over the federated knowledge graphs built in WP3.',
    highlights: [
      'Cross-sectoral analytics across all six domain knowledge graphs',
      'Federated SPARQL and graph-based pipelines for multi-domain analysis',
      'Interactive dashboards with cross-domain KPIs, visualizations, and decision support',
    ],
    tasks: [
      { id: 'T4.1', label: 'Design cross-sectoral analytical query framework spanning all six domain KGs.' },
      { id: 'T4.2', label: 'Implement federated SPARQL and graph-based analytical pipelines.' },
      { id: 'T4.3', label: 'Integrate LLMs for natural language query interpretation and answer generation.' },
      { id: 'T4.4', label: 'Build interactive analytical dashboards with cross-domain key performance indicators and visualizations.' },
      { id: 'T4.5', label: 'Validate analytical outputs against ground truth data across sectors.' },
    ],
    current_state_images: [],
  },
  {
    id: 'WP5',
    number: 5,
    title: 'askBDAI: AI-Powered User-Friendly Natural Language Interface',
    lead: 'BDAI NLP & Dissemination Unit',
    status: 'Active',
    objective:
      'Develop askBDAI, a natural language interface that allows non-technical users to query the federated knowledge graph platform using everyday language, powered by LLMs, NLI, and AI reasoning over KGs.',
    highlights: [
      'Conversational natural language interface for querying the federated knowledge graph platform',
      'LLM-assisted translation from user intent to SPARQL and graph queries',
      'KG-grounded reasoning with feedback-driven refinement for improved response quality',
    ],
    tasks: [
      { id: 'T5.1', label: 'Design conversational NLI architecture integrating LLMs with the federated KG backend.' },
      { id: 'T5.2', label: 'Develop natural language to SPARQL/graph query translation module.' },
      { id: 'T5.3', label: 'Build context-aware answer generation using KG-grounded LLM reasoning.' },
      { id: 'T5.4', label: 'Iteratively refine NLI based on user feedback and evaluation results.' },
    ],
    current_state_images: [],
  },
];

export default function WorkPackagesManagementPage() {
  const { settings, updateSiteSetting, refreshBackendData, showToast } = useAdmin();

  const [workPackages, setWorkPackages] = useState<WorkPackageItem[]>(DEFAULT_WORK_PACKAGES);
  const [selectedWpIndex, setSelectedWpIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<WorkPackageStateImage | null>(null);

  // New Image Form State
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImageDate, setNewImageDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize from settings
  useEffect(() => {
    if (settings?.work_packages && Array.isArray(settings.work_packages) && settings.work_packages.length > 0) {
      // Merge with defaults to ensure complete fields
      const merged = DEFAULT_WORK_PACKAGES.map((def, idx) => {
        const found = settings.work_packages.find(
          (wp: any) =>
            wp.id?.toLowerCase() === def.id.toLowerCase() ||
            wp.number === def.number ||
            wp.title?.toLowerCase().includes(def.id.toLowerCase())
        );

        if (!found) return def;

        const rawImages = found.current_state_images || found.state_images || found.images || [];
        const stateImages: WorkPackageStateImage[] = Array.isArray(rawImages) && rawImages.length > 0
          ? rawImages.map((img: any, imgIdx: number) => ({
              id: img.id || `img-${idx}-${imgIdx}-${Date.now()}`,
              url: img.url || img.src || '',
              caption: img.caption || '',
              date: img.date || '',
            }))
          : (def.current_state_images || []);

        return {
          id: found.id || def.id,
          number: found.number || def.number,
          title: found.title || def.title,
          lead: found.lead || def.lead,
          status: found.status || def.status,
          objective: found.objective || def.objective,
          highlights: Array.isArray(found.highlights) && found.highlights.length > 0 ? found.highlights : def.highlights,
          tasks: Array.isArray(found.tasks) && found.tasks.length > 0 ? found.tasks : def.tasks,
          current_state_images: stateImages,
        };
      });

      setWorkPackages(merged);
    }
  }, [settings]);

  const currentWp = workPackages[selectedWpIndex] || workPackages[0];

  // Add Image to current WP
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) {
      setFormError('Please upload an image or provide an image URL');
      return;
    }
    if (!newImageCaption.trim()) {
      setFormError('Please provide a caption describing this current state snapshot');
      return;
    }

    setFormError(null);

    const newImageItem: WorkPackageStateImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: newImageUrl.trim(),
      caption: newImageCaption.trim(),
      date: newImageDate.trim() || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    const updatedWps = [...workPackages];
    const targetWp = { ...updatedWps[selectedWpIndex] };
    const currentImages = targetWp.current_state_images ? [...targetWp.current_state_images] : [];
    targetWp.current_state_images = [newImageItem, ...currentImages];
    updatedWps[selectedWpIndex] = targetWp;

    setWorkPackages(updatedWps);

    // Reset Form
    setNewImageUrl('');
    setNewImageCaption('');
    setNewImageDate('');

    showToast(`Snapshot added to ${targetWp.id}. Click "Save Work Packages" to persist changes!`, 'info');
  };

  // Remove Image from current WP
  const handleRemoveImage = (imgId: string) => {
    const updatedWps = [...workPackages];
    const targetWp = { ...updatedWps[selectedWpIndex] };
    targetWp.current_state_images = (targetWp.current_state_images || []).filter((img) => img.id !== imgId);
    updatedWps[selectedWpIndex] = targetWp;
    setWorkPackages(updatedWps);
    showToast('Snapshot removed from local list. Click "Save Work Packages" to publish.', 'info');
  };

  // Reorder Images
  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    const updatedWps = [...workPackages];
    const targetWp = { ...updatedWps[selectedWpIndex] };
    const imgs = [...(targetWp.current_state_images || [])];
    if (toIdx < 0 || toIdx >= imgs.length) return;

    const [moved] = imgs.splice(fromIdx, 1);
    imgs.splice(toIdx, 0, moved);
    targetWp.current_state_images = imgs;
    updatedWps[selectedWpIndex] = targetWp;
    setWorkPackages(updatedWps);
  };

  // Update image caption or date
  const handleUpdateImageField = (imgId: string, field: 'caption' | 'date', val: string) => {
    const updatedWps = [...workPackages];
    const targetWp = { ...updatedWps[selectedWpIndex] };
    targetWp.current_state_images = (targetWp.current_state_images || []).map((img) =>
      img.id === imgId ? { ...img, [field]: val } : img
    );
    updatedWps[selectedWpIndex] = targetWp;
    setWorkPackages(updatedWps);
  };

  // Update general WP details
  const handleUpdateWpField = (field: keyof WorkPackageItem, val: any) => {
    const updatedWps = [...workPackages];
    updatedWps[selectedWpIndex] = {
      ...updatedWps[selectedWpIndex],
      [field]: val,
    };
    setWorkPackages(updatedWps);
  };

  // Save to DB
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await updateSiteSetting('work_packages', workPackages);
      showToast('Work packages and progress snapshots saved successfully to database!', 'success');
    } catch (err: any) {
      showToast(`Save failed: ${err?.message || 'Database error'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Total snapshots count
  const totalSnapshots = workPackages.reduce(
    (acc, wp) => acc + (wp.current_state_images ? wp.current_state_images.length : 0),
    0
  );

  return (
    <div className="space-y-6 max-w-6xl pb-20">
      {/* Page Title & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0c2461] flex items-center justify-center text-white shadow-sm shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-[#0c2461]">Work Packages Management</h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-[#0c2461]">
                WP1 – WP5
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Upload current state photos with captions and manage objectives across all 5 Work Packages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => refreshBackendData(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Reload live data from database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving to DB...' : 'Save Work Packages'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Work Packages</p>
          <p className="text-2xl font-bold text-[#0c2461] mt-0.5">5 Packages</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total State Snapshots</p>
          <p className="text-2xl font-bold text-blue-600 mt-0.5">{totalSnapshots} Uploaded</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Work Packages</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">
            {workPackages.filter((w) => w.status === 'Active').length} Active
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Live Website Status</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Synchronized</span>
          </div>
        </div>
      </div>

      {/* Work Package Selector Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {workPackages.map((wp, idx) => {
            const isSelected = selectedWpIndex === idx;
            const imgCount = wp.current_state_images?.length || 0;
            return (
              <button
                key={wp.id || idx}
                onClick={() => {
                  setSelectedWpIndex(idx);
                  setFormError(null);
                }}
                className={`flex-1 min-w-[150px] sm:min-w-0 px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0c2461] text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#0c2461]'}`}>
                    {wp.id || `WP${idx + 1}`}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : imgCount > 0
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200/70 text-slate-500'
                    }`}
                  >
                    {imgCount} {imgCount === 1 ? 'img' : 'imgs'}
                  </span>
                </div>
                <p
                  className={`text-[11px] truncate font-medium ${
                    isSelected ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {wp.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Selected Work Package Detail & Image Management */}
      <div className="space-y-6">
        {/* WP Top Info Bar */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#0c2461] text-white text-xs font-bold tracking-wide">
                {currentWp.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold">
                {currentWp.status || 'Active'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#0c2461]">{currentWp.title}</h2>
            {currentWp.lead && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Lead: {currentWp.lead}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              href={`/work-packages/${currentWp.id.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* ── SECTION: CURRENT STATE & PROGRESS PHOTOS (FEATURE REQUEST) ───────────────── */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#0c2461] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0c2461]" />
                Current State Images &amp; Captions for {currentWp.id}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload photos documenting the real-time implementation state, equipment, meetings, or research breakthroughs.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0c2461] font-semibold text-xs self-start sm:self-auto">
              {currentWp.current_state_images?.length || 0} Snapshots Attached
            </span>
          </div>

          {/* Form to Add New State Image */}
          <form
            onSubmit={handleAddImage}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0c2461] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                Upload New Progress Snapshot
              </span>
              <span className="text-[11px] text-slate-500">Image will appear in public WP gallery</span>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image Upload Component with Cloudinary Direct Upload */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <ImageUpload
                  value={newImageUrl}
                  onChange={(url) => {
                    setNewImageUrl(url);
                    if (formError) setFormError(null);
                  }}
                  label="State Photo / Snapshot *"
                  folder="work_packages"
                  helperText="Upload image file to Cloudinary or specify external image URL"
                />
              </div>

              {/* Caption & Date Inputs */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Caption / Description *
                  </label>
                  <textarea
                    rows={3}
                    value={newImageCaption}
                    onChange={(e) => {
                      setNewImageCaption(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="e.g. Server rack installation completed at CSE Research Lab with dual redundant UPS power."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Milestone / Date (Optional)
                  </label>
                  <input
                    type="text"
                    value={newImageDate}
                    onChange={(e) => setNewImageDate(e.target.value)}
                    placeholder="e.g. October 2026 or 2026-10-02"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Snapshot to {currentWp.id}</span>
              </button>
            </div>
          </form>

          {/* Current Images Gallery / List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Existing Snapshots for {currentWp.id} ({currentWp.current_state_images?.length || 0})
            </h4>

            {(!currentWp.current_state_images || currentWp.current_state_images.length === 0) ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No progress snapshots uploaded yet for {currentWp.id}</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Use the upload form above to add photographs showing the current state of this work package.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentWp.current_state_images.map((img, imgIdx) => (
                  <div
                    key={img.id || imgIdx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 relative group transition-all hover:border-slate-300"
                  >
                    {/* Image Preview & Quick Actions */}
                    <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-slate-200">
                      <img
                        src={img.url}
                        alt={img.caption || 'WP Snapshot'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        {img.date && (
                          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-blue-300" />
                            {img.date}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setPreviewImage(img)}
                          className="p-1 rounded-md bg-white/90 hover:bg-white text-slate-700 shadow-xs cursor-pointer transition-colors"
                          title="View Fullscreen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="p-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer transition-colors"
                          title="Remove snapshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reorder Arrows */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-slate-900/70 backdrop-blur-xs rounded-md p-0.5 text-white">
                        <button
                          type="button"
                          disabled={imgIdx === 0}
                          onClick={() => handleMoveImage(imgIdx, imgIdx - 1)}
                          className="p-0.5 hover:text-blue-300 disabled:opacity-30 cursor-pointer"
                          title="Move earlier"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={imgIdx === (currentWp.current_state_images?.length || 1) - 1}
                          onClick={() => handleMoveImage(imgIdx, imgIdx + 1)}
                          className="p-0.5 hover:text-blue-300 disabled:opacity-30 cursor-pointer"
                          title="Move later"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Editable Caption */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Caption
                      </label>
                      <textarea
                        rows={2}
                        value={img.caption || ''}
                        onChange={(e) => handleUpdateImageField(img.id, 'caption', e.target.value)}
                        placeholder="Caption describing snapshot..."
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0c2461]"
                      />
                    </div>

                    {/* Editable Date */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Date / Milestone
                      </label>
                      <input
                        type="text"
                        value={img.date || ''}
                        onChange={(e) => handleUpdateImageField(img.id, 'date', e.target.value)}
                        placeholder="e.g. October 2026"
                        className="w-full text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0c2461]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION: WORK PACKAGE DETAILS & OBJECTIVES ───────────────── */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#0c2461] flex items-center gap-2">
                <Target className="w-4 h-4 text-[#0c2461]" />
                Package Scope &amp; Objectives ({currentWp.id})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Edit title, status, lead investigator, and core research objectives.
              </p>
            </div>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0c2461] font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Package ID</label>
              <input
                type="text"
                value={currentWp.id}
                onChange={(e) => handleUpdateWpField('id', e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Lead Investigator</label>
              <input
                type="text"
                value={currentWp.lead || ''}
                onChange={(e) => handleUpdateWpField('lead', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
              <select
                value={currentWp.status || 'Active'}
                onChange={(e) => handleUpdateWpField('status', e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
              >
                <option value="Active">Active</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Planned">Planned</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Package Title</label>
            <input
              type="text"
              value={currentWp.title}
              onChange={(e) => handleUpdateWpField('title', e.target.value)}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Objective</label>
            <textarea
              rows={3}
              value={currentWp.objective}
              onChange={(e) => handleUpdateWpField('objective', e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2461]"
            />
          </div>
        </div>
      </div>

      {/* Lightbox / Preview Modal */}
      {previewImage && (
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title={`Snapshot Preview (${currentWp.id})`}
        >
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200 max-h-[60vh] flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.caption || 'Preview'}
                className="max-h-[60vh] w-auto max-w-full object-contain mx-auto"
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              {previewImage.date && (
                <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{previewImage.date}</span>
                </div>
              )}
              <p className="text-sm text-slate-700 font-medium">{previewImage.caption}</p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
