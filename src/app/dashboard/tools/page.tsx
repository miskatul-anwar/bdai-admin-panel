'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { Tool } from '@/types';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Code2,
  FileText,
  Video,
  Globe,
  Sparkles,
  Layers,
  AlertCircle,
} from 'lucide-react';

export default function ToolsManagementPage() {
  const { tools, addTool, updateTool, deleteTool, canEdit, canDelete } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    abstract: '',
    paperUrl: '',
    sourceUrl: '',
    platformUrl: '',
    videoUrl: '',
    imageUrl: '',
    authors: '',
    featuresText: '',
    order: 1,
    badge: 'Tool Showcase',
  });

  const handleOpenAdd = () => {
    setEditingTool(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      abstract: '',
      paperUrl: '',
      sourceUrl: '',
      platformUrl: '',
      videoUrl: '',
      imageUrl: '',
      authors: '',
      featuresText: '',
      order: (tools.length || 0) + 1,
      badge: 'Tool Showcase',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tool: Tool) => {
    setEditingTool(tool);
    setFormData({
      title: tool.title || '',
      subtitle: tool.subtitle || '',
      description: tool.description || '',
      abstract: tool.abstract || '',
      paperUrl: tool.paperUrl || '',
      sourceUrl: tool.sourceUrl || '',
      platformUrl: tool.platformUrl || '',
      videoUrl: tool.videoUrl || '',
      imageUrl: tool.imageUrl || '',
      authors: tool.authors || '',
      featuresText: Array.isArray(tool.features) ? tool.features.join(', ') : '',
      order: tool.order || 1,
      badge: tool.badge || 'Tool Showcase',
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (tool: Tool) => {
    setToolToDelete(tool);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSaving(true);
    try {
      const features = formData.featuresText
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || undefined,
        description: formData.description.trim(),
        abstract: formData.abstract.trim() || undefined,
        paperUrl: formData.paperUrl.trim() || undefined,
        sourceUrl: formData.sourceUrl.trim() || undefined,
        platformUrl: formData.platformUrl.trim() || undefined,
        videoUrl: formData.videoUrl.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        authors: formData.authors.trim() || undefined,
        features: features.length > 0 ? features : undefined,
        order: Number(formData.order) || 1,
        badge: formData.badge.trim() || undefined,
      };

      if (editingTool) {
        await updateTool(editingTool.id, payload);
      } else {
        await addTool(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save tool:', err);
      alert('Failed to save tool. Please check your network and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!toolToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTool(toolToDelete.id);
      setIsDeleteModalOpen(false);
      setToolToDelete(null);
    } catch (err) {
      console.error('Failed to delete tool:', err);
      alert('Failed to delete tool. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered tools
  const filteredTools = tools
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      return (
        t.title?.toLowerCase().includes(q) ||
        t.subtitle?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.authors?.toLowerCase().includes(q) ||
        t.features?.some((f) => f.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const totalWithLive = tools.filter((t) => Boolean(t.platformUrl)).length;
  const totalWithCode = tools.filter((t) => Boolean(t.sourceUrl)).length;
  const totalWithPaper = tools.filter((t) => Boolean(t.paperUrl)).length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0c2461] flex items-center justify-center text-white shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0c2461]">
              Tools & Platforms
            </h1>
            <p className="text-sm text-gray-500">
              Showcase research software, live platforms, and dataset tools
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c2461] hover:bg-[#1e3799] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Tool</span>
          </button>
        )}
      </div>

      {/* ── Metrics Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Tools
            </p>
            <p className="text-xl font-bold text-[#0c2461]">{tools.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Live Platforms
            </p>
            <p className="text-xl font-bold text-[#0c2461]">{totalWithLive}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Open Source
            </p>
            <p className="text-xl font-bold text-[#0c2461]">{totalWithCode}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Publications
            </p>
            <p className="text-xl font-bold text-[#0c2461]">{totalWithPaper}</p>
          </div>
        </div>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tools by title, features, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461] text-slate-800"
          />
        </div>
      </div>

      {/* ── Tools Grid ─────────────────────────────────────────── */}
      {filteredTools.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 mb-1">No Tools Found</h3>
          <p className="text-xs text-slate-400 mb-4">
            {searchQuery
              ? 'No tools matched your search criteria.'
              : 'No tools have been added yet.'}
          </p>
          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0c2461] text-white text-xs font-semibold hover:bg-[#1e3799] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Tool</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:border-slate-200 transition-all"
            >
              {/* Media Preview or Banner */}
              {tool.imageUrl ? (
                <div className="relative h-44 bg-slate-100 border-b border-slate-100 overflow-hidden">
                  <img
                    src={tool.imageUrl}
                    alt={tool.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{tool.badge || 'Showcase'}</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/90 text-[#0c2461] text-[10px] font-bold font-mono">
                    #{tool.order ?? 1}
                  </div>
                </div>
              ) : (
                <div className="relative h-28 bg-gradient-to-br from-slate-900 via-[#0c2461] to-slate-800 p-4 flex flex-col justify-between border-b border-slate-100 text-white">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-semibold text-emerald-300 border border-white/10">
                      <Sparkles className="w-3 h-3" />
                      {tool.badge || 'Showcase'}
                    </span>
                    <span className="text-[10px] font-mono text-white/60 bg-white/10 px-2 py-0.5 rounded">
                      Order #{tool.order ?? 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-blue-300" />
                    <span className="text-xs font-semibold text-white/80 tracking-wide uppercase">
                      Research Platform
                    </span>
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <h3 className="text-base font-bold text-[#0c2461]">{tool.title}</h3>
                      {tool.subtitle && (
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          {tool.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {tool.authors && (
                    <p className="text-[11px] text-slate-400 mb-2 italic">
                      by {tool.authors}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                    {tool.description}
                  </p>

                  {/* Feature Tags */}
                  {tool.features && tool.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tool.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* External Links Bar */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                    {tool.platformUrl && (
                      <a
                        href={tool.platformUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-medium transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Platform</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}
                    {tool.sourceUrl && (
                      <a
                        href={tool.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-medium transition-colors"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>Source Code</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}
                    {tool.paperUrl && (
                      <a
                        href={tool.paperUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-medium transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Paper</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}
                    {tool.videoUrl && (
                      <a
                        href={tool.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-medium transition-colors"
                      >
                        <Video className="w-3 h-3" />
                        <span>Demo Video</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {tool.id}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {canEdit && (
                      <button
                        onClick={() => handleOpenEdit(tool)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0c2461] hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Tool"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleOpenDelete(tool)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Tool"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Tool Modal ───────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTool ? `Edit Tool: ${editingTool.title}` : 'Add New Tool Showcase'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Tool Name / Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="e.g. SETLBI"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Subtitle / Tagline
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="e.g. Software Ecosystem for Transcription..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Badge / Category Label
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="e.g. Tool Showcase, Speech Framework"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Authors / Contributors
            </label>
            <input
              type="text"
              value={formData.authors}
              onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              placeholder="e.g. BDAI Team, CU CSE Researchers"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Short Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              placeholder="Primary summary of the tool or platform..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Extended Abstract / Research Overview (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              placeholder="Detailed architecture overview or paper abstract..."
            />
          </div>

          {/* Cloudinary Image Upload */}
          <div>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              label="Preview / Architecture Image (Cloudinary)"
              folder="bdai/tools"
              helperText="Upload tool screenshot, workflow diagram, or logo to Cloudinary"
            />
          </div>

          {/* External URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Live Platform URL
              </label>
              <input
                type="url"
                value={formData.platformUrl}
                onChange={(e) => setFormData({ ...formData, platformUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Source Code URL (GitHub)
              </label>
              <input
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Paper / Documentation URL
              </label>
              <input
                type="url"
                value={formData.paperUrl}
                onChange={(e) => setFormData({ ...formData, paperUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="https://arxiv.org/..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                YouTube Video Embed URL
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0c2461] mb-1">
              Feature Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={formData.featuresText}
              onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0c2461]"
              placeholder="e.g. Speech Recognition, Bengali Dialects, Annotation Tool"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#0c2461] hover:bg-[#1e3799] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Saving...' : editingTool ? 'Save Changes' : 'Create Tool'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Tool"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="text-xs">
              Are you sure you want to permanently delete{' '}
              <strong className="font-bold">{toolToDelete?.title}</strong>? This action
              cannot be undone and will remove it from the public showcase.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete Tool'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
